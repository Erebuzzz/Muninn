from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class VoiceTokenResponse(BaseModel):
    token: str
    agent_id: Optional[str] = None
    expires_in_seconds: int = 300
    max_session_duration_seconds: int = 8640

class TimelineTurn(BaseModel):
    turn_id: Optional[str] = None
    item_id: Optional[str] = None
    status: Optional[str] = None
    trigger: Optional[str] = None
    user_transcript: Optional[str] = None
    agent_text: Optional[str] = None
    speaker: Optional[str] = None
    timestamp: Optional[datetime] = None

class ConversationCreate(BaseModel):
    user_id: Optional[UUID] = None
    title: Optional[str] = "Live Muninn Session"
    audio_url: Optional[str] = None
    raw_transcript: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    audio_url: Optional[str] = None
    raw_transcript: Optional[Dict[str, Any]] = None
    status: str
    claim_count: Optional[int] = 0

class SessionDetailResponse(BaseModel):
    conversation: ConversationResponse
    claims: List[Any] = []
    entities: List[Any] = []
    speakers: List[Any] = []
