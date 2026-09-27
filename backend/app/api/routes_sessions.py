from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..db.models import Conversation, Claim, Speaker, Entity
from ..schemas.session import (
    VoiceTokenResponse,
    ConversationCreate,
    ConversationResponse,
    SessionDetailResponse,
)
from ..schemas.claims import ClaimSchema, EntitySchema
from ..services.voice_agent import VoiceAgentService
from ..services.extraction import ExtractionService
from ..services.resurfacing import ResurfacingService

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.get("/token", response_model=VoiceTokenResponse)
async def get_voice_token(
    user_id: Optional[UUID] = None,
    expires_in: int = Query(300, ge=1, le=600),
    max_duration: int = Query(8640, ge=60, le=10800),
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    token_info = await VoiceAgentService.generate_token(
        db, target_user_id, expires_in, max_duration
    )
    return VoiceTokenResponse(
        token=token_info.get("token", ""),
        agent_id=token_info.get("agent_id"),
        expires_in_seconds=expires_in,
        max_session_duration_seconds=max_duration,
    )

@router.post("", response_model=ConversationResponse)
async def create_session(
    payload: ConversationCreate,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = payload.user_id or UUID(settings.default_user_id)
    conv = Conversation(
        id=uuid4(),
        user_id=target_user_id,
        title=payload.title or f"Session {datetime.now(timezone.utc).strftime('%b %d, %H:%M')}",
        started_at=datetime.now(timezone.utc),
        status="active",
        audio_url=payload.audio_url,
        raw_transcript=payload.raw_transcript,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return ConversationResponse.model_validate(conv)

@router.get("", response_model=List[ConversationResponse])
async def list_sessions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == target_user_id)
        .order_by(Conversation.started_at.desc())
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    convs = res.scalars().all()

    output = []
    for c in convs:
        claim_cnt_stmt = select(func.count(Claim.id)).where(Claim.conversation_id == c.id)
        cnt_res = await db.execute(claim_cnt_stmt)
        count = cnt_res.scalar_one()
        item = ConversationResponse.model_validate(c)
        item.claim_count = count
        output.append(item)
    return output

@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session_detail(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Conversation)
        .where(Conversation.id == session_id)
        .options(
            selectinload(Conversation.claims).selectinload(Claim.entities),
            selectinload(Conversation.claims).selectinload(Claim.task_state),
            selectinload(Conversation.speakers)
        )
    )
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")

    claim_schemas = [ClaimSchema.model_validate(c) for c in conv.claims]
    speaker_data = [
        {"id": str(s.id), "tag": s.diarization_tag, "resolved_name": s.resolved_name}
        for s in conv.speakers
    ]

    all_entities = []
    seen_ent = set()
    for c in conv.claims:
        for e in c.entities:
            if e.id not in seen_ent:
                all_entities.append(EntitySchema.model_validate(e))
                seen_ent.add(e.id)

    return SessionDetailResponse(
        conversation=ConversationResponse.model_validate(conv),
        claims=claim_schemas,
        entities=all_entities,
        speakers=speaker_data,
    )

@router.post("/{session_id}/complete")
async def complete_session(
    session_id: UUID,
    payload: Dict[str, Any] = {},
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Conversation).where(Conversation.id == session_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")

    conv.status = "completed"
    conv.ended_at = datetime.now(timezone.utc)

    external_session_id = payload.get("external_session_id")
    raw_transcript_text = payload.get("transcript_text", "")

    if external_session_id:
        remote_data = await VoiceAgentService.fetch_session(external_session_id)
        if remote_data:
            artifacts = await VoiceAgentService.download_session_artifacts(remote_data)
            if artifacts.get("audio_url"):
                conv.audio_url = artifacts["audio_url"]
            if artifacts.get("timeline"):
                conv.raw_transcript = artifacts["timeline"]
                turns = artifacts["timeline"].get("turns", [])
                lines = []
                for t in turns:
                    user_t = t.get("user_transcript")
                    agent_t = t.get("agent_text")
                    if user_t:
                        lines.append(f"Speaker A: {user_t}")
                    if agent_t:
                        lines.append(f"Muninn: {agent_t}")
                if lines:
                    raw_transcript_text = "\n".join(lines)

    if payload.get("raw_transcript") and not conv.raw_transcript:
        conv.raw_transcript = payload["raw_transcript"]

    await db.commit()

    if raw_transcript_text:
        extraction = await ExtractionService.extract_from_transcript(
            raw_transcript_text, conv.user_id
        )
        persisted = await ExtractionService.persist_extraction(
            db, conv.id, conv.user_id, extraction
        )

        extracted_entity_names = [e.name for e in extraction.entities]
        await ResurfacingService.evaluate_resurfacing(
            db, conv.user_id, conv.id, extracted_entity_names
        )

    return {"status": "completed", "session_id": str(session_id)}

@router.post("/extract-raw")
async def extract_raw_text(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    text_content = payload.get("transcript_text")
    if not text_content:
        raise HTTPException(status_code=400, detail="transcript_text is required")

    user_id = UUID(payload.get("user_id", settings.default_user_id))
    title = payload.get("title", f"Captured Conversation {datetime.now(timezone.utc).strftime('%H:%M')}")

    conv = Conversation(
        id=uuid4(),
        user_id=user_id,
        title=title,
        started_at=datetime.now(timezone.utc),
        ended_at=datetime.now(timezone.utc),
        status="completed",
        raw_transcript={"text": text_content},
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    extraction = await ExtractionService.extract_from_transcript(text_content, user_id)
    persisted = await ExtractionService.persist_extraction(db, conv.id, user_id, extraction)

    extracted_entity_names = [e.name for e in extraction.entities]
    events = await ResurfacingService.evaluate_resurfacing(
        db, user_id, conv.id, extracted_entity_names
    )

    return {
        "conversation_id": str(conv.id),
        "claims_extracted": len(persisted),
        "entities_found": len(extraction.entities),
        "resurfacing_events_triggered": len(events),
    }
