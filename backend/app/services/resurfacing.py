import json
import logging
import re
from typing import Dict, Any, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import httpx
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.models import (
    Claim,
    Entity,
    TaskState,
    ResurfacingEvent,
    Relationship,
)

logger = logging.getLogger(__name__)

RESURFACING_SYSTEM_PROMPT = """You are the Muninn resurfacing engine. You are given:
(1) The entities mentioned in the CURRENT session, and
(2) A set of candidate prior claims retrieved because they share an entity with the current session: open tasks, unresolved questions, and decisions with dependencies.

Your job: identify which candidates are actually relevant to bring up NOW, and phrase each as a short, concrete surfacing note. A note is worth showing only if at least one of these is true:
- "blocked_now_unblocked": A task that was blocked is now plausibly unblocked, based on something said in the current session.
- "reopened_question": A question left open before is being circled back to.
- "conflicting_decision": A new decision in the current session conflicts with a previously stored decision or hypothesis.
- "stale_and_relevant": A task has been open for a long time with no update and shares an entity with what is being discussed right now.

Do NOT surface something just because it shares a topic loosely.
Do NOT surface more than 3 items.
Do NOT invent connections that are not supported by the entity overlap and claim content.
Silence is valid and preferred if nothing clears the bar.

OUTPUT SCHEMA (JSON array):
[
  {
    "subject_claim_id": "<claim uuid>",
    "message": "one or two plain sentences, written as if by a colleague with a good memory, citing concrete facts",
    "reason": "blocked_now_unblocked | reopened_question | conflicting_decision | stale_and_relevant"
  }
]
"""

class ResurfacingService:
    @classmethod
    async def evaluate_resurfacing(
        cls,
        db: AsyncSession,
        user_id: UUID,
        current_conv_id: Optional[UUID] = None,
        entity_names: Optional[List[str]] = None
    ) -> List[ResurfacingEvent]:
        if not entity_names:
            ent_stmt = (
                select(Entity.name)
                .where(Entity.user_id == user_id)
                .order_by(Entity.first_seen_at.desc())
                .limit(10)
            )
            res = await db.execute(ent_stmt)
            entity_names = list(res.scalars().all())

        if not entity_names:
            return []

        claims_stmt = (
            select(Claim)
            .join(Claim.entities)
            .options(selectinload(Claim.entities), selectinload(Claim.task_state))
            .where(
                Entity.name.in_(entity_names),
                Claim.sensitivity.in_(["none", "confirmed_store"]),
                Claim.type.in_(["task", "question", "decision"])
            )
        )
        if current_conv_id:
            claims_stmt = claims_stmt.where(Claim.conversation_id != current_conv_id)

        res = await db.execute(claims_stmt)
        candidate_claims = res.scalars().unique().all()

        if not candidate_claims:
            return []

        candidates_data = [
            {
                "id": str(c.id),
                "type": c.type,
                "text": c.text,
                "status": c.task_state.status if c.task_state else None,
                "entities": [e.name for e in c.entities],
            }
            for c in candidate_claims[:15]
        ]

        surfaced_items = await cls._query_llm_resurfacing(entity_names, candidates_data)
        
        events: List[ResurfacingEvent] = []
        for item in surfaced_items:
            try:
                subject_id = UUID(item["subject_claim_id"])
            except Exception:
                subject_id = candidate_claims[0].id if candidate_claims else None

            event = ResurfacingEvent(
                id=uuid4(),
                user_id=user_id,
                triggered_by_conv=current_conv_id,
                subject_claim_id=subject_id,
                message=item.get("message", "Relevant task resurfaced."),
                reason=item.get("reason", "stale_and_relevant"),
                created_at=datetime.now(timezone.utc),
                dismissed=False,
            )
            db.add(event)
            events.append(event)

            if subject_id:
                for c in candidate_claims:
                    if c.id == subject_id and c.task_state:
                        timestamps = c.task_state.resurfaced_at or []
                        timestamps.append(datetime.now(timezone.utc))
                        c.task_state.resurfaced_at = timestamps

        await db.commit()
        return events

    @classmethod
    async def _query_llm_resurfacing(
        cls,
        current_entities: List[str],
        candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        if not settings.assemblyai_api_key:
            return cls._fallback_resurfacing(current_entities, candidates)

        prompt_input = (
            f"CURRENT SESSION ENTITIES: {', '.join(current_entities)}\n\n"
            f"CANDIDATE CLAIMS:\n{json.dumps(candidates, indent=2)}"
        )

        payload = {
            "model": settings.llm_gateway_model,
            "messages": [
                {"role": "system", "content": RESURFACING_SYSTEM_PROMPT},
                {"role": "user", "content": prompt_input}
            ],
            "temperature": 0.2,
            "max_tokens": 1000,
        }

        headers = {
            "Authorization": f"Bearer {settings.assemblyai_api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.llm_gateway_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = re.sub(r"^```(?:json)?\s*", "", content)
                    content = re.sub(r"\s*```$", "", content)
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    return parsed[:3]
                return []
        except Exception as e:
            logger.error("Resurfacing LLM Gateway call failed: %s", e)
            return cls._fallback_resurfacing(current_entities, candidates)

    @classmethod
    def _fallback_resurfacing(
        cls,
        current_entities: List[str],
        candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        results = []
        for c in candidates:
            overlap = set(current_entities).intersection(set(c.get("entities", [])))
            if overlap:
                ent = list(overlap)[0]
                if c.get("type") == "task" and c.get("status") in ["open", "blocked"]:
                    results.append({
                        "subject_claim_id": c["id"],
                        "message": f"Regarding {ent}: open task '{c['text']}' was discussed previously and remains unfinished.",
                        "reason": "stale_and_relevant",
                    })
                elif c.get("type") == "question":
                    results.append({
                        "subject_claim_id": c["id"],
                        "message": f"Regarding {ent}: unresolved question '{c['text']}' was left open in an earlier conversation.",
                        "reason": "reopened_question",
                    })
                if len(results) >= 2:
                    break
        return results
