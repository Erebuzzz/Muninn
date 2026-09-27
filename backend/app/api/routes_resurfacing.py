from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..db.models import ResurfacingEvent, Claim
from ..schemas.resurfacing import ResurfacingItemResponse
from ..services.resurfacing import ResurfacingService

router = APIRouter(prefix="/resurfacing", tags=["Resurfacing Feed"])

@router.get("", response_model=List[ResurfacingItemResponse])
async def list_resurfacing_events(
    user_id: Optional[UUID] = None,
    include_dismissed: bool = False,
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    stmt = (
        select(ResurfacingEvent)
        .where(ResurfacingEvent.user_id == target_user_id)
        .options(selectinload(ResurfacingEvent.subject_claim))
        .order_by(ResurfacingEvent.created_at.desc())
        .limit(limit)
    )
    if not include_dismissed:
        stmt = stmt.where(ResurfacingEvent.dismissed == False)

    res = await db.execute(stmt)
    events = res.scalars().all()

    output = []
    for e in events:
        item = ResurfacingItemResponse(
            id=e.id,
            user_id=e.user_id,
            triggered_by_conv=e.triggered_by_conv,
            subject_claim_id=e.subject_claim_id,
            subject_claim_text=e.subject_claim.text if e.subject_claim else None,
            message=e.message,
            reason=e.reason,
            created_at=e.created_at,
            dismissed=e.dismissed,
        )
        output.append(item)
    return output

@router.post("/{event_id}/dismiss")
async def dismiss_resurfacing_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ResurfacingEvent).where(ResurfacingEvent.id == event_id)
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.dismissed = True
    await db.commit()
    return {"status": "dismissed", "event_id": str(event_id)}

@router.post("/evaluate")
async def trigger_resurfacing_evaluation(
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    events = await ResurfacingService.evaluate_resurfacing(db, target_user_id)
    return {"status": "ok", "events_generated": len(events)}
