import { DbClient } from "../db/client";
import { Bindings, ChatQueryResponse, CitationItem } from "../types";

export const CHAT_SYSTEM_PROMPT = `You are Muninn, an intelligent living memory assistant for technical teams.
You are given a user question and ground-truth claims extracted from their recorded technical discussions.

YOUR TASK:
1. Answer the user's question directly and intelligently by synthesizing the provided claims into a coherent answer.
2. Make intelligent inferences: explicitly state who is assigned to what, what decisions were approved, what problems were observed, and what questions remain unanswered.
3. Be concise and conversational (1 to 3 clear sentences). Never be robotic or monotonous.
4. If asked whether a decision was made about an item that was only asked as an open question, clarify that no decision was made and that it remains an unresolved open question.
5. DO NOT just recite or dump claims as bullet lists. Synthesize a smart, coherent answer.
6. DO NOT include citation IDs like [Citation: ...] or raw JSON in your prose text; keep your wording natural and human.`;

export class ContextEngineService {
  static async getDependencyChain(
    sql: DbClient,
    claimId: string
  ): Promise<
    Array<{
      relationship_id: string;
      from_claim_id: string;
      from_text: string;
      to_claim_id: string;
      to_text: string;
      relation_type: string;
      depth: number;
    }>
  > {
    const rows = (await sql(
      `WITH RECURSIVE chain AS (
         SELECT
           r.id AS rel_id,
           r.from_claim_id,
           r.to_claim_id,
           r.relation_type,
           1 AS depth
         FROM relationships r
         WHERE r.from_claim_id = $1::uuid OR r.to_claim_id = $1::uuid

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
         chain.rel_id AS relationship_id,
         chain.from_claim_id,
         cf.text AS from_text,
         chain.to_claim_id,
         ct.text AS to_text,
         chain.relation_type,
         chain.depth
       FROM chain
       JOIN claims cf ON cf.id = chain.from_claim_id
       JOIN claims ct ON ct.id = chain.to_claim_id
       ORDER BY chain.depth ASC`,
      [claimId]
    )) as Array<{
      relationship_id: string;
      from_claim_id: string;
      from_text: string;
      to_claim_id: string;
      to_text: string;
      relation_type: string;
      depth: number;
    }>;

    return rows.map((r) => ({
      relationship_id: String(r.relationship_id),
      from_claim_id: String(r.from_claim_id),
      from_text: r.from_text,
      to_claim_id: String(r.to_claim_id),
      to_text: r.to_text,
      relation_type: r.relation_type,
      depth: Number(r.depth),
    }));
  }

  static async getEntityGraph(
    sql: DbClient,
    userId: string,
    entityName?: string | null
  ): Promise<{ nodes: any[]; edges: any[] }> {
    let query = `
      SELECT
        c.id,
        c.type,
        c.text,
        c.confidence,
        ts.status,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id,
              'name', e.name,
              'type', e.type
            )
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) AS entities
      FROM claims c
      JOIN conversations cv ON cv.id = c.conversation_id
      LEFT JOIN claim_entities ce ON ce.claim_id = c.id
      LEFT JOIN entities e ON e.id = ce.entity_id
      LEFT JOIN task_state ts ON ts.claim_id = c.id
      WHERE cv.user_id = $1
        AND c.sensitivity IN ('none', 'confirmed_store')
    `;

    const params: any[] = [userId];
    if (entityName) {
      params.push(entityName);
      query += ` AND e.name = $2`;
    }

    query += `
      GROUP BY c.id, c.type, c.text, c.confidence, ts.status, c.timestamp
      ORDER BY c.timestamp DESC
      LIMIT 50
    `;

    const claims = (await sql(query, params)) as Array<{
      id: string;
      type: string;
      text: string;
      confidence?: string | null;
      status?: string | null;
      entities: any;
    }>;

    const parseEntities = (raw: any): Array<{ id: string; name: string; type: string }> => {
      if (Array.isArray(raw)) return raw.filter((e) => e && e.id && e.name);
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed.filter((e) => e && e.id && e.name) : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const nodes: any[] = [];
    const nodeIds = new Set<string>();

    for (const c of claims) {
      const cid = `claim_${c.id}`;
      if (!nodeIds.has(cid)) {
        nodes.push({
          id: cid,
          label: c.text.length > 40 ? c.text.slice(0, 40) + "..." : c.text,
          type: "claim",
          claim_type: c.type,
          full_text: c.text,
          confidence: c.confidence,
          status: c.status,
        });
        nodeIds.add(cid);
      }

      const ents = parseEntities(c.entities);
      for (const ent of ents) {
        const eid = `entity_${ent.id}`;
        if (!nodeIds.has(eid)) {
          nodes.push({
            id: eid,
            label: ent.name,
            type: "entity",
            entity_type: ent.type,
          });
          nodeIds.add(eid);
        }
      }
    }

    const claimIds = claims.map((c) => c.id);
    const edges: any[] = [];

    if (claimIds.length > 0) {
      try {
        const relationships = (await sql(
          `SELECT id, from_claim_id, to_claim_id, relation_type
           FROM relationships
           WHERE from_claim_id = ANY($1::uuid[]) AND to_claim_id = ANY($1::uuid[])`,
          [claimIds]
        )) as Array<{
          id: string;
          from_claim_id: string;
          to_claim_id: string;
          relation_type: string;
        }>;

        for (const rel of relationships) {
          edges.push({
            id: String(rel.id),
            from: `claim_${rel.from_claim_id}`,
            to: `claim_${rel.to_claim_id}`,
            label: rel.relation_type,
          });
        }
      } catch (e) {
        console.warn("[ContextEngine] Relationship edge query warning:", e);
      }

      for (const c of claims) {
        const ents = parseEntities(c.entities);
        for (const ent of ents) {
          edges.push({
            id: `link_${c.id}_${ent.id}`,
            from: `claim_${c.id}`,
            to: `entity_${ent.id}`,
            label: "mentions",
          });
        }
      }
    }

    return { nodes, edges };
  }

  static async answerChatQuery(
    sql: DbClient,
    env: Bindings,
    userId: string,
    query: string,
    conversationId?: string | null,
    maxCitations: number = 5
  ): Promise<ChatQueryResponse> {
    let querySql = `
      SELECT
        c.id,
        c.type,
        c.text,
        c.confidence,
        c.timestamp,
        cv.title AS conversation_title,
        sp.diarization_tag AS speaker_tag,
        COALESCE(ARRAY_AGG(e.name) FILTER (WHERE e.name IS NOT NULL), '{}') AS entities
      FROM claims c
      JOIN conversations cv ON cv.id = c.conversation_id
      LEFT JOIN claim_entities ce ON ce.claim_id = c.id
      LEFT JOIN entities e ON e.id = ce.entity_id
      LEFT JOIN speakers sp ON sp.id = c.speaker_id
      WHERE cv.user_id = $1
        AND c.sensitivity IN ('none', 'confirmed_store')
    `;

    const params: any[] = [userId];
    if (conversationId) {
      params.push(conversationId);
      querySql += ` AND c.conversation_id = $2::uuid`;
    }

    querySql += `
      GROUP BY c.id, c.type, c.text, c.confidence, c.timestamp, cv.title, sp.diarization_tag
      ORDER BY c.timestamp DESC
      LIMIT 30
    `;

    const candidates = (await sql(querySql, params)) as Array<{
      id: string;
      type: string;
      text: string;
      confidence?: string | null;
      timestamp: string;
      conversation_title?: string | null;
      speaker_tag?: string | null;
      entities: string[];
    }>;

    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = candidates.map((c) => {
      let score = 0;
      const lowerText = c.text.toLowerCase();
      for (const term of queryTerms) {
        if (lowerText.includes(term)) score += 2;
      }
      for (const ent of c.entities) {
        if (queryTerms.some((t) => ent.toLowerCase().includes(t))) score += 3;
      }
      return { claim: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    let selected = scored.filter((s) => s.score > 0).map((s) => s.claim);

    if (selected.length === 0 && candidates.length > 0) {
      selected = candidates.slice(0, maxCitations);
    } else {
      selected = selected.slice(0, maxCitations);
    }

    if (selected.length === 0) {
      return {
        answer: "No relevant claims or prior decisions have been recorded for this topic yet.",
        citations: [],
        precedent_found: false,
      };
    }

    const citations: CitationItem[] = selected.map((c) => ({
      claim_id: c.id,
      claim_text: c.text,
      claim_type: c.type,
      confidence: c.confidence || "unverified",
      speaker: c.speaker_tag || "Speaker A",
      timestamp: new Date(c.timestamp).toISOString(),
      conversation_title: c.conversation_title || null,
    }));

    const claimsContext = selected
      .map((c) => `- [Citation: ${c.id}] (${c.type}, ${c.confidence || "unverified"}): ${c.text}`)
      .join("\n");

    // 1. Prioritize Cloudflare Workers AI for sub-second edge synthesis
    if (env.AI) {
      const modelsToTry = [
        "@cf/meta/llama-3.1-8b-instruct-fast",
        "@cf/meta/llama-3.2-3b-instruct",
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      ];
      for (const m of modelsToTry) {
        try {
          const aiResp: any = await env.AI.run(m as any, {
            messages: [
              {
                role: "system",
                content: `${CHAT_SYSTEM_PROMPT}

CRITICAL RULES:
1. Synthesize a concise, natural, direct answer in 1 to 3 sentences.
2. Directly answer what was decided, observed, or assigned based on the provided claims.
3. If asked whether a decision was made about an item that was only an open question (e.g. directional mic), explicitly clarify that no decision was made and it remains an open question.
4. Do not dump raw UUIDs or JSON. Speak naturally as an engineering memory assistant.`,
              },
              {
                role: "user",
                content: `USER QUESTION: ${query}\n\nGROUND TRUTH CLAIMS:\n${claimsContext}`,
              },
            ],
            temperature: 0.2,
            max_tokens: 512,
          });

          const answerText = (aiResp?.response || "").trim();
          if (answerText) {
            return {
              answer: answerText,
              citations,
              precedent_found: true,
            };
          }
        } catch (err) {
          console.warn(`[ContextEngine] Workers AI model ${m} failed:`, err);
        }
      }
    }

    const cleanFallback = `Based on your recorded technical sessions:\n\n` +
      selected.map((c) => `• ${c.text}`).join("\n\n");

    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return {
        answer: cleanFallback,
        citations,
        precedent_found: true,
      };
    }

    const gatewayUrl = env.LLM_GATEWAY_URL || "https://llm-gateway.assemblyai.com/v1";
    const model = env.LLM_GATEWAY_MODEL || "claude-3-5-sonnet";

    try {
      const resp = await fetch(`${gatewayUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ASSEMBLYAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: CHAT_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
            {
              role: "user",
              content: `USER QUESTION: ${query}\n\nGROUND TRUTH CLAIMS:\n${claimsContext}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (!resp.ok) {
        return {
          answer: cleanFallback,
          citations,
          precedent_found: true,
        };
      }

      const data = (await resp.json()) as {
        request_id?: string;
        model?: string;
        choices: Array<{ message: { content: string } }>;
      };

      const answerText = data.choices[0]?.message?.content?.trim() || "";

      return {
        answer: answerText || cleanFallback,
        citations,
        precedent_found: true,
      };
    } catch {
      return {
        answer: cleanFallback,
        citations,
        precedent_found: true,
      };
    }
  }
}
