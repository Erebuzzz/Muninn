from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..db.models import Claim, Relationship, Conversation, Speaker, Entity
from ..schemas.claims import ClaimSchema, ClaimDetailResponse, RelationshipSchema

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.get("", response_model=List[ClaimSchema])
async def list_claims(
    conversation_id: Optional[UUID] = None,
    entity_name: Optional[str] = None,
    claim_type: Optional[str] = None,
    sensitivity: Optional[str] = None,
    user_id: Optional[UUID] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    stmt = (
        select(Claim)
        .join(Claim.conversation)
        .where(Conversation.user_id == target_user_id)
        .options(
            selectinload(Claim.entities),
            selectinload(Claim.task_state),
            selectinload(Claim.speaker)
        )
        .order_by(Claim.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )

    if conversation_id:
        stmt = stmt.where(Claim.conversation_id == conversation_id)
    if claim_type:
        stmt = stmt.where(Claim.type == claim_type)
    if sensitivity:
        stmt = stmt.where(Claim.sensitivity == sensitivity)
    elif not conversation_id:
        stmt = stmt.where(Claim.sensitivity.in_(["none", "confirmed_store"]))

    if entity_name:
        stmt = stmt.join(Claim.entities).where(Entity.name == entity_name)

    res = await db.execute(stmt)
    claims = res.scalars().unique().all()
    return [ClaimSchema.model_validate(c) for c in claims]

@router.get("/{claim_id}", response_model=ClaimDetailResponse)
async def get_claim_detail(
    claim_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Claim)
        .where(Claim.id == claim_id)
        .options(
            selectinload(Claim.entities),
            selectinload(Claim.task_state),
            selectinload(Claim.conversation),
            selectinload(Claim.speaker)
        )
    )
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    incoming_stmt = (
        select(Relationship, Claim.text)
        .join(Claim, Relationship.from_claim_id == Claim.id)
        .where(Relationship.to_claim_id == claim_id)
    )
    in_res = await db.execute(incoming_stmt)
    incoming = []
    for rel, text_val in in_res.all():
        r = RelationshipSchema.model_validate(rel)
        r.target_claim_text = text_val
        incoming.append(r)

    outgoing_stmt = (
        select(Relationship, Claim.text)
        .join(Claim, Relationship.to_claim_id == Claim.id)
        .where(Relationship.from_claim_id == claim_id)
    )
    out_res = await db.execute(outgoing_stmt)
    outgoing = []
    for rel, text_val in out_res.all():
        r = RelationshipSchema.model_validate(rel)
        r.target_claim_text = text_val
        outgoing.append(r)

    return ClaimDetailResponse(
        claim=ClaimSchema.model_validate(claim),
        conversation_title=claim.conversation.title if claim.conversation else None,
        incoming_relationships=incoming,
        outgoing_relationships=outgoing,
    )
