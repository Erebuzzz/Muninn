from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class EntitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    name: str
    first_seen_at: datetime

class RelationshipSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    from_claim_id: UUID
    to_claim_id: UUID
    relation_type: str
    target_claim_text: Optional[str] = None

class TaskStateSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    blocked_by: Optional[UUID] = None
    resurfaced_at: Optional[List[datetime]] = None

class ClaimSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    speaker_id: Optional[UUID] = None
    speaker_tag: Optional[str] = None
    type: str
    text: str
    confidence: Optional[str] = None
    sensitivity: str = "none"
    timestamp: datetime
    entities: List[EntitySchema] = []
    task_state: Optional[TaskStateSchema] = None

class ClaimDetailResponse(BaseModel):
    claim: ClaimSchema
    conversation_title: Optional[str] = None
    incoming_relationships: List[RelationshipSchema] = []
    outgoing_relationships: List[RelationshipSchema] = []

class ClaimFilterParams(BaseModel):
    conversation_id: Optional[UUID] = None
    entity_name: Optional[str] = None
    type: Optional[str] = None
    sensitivity: Optional[str] = None
    status: Optional[str] = None
