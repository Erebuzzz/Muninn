import json
import logging
import re
from typing import Dict, Any, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.models import (
    Conversation,
    Speaker,
    Entity,
    Claim,
    Relationship,
    TaskState,
    claim_entities,
)
from ..schemas.extraction import ExtractionResult, ExtractedClaim, ExtractedEntity, ExtractedRelationship

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """You are the Muninn extraction engine. You are given a timestamped, speaker-tagged transcript of one conversation. Your job is to convert it into structured claims. You do not summarize prose. You output ONLY valid JSON matching the schema below. No preamble, no markdown fences, no commentary.

For every claim you extract, classify its TYPE as exactly one of:
- "observation": something noticed or measured, stated as fact by the speaker
- "hypothesis": a proposed explanation or plan that is not yet confirmed
- "decision": a choice that was made, explicitly
- "task": an action someone said they will do, or that needs doing
- "question": something left open or unresolved

For every claim, set CONFIDENCE to one of "verified", "unverified", "superseded" (superseded only if a later statement in the same transcript directly overrides an earlier one; link them via relationships).

For every claim, set SENSITIVITY to "flagged" if it involves: someone's health, someone's finances, a third party not present in the conversation who did not consent to being discussed, or anything the speaker prefaced with language like "don't share this" or "off the record". Otherwise "none". NEVER omit a claim because it's sensitive; flag it, do not drop it.

Identify RELATIONSHIPS between claims using: "blocks", "depends_on", "resolves", "contradicts", "supersedes". Only assert a relationship when it is stated or directly implied in the transcript; do not infer relationships from general world knowledge.

Extract ENTITIES (type: project | person | component | system | vendor) mentioned across the claims, and link each claim to the entities it references.

If nothing in the transcript is extractable, return an empty claims array. Do not force extraction to justify your existence.

OUTPUT SCHEMA:
{
  "entities": [ { "type": "project", "name": "Project Name" } ],
  "claims": [
    {
      "temp_id": "c1",
      "type": "task",
      "text": "Redesign the heatsink mounting bracket",
      "speaker": "Speaker A",
      "timestamp": "2026-09-27T10:00:00Z",
      "confidence": "unverified",
      "sensitivity": "none",
      "entities": ["Project Name"]
    }
  ],
  "relationships": [
    { "from": "c1", "to": "c2", "type": "depends_on" }
  ]
}
"""

class ExtractionService:
    @classmethod
    async def extract_from_transcript(
        cls,
        transcript_text: str,
        user_id: UUID
    ) -> ExtractionResult:
        if not settings.assemblyai_api_key:
            return cls._fallback_extract(transcript_text)

        payload = {
            "model": settings.llm_gateway_model,
            "messages": [
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Transcript to extract:\n\n{transcript_text}"}
            ],
            "temperature": 0.1,
            "max_tokens": 3000,
        }

        headers = {
            "Authorization": f"Bearer {settings.assemblyai_api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(
                    f"{settings.llm_gateway_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                
                cleaned = content.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                    cleaned = re.sub(r"\s*```$", "", cleaned)
                
                parsed_json = json.loads(cleaned)
                return ExtractionResult.model_validate(parsed_json)
        except Exception as e:
            logger.error("LLM Gateway extraction failed: %s. Using heuristic fallback.", e)
            return cls._fallback_extract(transcript_text)

    @classmethod
    def _fallback_extract(cls, transcript_text: str) -> ExtractionResult:
        entities = []
        claims = []
        relationships = []
        claim_counter = 1

        lines = [line.strip() for line in transcript_text.split("\n") if line.strip()]
        for line in lines:
            speaker = "Speaker A"
            text = line
            if ":" in line:
                parts = line.split(":", 1)
                speaker = parts[0].strip()
                text = parts[1].strip()

            lower = text.lower()
            if not text:
                continue

            claim_type = "observation"
            if any(w in lower for w in ["will do", "need to", "action item", "todo", "task", "ship", "implement", "fix", "buy"]):
                claim_type = "task"
            elif any(w in lower for w in ["decided", "decision", "we chose", "let's go with", "agreed"]):
                claim_type = "decision"
            elif any(w in lower for w in ["?", "why", "how", "what if", "whether"]):
                claim_type = "question"
            elif any(w in lower for w in ["maybe", "might be", "hypothesis", "could be", "theory"]):
                claim_type = "hypothesis"

            sensitivity = "none"
            if any(w in lower for w in ["off the record", "don't record", "private", "salary", "medical", "dollar", "cost $", "confidential"]):
                sensitivity = "flagged"

            found_entities = []
            words = re.findall(r"\b[A-Z][a-zA-Z0-9_\-]+\b", text)
            for w in words:
                if w not in ["Speaker", "I", "We", "They", "Then", "So", "However", "Because"]:
                    found_entities.append(w)
                    if not any(e["name"] == w for e in entities):
                        entities.append({"type": "component", "name": w})

            cid = f"c{claim_counter}"
            claim_counter += 1
            claims.append(
                ExtractedClaim(
                    temp_id=cid,
                    type=claim_type,
                    text=text,
                    speaker=speaker,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    confidence="unverified",
                    sensitivity=sensitivity,
                    entities=found_entities,
                )
            )

        if len(claims) >= 2:
            relationships.append(
                ExtractedRelationship(
                    from_id=claims[0].temp_id,
                    to_id=claims[1].temp_id,
                    type="depends_on"
                )
            )

        return ExtractionResult(
            entities=[ExtractedEntity(**e) for e in entities],
            claims=claims,
            relationships=relationships,
        )

    @classmethod
    async def persist_extraction(
        cls,
        db: AsyncSession,
        conversation_id: UUID,
        user_id: UUID,
        extraction: ExtractionResult
    ) -> List[Claim]:
        entity_map: Dict[str, Entity] = {}
        for ent_data in extraction.entities:
            stmt = select(Entity).where(
                Entity.user_id == user_id,
                Entity.name == ent_data.name
            )
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if existing:
                entity_map[ent_data.name] = existing
            else:
                new_ent = Entity(
                    id=uuid4(),
                    user_id=user_id,
                    type=ent_data.type or "component",
                    name=ent_data.name,
                    first_seen_at=datetime.now(timezone.utc),
                )
                db.add(new_ent)
                entity_map[ent_data.name] = new_ent

        await db.flush()

        temp_id_to_claim: Dict[str, Claim] = {}
        temp_id_to_task_state: Dict[str, TaskState] = {}
        persisted_claims: List[Claim] = []

        for c_data in extraction.claims:
            claim_id = uuid4()
            claim = Claim(
                id=claim_id,
                conversation_id=conversation_id,
                speaker_id=None,
                type=c_data.type,
                text=c_data.text,
                confidence=c_data.confidence or "unverified",
                sensitivity=c_data.sensitivity,
                timestamp=datetime.now(timezone.utc),
            )
            db.add(claim)

            for ent_name in c_data.entities:
                if ent_name in entity_map:
                    claim.entities.append(entity_map[ent_name])

            if c_data.type == "task":
                task_state = TaskState(
                    claim_id=claim_id,
                    status="open",
                    blocked_by=None,
                    resurfaced_at=[],
                )
                db.add(task_state)
                temp_id_to_task_state[c_data.temp_id] = task_state

            temp_id_to_claim[c_data.temp_id] = claim
            persisted_claims.append(claim)

        await db.flush()

        for rel_data in extraction.relationships:
            from_claim = temp_id_to_claim.get(rel_data.from_id)
            to_claim = temp_id_to_claim.get(rel_data.to_id)
            if from_claim and to_claim:
                rel = Relationship(
                    id=uuid4(),
                    from_claim_id=from_claim.id,
                    to_claim_id=to_claim.id,
                    relation_type=rel_data.type,
                )
                db.add(rel)

                from_task = temp_id_to_task_state.get(rel_data.from_id)
                to_task = temp_id_to_task_state.get(rel_data.to_id)

                if rel_data.type == "blocks" and to_task:
                    to_task.status = "blocked"
                    to_task.blocked_by = from_claim.id
                elif rel_data.type == "depends_on" and from_task:
                    from_task.status = "blocked"
                    from_task.blocked_by = to_claim.id

        await db.commit()
        return persisted_claims
