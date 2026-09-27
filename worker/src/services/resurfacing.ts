import { DbClient } from "../db/client";
import { Bindings, ResurfacingEventRecord } from "../types";

export const RESURFACING_SYSTEM_PROMPT = `You are the Muninn resurfacing engine. You are given:
(1) The entities mentioned in the CURRENT session, and
(2) A set of candidate prior claims retrieved because they share an entity with the current session: open tasks, unresolved questions, and decisions with dependencies.

Your job: identify which candidates are actually relevant to bring up NOW, and phrase each as a short, concrete surfacing note. A note is worth showing only if at least one of these is true:
- "blocked_now_unblocked": A task that was blocked is now plausibly unblocked, based on something said in the current session.
- "reopened_question": A question left open before is being circled back to.
- "conflicting_decision": A new decision in the current session conflicts with a previously stored decision or hypothesis.
- "stale_and_relevant": A task has been open for a long time with no update and shares an entity with what is being discussed right now.

Do NOT surface something just because it shares a topic loosely.
Do NOT surface more than 3 items.
Do NOT invent connections that are not supported by the entity overlap and claim content.
Silence is valid and preferred if nothing clears the bar.

OUTPUT SCHEMA (JSON array):
[
  {
    "subject_claim_id": "<claim uuid>",
    "message": "one or two plain sentences, written as if by a colleague with a good memory, citing concrete facts",
    "reason": "blocked_now_unblocked | reopened_question | conflicting_decision | stale_and_relevant"
  }
]`;

export class ResurfacingService {
  static async evaluateResurfacing(
    sql: DbClient,
    env: Bindings,
    userId: string,
    currentConvId?: string | null,
    entityNames?: string[] | null
  ): Promise<ResurfacingEventRecord[]> {
    let targetEntities = entityNames || [];

    if (targetEntities.length === 0) {
      const rows = (await sql(
        `SELECT name FROM entities WHERE user_id = $1 ORDER BY first_seen_at DESC LIMIT 10`,
        [userId]
      )) as Array<{ name: string }>;
      targetEntities = rows.map((r) => r.name);
    }

    if (targetEntities.length === 0) {
      return [];
    }

    const candidateRows = (await sql(
      `SELECT DISTINCT
         c.id,
         c.type,
         c.text,
         ts.status,
         COALESCE(ARRAY_AGG(e.name) FILTER (WHERE e.name IS NOT NULL), '{}') as entities
       FROM claims c
       JOIN conversations cv ON cv.id = c.conversation_id
       JOIN claim_entities ce ON ce.claim_id = c.id
       JOIN entities e ON e.id = ce.entity_id
       LEFT JOIN task_state ts ON ts.claim_id = c.id
       WHERE cv.user_id = $1
         AND c.sensitivity IN ('none', 'confirmed_store')
         AND c.type IN ('task', 'question', 'decision')
         AND ($2::uuid IS NULL OR c.conversation_id != $2::uuid)
       GROUP BY c.id, c.type, c.text, ts.status
       HAVING BOOL_OR(e.name = ANY($3::text[]))
       LIMIT 15`,
      [userId, currentConvId || null, targetEntities]
    )) as Array<{
      id: string;
      type: string;
      text: string;
      status?: string | null;
      entities: string[];
    }>;

    if (candidateRows.length === 0) {
      return [];
    }

    const surfacedItems = await this.queryResurfacing(
      env,
      targetEntities,
      candidateRows
    );

    const events: ResurfacingEventRecord[] = [];

    for (const item of surfacedItems) {
      const subjectId = item.subject_claim_id || candidateRows[0]?.id;
      const eventId = crypto.randomUUID();
      const message = item.message || "Relevant task resurfaced.";
      const reason = item.reason || "stale_and_relevant";
      const nowIso = new Date().toISOString();

      await sql(
        `INSERT INTO resurfacing_events (id, user_id, triggered_by_conv, subject_claim_id, message, reason, created_at, dismissed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
        [eventId, userId, currentConvId || null, subjectId || null, message, reason, nowIso]
      );

      if (subjectId) {
        await sql(
          `UPDATE task_state
           SET resurfaced_at = array_append(COALESCE(resurfaced_at, '{}'), $1::timestamptz)
           WHERE claim_id = $2`,
          [nowIso, subjectId]
        );
      }

      events.push({
        id: eventId,
        user_id: userId,
        triggered_by_conv: currentConvId || null,
        subject_claim_id: subjectId,
        message,
        reason,
        created_at: nowIso,
        dismissed: false,
      });
    }

    return events;
  }

  private static async queryResurfacing(
    env: Bindings,
    currentEntities: string[],
    candidates: Array<{
      id: string;
      type: string;
      text: string;
      status?: string | null;
      entities: string[];
    }>
  ): Promise<Array<{ subject_claim_id: string; message: string; reason: string }>> {
    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return this.fallbackResurfacing(currentEntities, candidates);
    }

    const gatewayUrl = env.LLM_GATEWAY_URL || "https://llm-gateway.assemblyai.com/v1";
    const model = env.LLM_GATEWAY_MODEL || "claude-3-5-sonnet";

    const promptInput = `CURRENT SESSION ENTITIES: ${currentEntities.join(", ")}\n\nCANDIDATE CLAIMS:\n${JSON.stringify(
      candidates,
      null,
      2
    )}`;

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
            { role: "system", content: RESURFACING_SYSTEM_PROMPT },
            { role: "user", content: promptInput },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!resp.ok) {
        return this.fallbackResurfacing(currentEntities, candidates);
      }

      const data = (await resp.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      let content = data.choices[0]?.message?.content?.trim() || "";
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3);
      }
      return [];
    } catch {
      return this.fallbackResurfacing(currentEntities, candidates);
    }
  }

  private static fallbackResurfacing(
    currentEntities: string[],
    candidates: Array<{
      id: string;
      type: string;
      text: string;
      status?: string | null;
      entities: string[];
    }>
  ): Array<{ subject_claim_id: string; message: string; reason: string }> {
    const results: Array<{ subject_claim_id: string; message: string; reason: string }> = [];
    const currentSet = new Set(currentEntities);

    for (const c of candidates) {
      const overlap = (c.entities || []).filter((e) => currentSet.has(e));
      if (overlap.length > 0) {
        const ent = overlap[0];
        if (c.type === "task" && (!c.status || c.status === "open" || c.status === "blocked")) {
          results.push({
            subject_claim_id: c.id,
            message: `Regarding ${ent}: open task '${c.text}' was discussed previously and remains unfinished.`,
            reason: "stale_and_relevant",
          });
        } else if (c.type === "question") {
          results.push({
            subject_claim_id: c.id,
            message: `Regarding ${ent}: unresolved question '${c.text}' was left open in an earlier conversation.`,
            reason: "reopened_question",
          });
        }

        if (results.length >= 2) break;
      }
    }

    return results;
  }
}
