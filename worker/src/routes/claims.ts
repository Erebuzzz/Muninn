import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";

export const claimsRouter = new Hono<AppEnv>();

claimsRouter.get("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("user_id") || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const conversationId = c.req.query("conversation_id");
  const entityName = c.req.query("entity_name");
  const claimType = c.req.query("claim_type");
  const sensitivity = c.req.query("sensitivity");
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "50", 10), 1), 200);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10), 0);

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
  `;

  const params: any[] = [userId];
  let paramIdx = 2;

  if (conversationId) {
    query += ` AND c.conversation_id = $${paramIdx++}::uuid`;
    params.push(conversationId);
  }
  if (claimType) {
    query += ` AND c.type = $${paramIdx++}`;
    params.push(claimType);
  }
  if (sensitivity) {
    query += ` AND c.sensitivity = $${paramIdx++}`;
    params.push(sensitivity);
  } else if (!conversationId) {
    query += ` AND c.sensitivity IN ('none', 'confirmed_store')`;
  }
  if (entityName) {
    query += ` AND e.name = $${paramIdx++}`;
    params.push(entityName);
  }

  query += `
    GROUP BY c.id, c.conversation_id, c.speaker_id, sp.diarization_tag, c.type, c.text, c.confidence, c.sensitivity, c.timestamp, ts.status, ts.blocked_by, ts.resurfaced_at
    ORDER BY c.timestamp DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

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

claimsRouter.get("/:id", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const claimId = c.req.param("id");

  const rows = (await sql(
    `SELECT
       c.id,
       c.conversation_id,
       cv.title AS conversation_title,
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
     LEFT JOIN conversations cv ON cv.id = c.conversation_id
     LEFT JOIN speakers sp ON sp.id = c.speaker_id
     LEFT JOIN task_state ts ON ts.claim_id = c.id
     LEFT JOIN claim_entities ce ON ce.claim_id = c.id
     LEFT JOIN entities e ON e.id = ce.entity_id
     WHERE c.id = $1::uuid
     GROUP BY c.id, c.conversation_id, cv.title, c.speaker_id, sp.diarization_tag, c.type, c.text, c.confidence, c.sensitivity, c.timestamp, ts.status, ts.blocked_by, ts.resurfaced_at
     LIMIT 1`,
    [claimId]
  )) as any[];

  if (rows.length === 0) {
    return c.json({ detail: "Claim not found" }, 404);
  }
  const claim = rows[0];

  const incomingRows = (await sql(
    `SELECT r.id, r.from_claim_id, r.to_claim_id, r.relation_type, c.text AS target_claim_text
     FROM relationships r
     JOIN claims c ON c.id = r.from_claim_id
     WHERE r.to_claim_id = $1::uuid`,
    [claimId]
  )) as any[];

  const outgoingRows = (await sql(
    `SELECT r.id, r.from_claim_id, r.to_claim_id, r.relation_type, c.text AS target_claim_text
     FROM relationships r
     JOIN claims c ON c.id = r.to_claim_id
     WHERE r.from_claim_id = $1::uuid`,
    [claimId]
  )) as any[];

  return c.json({
    claim: {
      id: claim.id,
      conversation_id: claim.conversation_id,
      speaker_id: claim.speaker_id,
      speaker_tag: claim.speaker_tag,
      type: claim.type,
      text: claim.text,
      confidence: claim.confidence,
      sensitivity: claim.sensitivity,
      timestamp: claim.timestamp,
      entities: claim.entities || [],
      task_state: claim.task_status
        ? {
            status: claim.task_status,
            blocked_by: claim.task_blocked_by,
            resurfaced_at: claim.task_resurfaced_at || [],
          }
        : null,
    },
    conversation_title: claim.conversation_title || null,
    incoming_relationships: incomingRows,
    outgoing_relationships: outgoingRows,
  });
});
