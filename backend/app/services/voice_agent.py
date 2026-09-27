import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.models import Entity, Speaker

logger = logging.getLogger(__name__)

MUNINN_SYSTEM_PROMPT = (
    "You are Muninn, a quiet listening companion for someone thinking out loud about their work: "
    "a project, a problem, a decision, a plan. Your job during this session is almost entirely "
    "to listen well, not to lead.\n\n"
    "Rules:\n"
    "1. Do not summarize, advise, or interject unless the person pauses and seems to be waiting for a response, or directly asks you something.\n"
    "2. If a statement is ambiguous in a way that would break the record (an unclear referent like 'it', 'that', 'they', a decision without a stated owner, a task without a stated deadline), ask ONE short clarifying question. Do not ask more than one clarifying question per turn.\n"
    "3. Never invent facts, dates, names, or numbers. If you do not have information, say you do not have it.\n"
    "4. Keep every response to one short sentence. This is a capture session, not a conversation with you as the main character.\n"
    "5. If the person says something that sounds financial, medical, or about a third person's private situation, do not comment on it, do not repeat it back, and do not ask about it further than necessary for the record to make sense. Let it pass through to the transcript as-is; downstream systems handle sensitivity, not you.\n"
    "6. If the person explicitly says 'don't record that' or 'off the record', acknowledge briefly and do not treat the following statement as capturable (flag it for exclusion).\n"
    "7. At the start of a session, if this is a fresh start, greet briefly and confirm what is being worked on today in one sentence. Do not recap prior sessions here; that happens outside the call, in the resurfacing feed."
)

class VoiceAgentService:
    BASE_URL = "https://agents.assemblyai.com/v1"

    @classmethod
    async def get_or_create_agent(cls, db: AsyncSession, user_id: UUID) -> Optional[str]:
        if settings.assemblyai_voice_agent_id:
            return settings.assemblyai_voice_agent_id

        if not settings.assemblyai_api_key:
            return None

        keyterms = await cls.get_user_keyterms(db, user_id)

        payload = {
            "name": "Muninn Capture Agent",
            "system_prompt": MUNINN_SYSTEM_PROMPT,
            "greeting": "Muninn is listening. What are you working on?",
            "voice": {"voice_id": "anna"},
            "turn_taking": {
                "silence_threshold_ms": 900,
                "allow_interruptions": True,
            },
            "keyterms": keyterms,
            "tools": [],
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{cls.BASE_URL}/agents",
                    headers={"Authorization": settings.assemblyai_api_key},
                    json=payload,
                )
                if resp.is_success:
                    data = resp.json()
                    agent_id = data.get("id")
                    logger.info("Created Muninn agent %s", agent_id)
                    return agent_id
                else:
                    logger.warning("Failed to create agent: %s %s", resp.status_code, resp.text)
                    return None
        except Exception as e:
            logger.error("Error creating AssemblyAI voice agent: %s", e)
            return None

    @classmethod
    async def get_user_keyterms(cls, db: AsyncSession, user_id: UUID) -> List[str]:
        try:
            stmt = select(Entity.name).where(Entity.user_id == user_id).limit(100)
            res = await db.execute(stmt)
            names = res.scalars().all()
            return [n for n in names if n and len(n.strip()) > 1]
        except Exception as e:
            logger.warning("Could not fetch user keyterms: %s", e)
            return []

    @classmethod
    async def generate_token(
        cls,
        db: AsyncSession,
        user_id: UUID,
        expires_in_seconds: int = 300,
        max_duration_seconds: int = 8640
    ) -> Dict[str, Any]:
        agent_id = await cls.get_or_create_agent(db, user_id)

        if not settings.assemblyai_api_key:
            return {
                "token": "demo-simulation-token",
                "agent_id": agent_id or "demo-agent-id",
                "expires_in_seconds": expires_in_seconds,
                "max_session_duration_seconds": max_duration_seconds,
                "mode": "simulation",
            }

        url = f"{cls.BASE_URL}/token"
        params = {
            "expires_in_seconds": str(min(max(expires_in_seconds, 1), 600)),
            "max_session_duration_seconds": str(min(max(max_duration_seconds, 60), 10800)),
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                url,
                params=params,
                headers={"Authorization": settings.assemblyai_api_key},
            )
            resp.raise_for_status()
            data = resp.json()

        return {
            "token": data.get("token"),
            "agent_id": agent_id,
            "expires_in_seconds": expires_in_seconds,
            "max_session_duration_seconds": max_duration_seconds,
            "mode": "live",
        }

    @classmethod
    async def fetch_session(cls, session_id: str) -> Optional[Dict[str, Any]]:
        if not settings.assemblyai_api_key:
            return None

        url = f"{cls.BASE_URL}/sessions/{session_id}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                url,
                headers={"Authorization": settings.assemblyai_api_key},
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    @classmethod
    async def download_session_artifacts(cls, session_data: Dict[str, Any]) -> Dict[str, Any]:
        artifacts = session_data.get("artifacts", [])
        result: Dict[str, Any] = {"timeline": None, "audio_url": None, "metadata": None}

        async with httpx.AsyncClient(timeout=30.0) as client:
            for item in artifacts:
                item_type = item.get("type")
                url = item.get("url")
                if not url:
                    continue

                if item_type == "timeline":
                    try:
                        timeline_resp = await client.get(url)
                        if timeline_resp.is_success:
                            result["timeline"] = timeline_resp.json()
                    except Exception as e:
                        logger.error("Failed to download timeline artifact: %s", e)
                elif item_type == "audio":
                    result["audio_url"] = url
                elif item_type == "metadata":
                    try:
                        meta_resp = await client.get(url)
                        if meta_resp.is_success:
                            result["metadata"] = meta_resp.json()
                    except Exception as e:
                        logger.error("Failed to download metadata artifact: %s", e)

        return result
