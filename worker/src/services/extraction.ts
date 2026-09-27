import { DbClient } from "../db/client";
import { Bindings, ExtractionResult, ExtractedClaim, ExtractedEntity, ExtractedRelationship } from "../types";

export const EXTRACTION_SYSTEM_PROMPT = `You are the Muninn extraction engine. You are given a timestamped, speaker-tagged transcript of one conversation. Your job is to convert it into structured claims. You do not summarize prose. You output ONLY valid JSON matching the schema below. No preamble, no markdown fences, no commentary.

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

If nothing in the transcript is extractable, return an empty claims array. Do not force extraction to justify your existence.`;

export const EXTRACTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          name: { type: "string" },
        },
        required: ["type", "name"],
        additionalProperties: false,
      },
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          temp_id: { type: "string" },
          type: {
            type: "string",
            enum: ["observation", "hypothesis", "decision", "task", "question"],
          },
          text: { type: "string" },
          speaker: { type: "string" },
          timestamp: { type: "string" },
          confidence: {
            type: "string",
            enum: ["verified", "unverified", "superseded"],
          },
          sensitivity: {
            type: "string",
            enum: ["none", "flagged"],
          },
          entities: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "temp_id",
          "type",
          "text",
          "speaker",
          "timestamp",
          "confidence",
          "sensitivity",
          "entities",
        ],
        additionalProperties: false,
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          type: {
            type: "string",
            enum: ["blocks", "depends_on", "resolves", "contradicts", "supersedes"],
          },
        },
        required: ["from", "to", "type"],
        additionalProperties: false,
      },
    },
  },
  required: ["entities", "claims", "relationships"],
  additionalProperties: false,
};

export class ExtractionService {
  static async extractFromTranscript(
    transcriptText: string,
    env: Bindings
  ): Promise<ExtractionResult> {
    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return this.fallbackExtract(transcriptText);
    }

    const gatewayUrl = env.LLM_GATEWAY_URL || "https://llm-gateway.assemblyai.com/v1";
    const model = env.LLM_GATEWAY_MODEL || "claude-3-5-sonnet";

    const payload = {
      model,
      messages: [
        {
          role: "system",
          content: EXTRACTION_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        { role: "user", content: `Transcript to extract:\n\n${transcriptText}` },
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "muninn_extraction",
          schema: EXTRACTION_JSON_SCHEMA,
          strict: true,
        },
      },
      post_processing_steps: [{ type: "json-repair" }],
      fallbacks: [
        { model: "gemini-2.5-flash" },
        { model: "claude-haiku-4-5-20251001" },
      ],
      fallback_config: { depth: 2, retry: true },
    };

    try {
      const resp = await fetch(`${gatewayUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ASSEMBLYAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        console.warn(`[LLM Gateway] HTTP ${resp.status} on extraction: ${await resp.text()}`);
        return this.fallbackExtract(transcriptText);
      }

      const data = (await resp.json()) as {
        request_id?: string;
        model?: string;
        choices: Array<{ message: { content: string } }>;
      };

      console.log(
        `[LLM Gateway] Extraction succeeded. request_id: ${data.request_id || "unknown"}, model: ${
          data.model || model
        }`
      );

      let content = data.choices[0]?.message?.content?.trim() || "";
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(content) as ExtractionResult;
      return {
        entities: parsed.entities || [],
        claims: parsed.claims || [],
        relationships: parsed.relationships || [],
      };
    } catch (err) {
      console.error("[LLM Gateway] Extraction exception, falling back:", err);
      return this.fallbackExtract(transcriptText);
    }
  }

  static fallbackExtract(transcriptText: string): ExtractionResult {
    const entities: ExtractedEntity[] = [];
    const claims: ExtractedClaim[] = [];
    const relationships: ExtractedRelationship[] = [];
    let claimCounter = 1;

    const lines = transcriptText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of lines) {
      let speaker = "Speaker A";
      let text = line;

      if (line.includes(":")) {
        const parts = line.split(":");
        speaker = parts[0].trim();
        text = parts.slice(1).join(":").trim();
      }

      if (!text) continue;
      const lower = text.toLowerCase();

      let claimType = "observation";
      if (
        ["will do", "need to", "action item", "todo", "task", "ship", "implement", "fix", "buy"].some(
          (w) => lower.includes(w)
        )
      ) {
        claimType = "task";
      } else if (
        ["decided", "decision", "we chose", "let's go with", "agreed"].some((w) =>
          lower.includes(w)
        )
      ) {
        claimType = "decision";
      } else if (["?", "why", "how", "what if", "whether"].some((w) => lower.includes(w))) {
        claimType = "question";
      } else if (
        ["maybe", "might be", "hypothesis", "could be", "theory"].some((w) => lower.includes(w))
      ) {
        claimType = "hypothesis";
      }

      let sensitivity = "none";
      if (
        [
          "off the record",
          "don't record",
          "private",
          "salary",
          "medical",
          "dollar",
          "cost $",
          "confidential",
        ].some((w) => lower.includes(w))
      ) {
        sensitivity = "flagged";
      }

      const foundEntities: string[] = [];
      const words = text.match(/\b[A-Z][a-zA-Z0-9_\-]+\b/g) || [];
      const stopWords = new Set([
        "Speaker",
        "I",
        "We",
        "They",
        "Then",
        "So",
        "However",
        "Because",
        "Muninn",
        "The",
      ]);

      for (const w of words) {
        if (!stopWords.has(w)) {
          foundEntities.push(w);
          if (!entities.some((e) => e.name === w)) {
            entities.push({ type: "component", name: w });
          }
        }
      }

      const cid = `c${claimCounter++}`;
      claims.push({
        temp_id: cid,
        type: claimType,
        text,
        speaker,
        timestamp: new Date().toISOString(),
        confidence: "unverified",
        sensitivity,
        entities: foundEntities,
      });
    }

    if (claims.length >= 2) {
      relationships.push({
        from: claims[0].temp_id,
        to: claims[1].temp_id,
        type: "depends_on",
      });
    }

    return { entities, claims, relationships };
  }

  static async persistExtraction(
    sql: DbClient,
    conversationId: string,
    userId: string,
    extraction: ExtractionResult
  ): Promise<Array<{ id: string; text: string; type: string }>> {
    const entityMap = new Map<string, string>();

    for (const ent of extraction.entities) {
      const existing = (await sql(
        `SELECT id FROM entities WHERE user_id = $1 AND name = $2 LIMIT 1`,
        [userId, ent.name]
      )) as Array<{ id: string }>;

      if (existing.length > 0) {
        entityMap.set(ent.name, existing[0].id);
      } else {
        const entId = crypto.randomUUID();
        await sql(
          `INSERT INTO entities (id, user_id, type, name, first_seen_at) VALUES ($1, $2, $3, $4, NOW())`,
          [entId, userId, ent.type || "component", ent.name]
        );
        entityMap.set(ent.name, entId);
      }
    }

    const tempIdToClaimId = new Map<string, string>();
    const tempIdIsTask = new Map<string, boolean>();
    const persistedClaims: Array<{ id: string; text: string; type: string }> = [];

    for (const c of extraction.claims) {
      const claimId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      await sql(
        `INSERT INTO claims (id, conversation_id, speaker_id, type, text, confidence, sensitivity, timestamp)
         VALUES ($1, $2, NULL, $3, $4, $5, $6, $7)`,
        [
          claimId,
          conversationId,
          c.type,
          c.text,
          c.confidence || "unverified",
          c.sensitivity || "none",
          nowIso,
        ]
      );

      for (const entName of c.entities) {
        const entId = entityMap.get(entName);
        if (entId) {
          await sql(
            `INSERT INTO claim_entities (claim_id, entity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [claimId, entId]
          );
        }
      }

      if (c.type === "task") {
        await sql(
          `INSERT INTO task_state (claim_id, status, blocked_by, resurfaced_at) VALUES ($1, 'open', NULL, '{}')`,
          [claimId]
        );
        tempIdIsTask.set(c.temp_id, true);
      }

      tempIdToClaimId.set(c.temp_id, claimId);
      persistedClaims.push({ id: claimId, text: c.text, type: c.type });
    }

    for (const rel of extraction.relationships) {
      const fromClaimId = tempIdToClaimId.get(rel.from);
      const toClaimId = tempIdToClaimId.get(rel.to);

      if (fromClaimId && toClaimId) {
        const relId = crypto.randomUUID();
        await sql(
          `INSERT INTO relationships (id, from_claim_id, to_claim_id, relation_type) VALUES ($1, $2, $3, $4)`,
          [relId, fromClaimId, toClaimId, rel.type]
        );

        if (rel.type === "blocks" && tempIdIsTask.get(rel.to)) {
          await sql(
            `UPDATE task_state SET status = 'blocked', blocked_by = $1 WHERE claim_id = $2`,
            [fromClaimId, toClaimId]
          );
        } else if (rel.type === "depends_on" && tempIdIsTask.get(rel.from)) {
          await sql(
            `UPDATE task_state SET status = 'blocked', blocked_by = $1 WHERE claim_id = $2`,
            [toClaimId, fromClaimId]
          );
        }
      }
    }

    return persistedClaims;
  }
}
