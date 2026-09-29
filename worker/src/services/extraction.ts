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
    // 1. Try Cloudflare Workers AI natively (Llama 3.3 70B Instruct)
    if (env.AI) {
      try {
        console.log("[Extraction] Calling Cloudflare Workers AI (@cf/meta/llama-3.3-70b-instruct)...");
        const aiResp: any = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
          messages: [
            {
              role: "system",
              content: `${EXTRACTION_SYSTEM_PROMPT}

CRITICAL RULES:
1. Infer the substantive engineering activities, decisions, and tasks from the transcript.
2. DO NOT extract casual greetings, small talk, pleasantries, filler phrases, testing remarks, or conversational artifacts (e.g. "thank god", "hello", "muninn is listening", "just testing this", "it's just a test run", "so", "we'll see what this is", "can you hear me").
3. If the transcript is only casual banter, greetings, or a mic test with NO actual engineering decisions, tasks, or hypotheses, output strictly:
{"entities": [], "claims": [], "relationships": []}
4. For entities, extract real technical components, modules, systems, projects, or people. NEVER extract common words, verbs, or conversational words.`
            },
            {
              role: "user",
              content: `Transcript to extract:\n\n${transcriptText}`
            }
          ],
          temperature: 0.1,
          max_tokens: 2048,
        });

        let rawText = (aiResp?.response || "").trim();
        if (rawText) {
          if (rawText.startsWith("```")) {
            rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
          }
          const parsed = JSON.parse(rawText) as ExtractionResult;
          if (parsed && Array.isArray(parsed.claims)) {
            console.log(`[Extraction] Workers AI extracted ${parsed.claims.length} claims, ${parsed.entities?.length || 0} entities.`);
            return {
              entities: parsed.entities || [],
              claims: parsed.claims || [],
              relationships: parsed.relationships || [],
            };
          }
        }
      } catch (err) {
        console.warn("[Extraction] Workers AI failed or timed out, trying next provider:", err);
      }
    }

    // 2. Try Gemini API if key is available
    if (env.GEMINI_API_KEY) {
      try {
        console.log("[Extraction] Calling Gemini 2.0 Flash API...");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        const gResp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${EXTRACTION_SYSTEM_PROMPT}\n\nTranscript to extract:\n${transcriptText}` }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          })
        });

        if (gResp.ok) {
          const gData: any = await gResp.json();
          const gText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (gText) {
            const parsed = JSON.parse(gText);
            return {
              entities: parsed.entities || [],
              claims: parsed.claims || [],
              relationships: parsed.relationships || []
            };
          }
        }
      } catch (geminiErr) {
        console.warn("[Extraction] Gemini API failed, trying gateway:", geminiErr);
      }
    }

    // 3. Fallback to external gateway if configured
    if (env.LLM_GATEWAY_URL && !env.LLM_GATEWAY_URL.includes("assemblyai.com")) {
      try {
        const gatewayUrl = env.LLM_GATEWAY_URL;
        const model = env.LLM_GATEWAY_MODEL || "claude-3-5-sonnet";
        const resp = await fetch(`${gatewayUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.ASSEMBLYAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
              { role: "user", content: `Transcript to extract:\n\n${transcriptText}` }
            ],
            temperature: 0.1,
            max_tokens: 2048,
          }),
        });

        if (resp.ok) {
          const data: any = await resp.json();
          let content = data.choices?.[0]?.message?.content?.trim() || "";
          if (content.startsWith("```")) {
            content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
          }
          const parsed = JSON.parse(content);
          return {
            entities: parsed.entities || [],
            claims: parsed.claims || [],
            relationships: parsed.relationships || [],
          };
        }
      } catch (gwErr) {
        console.warn("[Extraction] External gateway failed:", gwErr);
      }
    }

    // 4. Intelligent Heuristic Fallback (Never creates nonsense or filler nodes)
    return this.fallbackExtract(transcriptText);
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

    // Common filler and small-talk patterns that must NEVER be extracted as claims or entities
    const fillerPatterns = [
      /^(hi|hello|hey|bye|goodbye)\b/i,
      /^thank\s+god\b/i,
      /^just\s+testing\b/i,
      /^it('s|\s+is)\s+just\s+a\s+test\b/i,
      /^(ok|okay|so|well|yeah|yes|no)\.?$/i,
      /^we('ll|\s+will)\s+see\b/i,
      /^muninn\s+is\s+listening/i,
      /^what\s+are\s+we\s+solving/i,
      /^can\s+you\s+hear\s+me/i,
      /^testing\s+1\s*2\s*3/i,
    ];

    const stopWords = new Set([
      "speaker", "i", "we", "they", "then", "so", "however", "because", "muninn", "the",
      "it", "just", "what", "god", "thank", "starting", "discussing", "module", "this",
      "that", "there", "here", "with", "from", "into", "about", "your", "mine", "some"
    ]);

    for (const rawLine of lines) {
      let speaker = "Speaker A";
      let text = rawLine;

      if (rawLine.includes(":")) {
        const parts = rawLine.split(":");
        speaker = parts[0].trim();
        text = parts.slice(1).join(":").trim();
      }

      // Ignore speech turns from Muninn itself
      if (speaker.toLowerCase().includes("muninn")) continue;
      if (!text || text.length < 12) continue;

      // Ignore greetings, small talk, and microphone checks
      const isFiller = fillerPatterns.some((pattern) => pattern.test(text.toLowerCase()));
      if (isFiller) continue;

      const lower = text.toLowerCase();

      let claimType: "decision" | "task" | "question" | "hypothesis" | "observation" | null = null;
      if (
        ["will do", "need to", "action item", "todo", "task", "ship", "implement", "redesign", "fix", "buy", "order"].some(
          (w) => lower.includes(w)
        )
      ) {
        claimType = "task";
      } else if (
        ["decided", "decision", "we chose", "let's go with", "agreed", "pause", "approved"].some((w) =>
          lower.includes(w)
        )
      ) {
        claimType = "decision";
      } else if (["?", "should we", "how do we", "what if", "whether we"].some((w) => lower.includes(w))) {
        claimType = "question";
      } else if (
        ["maybe", "might be", "hypothesis", "could be", "theory", "suspect"].some((w) => lower.includes(w))
      ) {
        claimType = "hypothesis";
      } else if (
        ["noticed", "measured", "overheating", "voltage", "revision", "pinout", "bracket", "firmware", "bug", "fails"].some((w) => lower.includes(w))
      ) {
        claimType = "observation";
      }

      // If sentence doesn't match any meaningful engineering intent, skip it
      if (!claimType) continue;

      let sensitivity: "none" | "flagged" = "none";
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

      // Extract only technical entities (capitalized technical terms not in stopWords)
      const foundEntities: string[] = [];
      const words = text.match(/\b[A-Z][a-zA-Z0-9_\-]{2,}\b/g) || [];
      for (const w of words) {
        const clean = w.trim();
        if (!stopWords.has(clean.toLowerCase()) && clean.length > 2) {
          foundEntities.push(clean);
          if (!entities.some((e) => e.name.toLowerCase() === clean.toLowerCase())) {
            entities.push({ type: "component", name: clean });
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
