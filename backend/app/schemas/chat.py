from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

class CitationItem(BaseModel):
    claim_id: UUID
    claim_text: str
    claim_type: str
    confidence: Optional[str] = None
    speaker: Optional[str] = None
    timestamp: Optional[str] = None
    conversation_title: Optional[str] = None

class ChatQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[UUID] = None
    max_citations: int = 5

class ChatQueryResponse(BaseModel):
    answer: str
    citations: List[CitationItem] = []
    precedent_found: bool = False
