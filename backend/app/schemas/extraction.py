from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class ExtractedEntity(BaseModel):
    type: str = Field(description="One of: project, person, component, system, vendor")
    name: str = Field(description="Name of the entity")

class ExtractedClaim(BaseModel):
    temp_id: str = Field(default="c1", description="Temporary identifier like c1, c2")
    type: str = Field(description="One of: observation, hypothesis, decision, task, question")
    text: str = Field(description="Concise description of the extracted claim")
    speaker: Optional[str] = Field(default="Speaker A", description="Diarization tag or name of speaker")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp or turn marker")
    confidence: Optional[str] = Field(default="unverified", description="verified, unverified, or superseded")
    sensitivity: str = Field(default="none", description="none or flagged")
    entities: List[str] = Field(default_factory=list, description="List of entity names mentioned")

class ExtractedRelationship(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_id: str = Field(alias="from", description="temp_id of source claim")
    to_id: str = Field(alias="to", description="temp_id of target claim")
    type: str = Field(description="One of: blocks, depends_on, resolves, contradicts, supersedes")

class ExtractionResult(BaseModel):
    entities: List[ExtractedEntity] = Field(default_factory=list)
    claims: List[ExtractedClaim] = Field(default_factory=list)
    relationships: List[ExtractedRelationship] = Field(default_factory=list)
