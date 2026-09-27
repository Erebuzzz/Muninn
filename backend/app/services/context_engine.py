import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
import httpx
from sqlalchemy import text, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db.models import Claim, Entity, Relationship, Conversation, Speaker
from ..schemas.chat import CitationItem, ChatQueryResponse

logger = logging.getLogger(__name__)

CHAT_SYSTEM_PROMPT = """You are Muninn, an assistant querying an engineer's living memory.
You are given a user question and a list of ground-truth claims extracted from their recorded conversations.

Your job:
1. Answer the question accurately using ONLY the provided claims as ground truth.
2. Every major claim or decision you cite must reference its citation ID [Citation: <id>].
3. If no relevant precedent or claim is found, state clearly that no recorded memory covers this topic. Never invent technical details or dates.
4. Keep the answer direct, concise, and structured.
"""

class ContextEngineService:
    @classmethod
    async def get_dependency_chain(
        cls,
        db: AsyncSession,
        claim_id: UUID
    ) -> List[Dict[str, Any]]:
        sql = text("""
            WITH RECURSIVE chain AS (
                SELECT
                    r.id AS rel_id,
                    r.from_claim_id,
                    r.to_claim_id,
                    r.relation_type,
                    1 AS depth
                FROM relationships r
                WHERE r.from_claim_id = :claim_id OR r.to_claim_id = :claim_id

                UNION

                SELECT
                    r.id AS rel_id,
                    r.from_claim_id,
                    r.to_claim_id,
                    r.relation_type,
                    c.depth + 1
                FROM relationships r
                JOIN chain c ON (r.from_claim_id = c.to_claim_id OR r.to_claim_id = c.from_claim_id)
                WHERE c.depth < 5
            )
            SELECT DISTINCT
                chain.rel_id,
                chain.from_claim_id,
                cf.text AS from_text,
                chain.to_claim_id,
                ct.text AS to_text,
                chain.relation_type,
                chain.depth
            FROM chain
            JOIN claims cf ON cf.id = chain.from_claim_id
            JOIN claims ct ON ct.id = chain.to_claim_id
            ORDER BY chain.depth ASC;
        """)

        res = await db.execute(sql, {"claim_id": claim_id})
        rows = res.fetchall()

        return [
            {
                "relationship_id": str(r[0]),
                "from_claim_id": str(r[1]),
                "from_text": r[2],
                "to_claim_id": str(r[3]),
                "to_text": r[4],
                "relation_type": r[5],
                "depth": r[6],
            }
            for r in rows
        ]

    @classmethod
    async def get_entity_graph(
        cls,
        db: AsyncSession,
        user_id: UUID,
        entity_name: Optional[str] = None
    ) -> Dict[str, Any]:
        stmt = (
            select(Claim)
            .join(Claim.conversation)
            .where(
                Conversation.user_id == user_id,
                Claim.sensitivity.in_(["none", "confirmed_store"])
            )
            .options(
                selectinload(Claim.entities),
                selectinload(Claim.task_state),
                selectinload(Claim.conversation)
            )
            .order_by(Claim.timestamp.desc())
            .limit(50)
        )

        res = await db.execute(stmt)
        claims = res.scalars().unique().all()

        nodes = []
        node_ids = set()

        for c in claims:
            cid = f"claim_{c.id}"
            if cid not in node_ids:
                nodes.append({
                    "id": cid,
                    "label": c.text[:40] + ("..." if len(c.text) > 40 else ""),
                    "type": "claim",
                    "claim_type": c.type,
                    "full_text": c.text,
                    "confidence": c.confidence,
                    "status": c.task_state.status if c.task_state else None,
                })
                node_ids.add(cid)

            for e in c.entities:
                eid = f"entity_{e.id}"
                if eid not in node_ids:
                    nodes.append({
                        "id": eid,
                        "label": e.name,
                        "type": "entity",
                        "entity_type": e.type,
                    })
                    node_ids.add(eid)

        claim_ids = [c.id for c in claims]
        edges = []
        if claim_ids:
            rel_stmt = select(Relationship).where(
                Relationship.from_claim_id.in_(claim_ids),
                Relationship.to_claim_id.in_(claim_ids)
            )
            rel_res = await db.execute(rel_stmt)
            for rel in rel_res.scalars().all():
                edges.append({
                    "id": str(rel.id),
                    "from": f"claim_{rel.from_claim_id}",
                    "to": f"claim_{rel.to_claim_id}",
                    "label": rel.relation_type,
                })

            for c in claims:
                for e in c.entities:
                    edges.append({
                        "id": f"link_{c.id}_{e.id}",
                        "from": f"claim_{c.id}",
                        "to": f"entity_{e.id}",
                        "label": "mentions",
                    })

        return {"nodes": nodes, "edges": edges}

    @classmethod
    async def answer_chat_query(
        cls,
        db: AsyncSession,
        user_id: UUID,
        query: str,
        conversation_id: Optional[UUID] = None,
        max_citations: int = 5
    ) -> ChatQueryResponse:
        stmt = (
            select(Claim)
            .join(Claim.conversation)
            .where(
                Conversation.user_id == user_id,
                Claim.sensitivity.in_(["none", "confirmed_store"])
            )
            .options(
                selectinload(Claim.entities),
                selectinload(Claim.conversation),
                selectinload(Claim.speaker)
            )
            .order_by(Claim.timestamp.desc())
            .limit(30)
        )

        if conversation_id:
            stmt = stmt.where(Claim.conversation_id == conversation_id)

        res = await db.execute(stmt)
        candidates = res.scalars().unique().all()

        query_terms = [w.lower() for w in query.split() if len(w) > 2]
        scored_candidates = []
        for c in candidates:
            score = 0
            text_lower = c.text.lower()
            for term in query_terms:
                if term in text_lower:
                    score += 2
            for e in c.entities:
                if any(term in e.name.lower() for term in query_terms):
                    score += 3
            if score > 0 or not query_terms:
                scored_candidates.append((score, c))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        selected_claims = [c for _, c in scored_candidates[:max_citations]]

        if not selected_claims and candidates:
            selected_claims = candidates[:max_citations]

        citations: List[CitationItem] = []
        claims_context_lines = []
        for c in selected_claims:
            citations.append(
                CitationItem(
                    claim_id=c.id,
                    claim_text=c.text,
                    claim_type=c.type,
                    confidence=c.confidence,
                    speaker=c.speaker.diarization_tag if c.speaker else "Speaker A",
                    timestamp=c.timestamp.isoformat(),
                    conversation_title=c.conversation.title if c.conversation else None,
                )
            )
            claims_context_lines.append(
                f"- [Citation: {c.id}] ({c.type}, {c.confidence or 'unverified'}): {c.text}"
            )

        if not selected_claims:
            return ChatQueryResponse(
                answer="No relevant claims or prior decisions have been recorded for this topic yet.",
                citations=[],
                precedent_found=False,
            )

        claims_context = "\n".join(claims_context_lines)

        if not settings.assemblyai_api_key:
            ans = f"Based on your recorded memory:\n{claims_context}"
            return ChatQueryResponse(
                answer=ans,
                citations=citations,
                precedent_found=True,
            )

        payload = {
            "model": settings.llm_gateway_model,
            "messages": [
                {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                {"role": "user", "content": f"USER QUESTION: {query}\n\nGROUND TRUTH CLAIMS:\n{claims_context}"}
            ],
            "temperature": 0.2,
            "max_tokens": 800,
        }

        headers = {
            "Authorization": f"Bearer {settings.assemblyai_api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.llm_gateway_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                answer_text = data["choices"][0]["message"]["content"]
                return ChatQueryResponse(
                    answer=answer_text,
                    citations=citations,
                    precedent_found=True,
                )
        except Exception as e:
            logger.error("Chat LLM Gateway call failed: %s", e)
            return ChatQueryResponse(
                answer=f"Found relevant stored claims:\n{claims_context}",
                citations=citations,
                precedent_found=True,
            )
