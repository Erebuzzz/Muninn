from uuid import UUID
from typing import List, Literal
from pydantic import BaseModel

class SensitivityReviewDecision(BaseModel):
    claim_id: UUID
    action: Literal["store", "discard"]

class SensitivityReviewRequest(BaseModel):
    decisions: List[SensitivityReviewDecision]

class SensitivityReviewResponse(BaseModel):
    stored_count: int
    discarded_count: int
    status: str = "success"
