from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.session import get_db
from ..schemas.chat import ChatQueryRequest, ChatQueryResponse
from ..services.context_engine import ContextEngineService

router = APIRouter(prefix="/chat", tags=["Memory Chat"])

@router.post("", response_model=ChatQueryResponse)
async def query_living_memory(
    payload: ChatQueryRequest,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    target_user_id = user_id or UUID(settings.default_user_id)
    return await ContextEngineService.answer_chat_query(
        db,
        target_user_id,
        payload.query,
        payload.conversation_id,
        payload.max_citations,
    )
