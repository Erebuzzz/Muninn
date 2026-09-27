from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ResurfacingItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    triggered_by_conv: Optional[UUID] = None
    subject_claim_id: Optional[UUID] = None
    subject_claim_text: Optional[str] = None
    message: str
    reason: str
    created_at: datetime
    dismissed: bool
