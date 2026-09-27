from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..db.models import Claim, Conversation
from ..schemas.claims import ClaimSchema
from ..schemas.review import SensitivityReviewRequest, SensitivityReviewResponse

router = APIRouter(prefix="/review", tags=["Sensitivity Review"])

@router.get("", response_model=List[ClaimSchema])
async def get_pending_review_claims(
    user_id: Optional[UUID] = None,
    conversation_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    stmt = (
        select(Claim)
        .join(Claim.conversation)
        .where(
            Conversation.user_id == target_user_id,
            Claim.sensitivity == "flagged"
        )
        .options(
            selectinload(Claim.entities),
            selectinload(Claim.task_state),
            selectinload(Claim.speaker)
        )
        .order_by(Claim.timestamp.desc())
    )
    if conversation_id:
        stmt = stmt.where(Claim.conversation_id == conversation_id)

    res = await db.execute(stmt)
    claims = res.scalars().unique().all()
    return [ClaimSchema.model_validate(c) for c in claims]

@router.post("", response_model=SensitivityReviewResponse)
async def submit_review_decisions(
    payload: SensitivityReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    stored_count = 0
    discarded_count = 0

    for item in payload.decisions:
        stmt = select(Claim).where(Claim.id == item.claim_id)
        res = await db.execute(stmt)
        claim = res.scalar_one_or_none()
        if not claim:
            continue

        if item.action == "store":
            claim.sensitivity = "confirmed_store"
            stored_count += 1
        else:
            claim.sensitivity = "confirmed_discard"
            discarded_count += 1

    await db.commit()
    return SensitivityReviewResponse(
        stored_count=stored_count,
        discarded_count=discarded_count,
        status="success",
    )

@router.post("/discard-all-pending", response_model=SensitivityReviewResponse)
async def discard_all_pending(
    conversation_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    stmt = (
        select(Claim)
        .join(Claim.conversation)
        .where(
            Conversation.user_id == target_user_id,
            Claim.sensitivity == "flagged"
        )
    )
    if conversation_id:
        stmt = stmt.where(Claim.conversation_id == conversation_id)

    res = await db.execute(stmt)
    claims = res.scalars().all()
    count = len(claims)
    for c in claims:
        c.sensitivity = "confirmed_discard"

    await db.commit()
    return SensitivityReviewResponse(
        stored_count=0,
        discarded_count=count,
        status="success",
    )
