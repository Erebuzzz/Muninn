from typing import Optional, Dict, Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..services.context_engine import ContextEngineService

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

@router.get("/entities")
async def get_entity_graph(
    entity_name: Optional[str] = None,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    return await ContextEngineService.get_entity_graph(
        db, target_user_id, entity_name
    )

@router.get("/dependencies/{claim_id}")
async def get_claim_dependencies(
    claim_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await ContextEngineService.get_dependency_chain(db, claim_id)
