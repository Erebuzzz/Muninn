import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { getOptionalAuthUserId, requireAuthUserId } from "../services/auth";
import { rateLimiter } from "../middleware/rate-limit";

export const reviewRouter = new Hono<AppEnv>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Retrieves sensitive flagged claims awaiting consent for the requesting user.
 */
reviewRouter.get("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getOptionalAuthUserId(c);
  const conversationId = c.req.query("conversation_id");

  let query = `
    SELECT
      c.id,
      c.conversation_id,
      c.speaker_id,
      sp.diarization_tag AS speaker_tag,
      c.type,
      c.text,
      c.confidence,
      c.sensitivity,
      c.timestamp,
      ts.status AS task_status,
      ts.blocked_by AS task_blocked_by,
      ts.resurfaced_at AS task_resurfaced_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', e.id,
            'name', e.name,
            'type', e.type,
            'first_seen_at', e.first_seen_at
          )
        ) FILTER (WHERE e.id IS NOT NULL),
        '[]'
      ) AS entities
    FROM claims c
    JOIN conversations cv ON cv.id = c.conversation_id
    LEFT JOIN speakers sp ON sp.id = c.speaker_id
    LEFT JOIN task_state ts ON ts.claim_id = c.id
    LEFT JOIN claim_entities ce ON ce.claim_id = c.id
    LEFT JOIN entities e ON e.id = ce.entity_id
    WHERE cv.user_id = $1
      AND c.sensitivity = 'flagged'
  `;

  const params: any[] = [userId];
  if (conversationId && UUID_REGEX.test(conversationId)) {
    query += ` AND c.conversation_id = $2::uuid`;
    params.push(conversationId);
  }

  query += `
    GROUP BY c.id, c.conversation_id, c.speaker_id, sp.diarization_tag, c.type, c.text, c.confidence, c.sensitivity, c.timestamp, ts.status, ts.blocked_by, ts.resurfaced_at
    ORDER BY c.timestamp DESC
  `;

  const rows = (await sql(query, params)) as any[];

  const formatted = rows.map((r) => ({
    id: r.id,
    conversation_id: r.conversation_id,
    speaker_id: r.speaker_id,
    speaker_tag: r.speaker_tag,
    type: r.type,
    text: r.text,
    confidence: r.confidence,
    sensitivity: r.sensitivity,
    timestamp: r.timestamp,
    entities: r.entities || [],
    task_state: r.task_status
      ? {
          status: r.task_status,
          blocked_by: r.task_blocked_by,
          resurfaced_at: r.task_resurfaced_at || [],
        }
      : null,
  }));

  return c.json(formatted);
});

/**
 * Reviews flagged claims.
 * Enforces authentication and strict tenant ownership over each claim.
 */
reviewRouter.post("/", rateLimiter(60000, 20, "review-update"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await requireAuthUserId(c);

  const payload = await c.req.json<{
    decisions: Array<{ claim_id: string; action: "store" | "discard" }>;
  }>().catch(() => ({ decisions: [] }));

  let storedCount = 0;
  let discardedCount = 0;

  for (const item of payload.decisions || []) {
    if (!item.claim_id || !UUID_REGEX.test(item.claim_id)) continue;

    const newSensitivity = item.action === "store" ? "confirmed_store" : "confirmed_discard";
    const res = (await sql(
      `UPDATE claims c
       SET sensitivity = $1
       FROM conversations cv
       WHERE cv.id = c.conversation_id
         AND cv.user_id = $3
         AND c.id = $2::uuid
       RETURNING c.id`,
      [newSensitivity, item.claim_id, userId]
    )) as any[];

    if (res.length > 0) {
      if (item.action === "store") storedCount++;
      else discardedCount++;
    }
  }

  return c.json({
    stored_count: storedCount,
    discarded_count: discardedCount,
    status: "success",
  });
});

/**
 * Discards all pending flagged claims for the authenticated user.
 */
reviewRouter.post("/discard-all-pending", rateLimiter(60000, 10, "review-discard-all"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await requireAuthUserId(c);
  const conversationId = c.req.query("conversation_id");

  let updateSql = `
    UPDATE claims c
    SET sensitivity = 'confirmed_discard'
    FROM conversations cv
    WHERE cv.id = c.conversation_id
      AND cv.user_id = $1
      AND c.sensitivity = 'flagged'
  `;
  const params: any[] = [userId];

  if (conversationId && UUID_REGEX.test(conversationId)) {
    updateSql += ` AND c.conversation_id = $2::uuid`;
    params.push(conversationId);
  }

  updateSql += ` RETURNING c.id`;

  const updatedRows = (await sql(updateSql, params)) as any[];

  return c.json({
    stored_count: 0,
    discarded_count: updatedRows.length,
    status: "success",
  });
});
