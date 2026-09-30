import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { VoiceAgentService } from "../services/voice-agent";
import { ExtractionService } from "../services/extraction";
import { ResurfacingService } from "../services/resurfacing";
import { SyncSTTService } from "../services/sync-stt";
import { getOptionalAuthUserId, requireAuthUserId } from "../services/auth";
import { rateLimiter } from "../middleware/rate-limit";

export const sessionsRouter = new Hono<AppEnv>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Vends AssemblyAI Voice Agent tokens.
 * Restricted to authenticated users to prevent upstream API quota drainage.
 * Unauthenticated guests receive simulation tokens.
 */
sessionsRouter.get("/token", rateLimiter(60000, 15, "sessions-token"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getOptionalAuthUserId(c);
  const defaultUserId = c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const mode = (c.req.query("mode") === "scribe" ? "scribe" : "copilot") as "copilot" | "scribe";

  const expiresIn = Math.min(Math.max(parseInt(c.req.query("expires_in") || "300", 10), 60), 600);
  const maxDuration = Math.min(Math.max(parseInt(c.req.query("max_duration") || "8640", 10), 60), 10800);

  // If unauthenticated guest, return safe simulation token without calling paid AssemblyAI API
  if (userId === defaultUserId) {
    return c.json({
      token: "demo-simulation-token",
      agent_id: "demo-agent-id",
      agent_mode: mode,
      expires_in_seconds: expiresIn,
      max_session_duration_seconds: maxDuration,
      mode: "simulation",
    });
  }

  const tokenInfo = await VoiceAgentService.generateToken(sql, c.env, userId, mode, expiresIn, maxDuration);
  return c.json(tokenInfo);
});

/**
 * Creates a new conversation session.
 * Requires authentication.
 */
sessionsRouter.post("/", rateLimiter(60000, 20, "sessions-create"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<{
    title?: string;
    audio_url?: string;
    raw_transcript?: any;
  }>().catch(() => ({ title: undefined, audio_url: undefined, raw_transcript: undefined }));

  const userId = await requireAuthUserId(c);
  const id = crypto.randomUUID();
  const rawTitle = (body.title || "").trim();
  const title = rawTitle.slice(0, 120) || `Live Muninn Session ${new Date().toLocaleTimeString()}`;
  const nowIso = new Date().toISOString();

  await sql(
    `INSERT INTO conversations (id, user_id, title, started_at, status, audio_url, raw_transcript)
     VALUES ($1, $2, $3, $4, 'active', $5, $6)`,
    [id, userId, title, nowIso, body.audio_url || null, body.raw_transcript ? JSON.stringify(body.raw_transcript) : null]
  );

  return c.json({
    id,
    user_id: userId,
    title,
    started_at: nowIso,
    status: "active",
    audio_url: body.audio_url || null,
    raw_transcript: body.raw_transcript || null,
    claim_count: 0,
  });
});

/**
 * Lists conversations for the requesting user (or default sample vault for guests).
 */
sessionsRouter.get("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getOptionalAuthUserId(c);
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "20", 10), 1), 100);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10), 0);

  const rows = (await sql(
    `SELECT
       cv.id,
       cv.user_id,
       cv.title,
       cv.started_at,
       cv.ended_at,
       cv.audio_url,
       cv.raw_transcript,
       cv.status,
       COUNT(c.id)::int AS claim_count
     FROM conversations cv
     LEFT JOIN claims c ON c.conversation_id = cv.id
     WHERE cv.user_id = $1
     GROUP BY cv.id
     ORDER BY cv.started_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )) as any[];

  return c.json(rows);
});

/**
 * Retrieves session detail.
 * Enforces tenant isolation: user can only view their own session or the public sample vault.
 */
sessionsRouter.get("/:id", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const sessionId = c.req.param("id");

  if (!UUID_REGEX.test(sessionId)) {
    return c.json({ detail: "Invalid session ID format" }, 400);
  }

  const userId = await getOptionalAuthUserId(c);
  const defaultUserId = c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";

  try {
    const convRows = (await sql(
      `SELECT * FROM conversations WHERE id = $1::uuid AND (user_id = $2::uuid OR user_id = $3::uuid) LIMIT 1`,
      [sessionId, userId, defaultUserId]
    )) as any[];

    if (convRows.length === 0) {
      return c.json({ detail: "Session not found" }, 404);
    }
    const conv = convRows[0];

    // Safely parse raw_transcript if it was stored as a JSON string
    if (typeof conv.raw_transcript === "string") {
      try {
        conv.raw_transcript = JSON.parse(conv.raw_transcript);
      } catch {
        // Keep as string if parsing fails
      }
    }

    const claimsRows = (await sql(
      `SELECT
         c.id,
         c.conversation_id,
         c.speaker_id,
         c.type,
         c.text,
         c.confidence,
         c.sensitivity,
         c.timestamp,
         sp.diarization_tag AS speaker_tag,
         ts.status AS task_status,
         ts.blocked_by AS task_blocked_by,
         ts.resurfaced_at AS task_resurfaced_at
       FROM claims c
       LEFT JOIN speakers sp ON sp.id = c.speaker_id
       LEFT JOIN task_state ts ON ts.claim_id = c.id
       WHERE c.conversation_id = $1::uuid
       ORDER BY c.timestamp ASC`,
      [sessionId]
    )) as any[];

    const ceRows = (await sql(
      `SELECT ce.claim_id, e.id, e.name, e.type, e.first_seen_at
       FROM claim_entities ce
       JOIN entities e ON e.id = ce.entity_id
       JOIN claims c ON c.id = ce.claim_id
       WHERE c.conversation_id = $1::uuid`,
      [sessionId]
    )) as any[];

    const claimEntitiesMap = new Map<string, any[]>();
    const entitiesMap = new Map<string, any>();

    for (const ce of ceRows) {
      const entity = {
        id: ce.id,
        name: ce.name,
        type: ce.type,
        first_seen_at: ce.first_seen_at,
      };
      if (!claimEntitiesMap.has(ce.claim_id)) {
        claimEntitiesMap.set(ce.claim_id, []);
      }
      claimEntitiesMap.get(ce.claim_id)!.push(entity);

      if (!entitiesMap.has(ce.id)) {
        entitiesMap.set(ce.id, entity);
      }
    }

    const formattedClaims = claimsRows.map((c) => ({
      id: c.id,
      conversation_id: c.conversation_id,
      speaker_id: c.speaker_id,
      speaker_tag: c.speaker_tag,
      type: c.type,
      text: c.text,
      confidence: c.confidence,
      sensitivity: c.sensitivity,
      timestamp: c.timestamp,
      entities: claimEntitiesMap.get(c.id) || [],
      task_state: c.task_status
        ? {
            status: c.task_status,
            blocked_by: c.task_blocked_by,
            resurfaced_at: c.task_resurfaced_at || [],
          }
        : null,
    }));

    const speakerRows = (await sql(
      `SELECT id, diarization_tag AS tag, resolved_name FROM speakers WHERE conversation_id = $1::uuid`,
      [sessionId]
    )) as any[];

    return c.json({
      conversation: {
        ...conv,
        claim_count: formattedClaims.length,
      },
      claims: formattedClaims,
      entities: Array.from(entitiesMap.values()),
      speakers: speakerRows,
    });
  } catch (err: any) {
    console.error(`[Sessions] Error fetching session ${sessionId}:`, err);
    return c.json(
      {
        detail: "Failed to fetch session detail",
        error: err?.message || String(err),
      },
      500
    );
  }
});

/**
 * Completes a session and triggers claim extraction.
 * Requires authentication and verifies ownership.
 */
sessionsRouter.post("/:id/complete", rateLimiter(60000, 10, "sessions-complete"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const sessionId = c.req.param("id");
  const userId = await requireAuthUserId(c);

  const payload = (await c.req
    .json<{
      external_session_id?: string;
      transcript_text?: string;
      raw_transcript?: any;
    }>()
    .catch(() => ({}))) as {
    external_session_id?: string;
    transcript_text?: string;
    raw_transcript?: any;
  };

  const convRows = (await sql(
    `SELECT * FROM conversations WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [sessionId, userId]
  )) as any[];

  if (convRows.length === 0) {
    return c.json({ detail: "Session not found or unauthorized" }, 404);
  }
  const conv = convRows[0];
  const nowIso = new Date().toISOString();

  let audioUrl = conv.audio_url;
  let rawTranscript = conv.raw_transcript;
  let rawTranscriptText = (payload.transcript_text || "").slice(0, 50000);

  if (payload.external_session_id) {
    const remoteData = await VoiceAgentService.fetchSession(c.env, payload.external_session_id);
    if (remoteData) {
      const artifacts = await VoiceAgentService.downloadSessionArtifacts(remoteData);
      if (artifacts.audio_url) audioUrl = artifacts.audio_url;
      if (artifacts.timeline) {
        rawTranscript = artifacts.timeline;
        const turns = artifacts.timeline.turns || [];
        const lines: string[] = [];
        for (const t of turns) {
          if (t.user_transcript) lines.push(`Speaker A: ${t.user_transcript}`);
          if (t.agent_text) lines.push(`Muninn: ${t.agent_text}`);
        }
        if (lines.length > 0) {
          rawTranscriptText = lines.join("\n");
        }
      }
    }
  }

  if (payload.raw_transcript && !rawTranscript) {
    rawTranscript = payload.raw_transcript;
  }

  await sql(
    `UPDATE conversations
     SET status = 'completed', ended_at = $1, audio_url = $2, raw_transcript = $3
     WHERE id = $4 AND user_id = $5`,
    [nowIso, audioUrl || null, rawTranscript ? JSON.stringify(rawTranscript) : null, sessionId, userId]
  );

  if (rawTranscriptText) {
    try {
      const extraction = await ExtractionService.extractFromTranscript(rawTranscriptText, c.env);
      await ExtractionService.persistExtraction(sql, sessionId, conv.user_id, extraction);

      const entityNames = extraction.entities.map((e) => e.name);
      try {
        await ResurfacingService.evaluateResurfacing(sql, c.env, conv.user_id, sessionId, entityNames);
      } catch (resurfErr) {
        console.warn("[Sessions] Resurfacing evaluation warning:", resurfErr);
      }
    } catch (extractErr) {
      console.error("[Sessions] Claim extraction warning:", extractErr);
    }
  }

  return c.json({ status: "completed", session_id: sessionId });
});

/**
 * Extracts claims from raw transcript text.
 * Requires authentication and applies payload limits.
 */
sessionsRouter.post("/extract-raw", rateLimiter(60000, 10, "sessions-extract"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const payload = await c.req.json<{
    transcript_text: string;
    title?: string;
  }>().catch(() => ({ transcript_text: "", title: "" }));

  if (!payload.transcript_text || payload.transcript_text.trim().length === 0) {
    return c.json({ detail: "transcript_text is required" }, 400);
  }

  if (payload.transcript_text.length > 50000) {
    return c.json({ detail: "transcript_text exceeds maximum limit of 50,000 characters" }, 400);
  }

  const userId = await requireAuthUserId(c);
  const convId = crypto.randomUUID();
  const rawTitle = (payload.title || "").trim();
  const title = rawTitle.slice(0, 120) || `Captured Conversation ${new Date().toLocaleTimeString()}`;
  const nowIso = new Date().toISOString();

  await sql(
    `INSERT INTO conversations (id, user_id, title, started_at, ended_at, status, raw_transcript)
     VALUES ($1, $2, $3, $4, $4, 'completed', $5)`,
    [convId, userId, title, nowIso, JSON.stringify({ text: payload.transcript_text })]
  );

  const extraction = await ExtractionService.extractFromTranscript(payload.transcript_text, c.env);
  const persisted = await ExtractionService.persistExtraction(sql, convId, userId, extraction);

  const entityNames = extraction.entities.map((e) => e.name);
  const events = await ResurfacingService.evaluateResurfacing(sql, c.env, userId, convId, entityNames);

  return c.json({
    conversation_id: convId,
    claims_extracted: persisted.length,
    entities_found: extraction.entities.length,
    resurfacing_events_triggered: events.length,
  });
});

/**
 * Synchronous voice note ingestion via AssemblyAI STT + Claude extraction.
 * Requires authentication, rate limiting, and maximum audio size validation.
 */
sessionsRouter.post("/quick-note", rateLimiter(60000, 6, "sessions-quicknote"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await requireAuthUserId(c);

  let audioBytes: ArrayBuffer;
  let mimeType = "audio/wav";

  const contentType = c.req.header("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await c.req.formData();
    const file = formData.get("audio") as File;
    if (!file) {
      return c.json({ detail: "audio file is required in form-data" }, 400);
    }
    audioBytes = await file.arrayBuffer();
    mimeType = file.type || "audio/wav";
  } else {
    audioBytes = await c.req.arrayBuffer();
    mimeType = contentType || "audio/wav";
  }

  if (!audioBytes || audioBytes.byteLength === 0) {
    return c.json({ detail: "Audio data is empty" }, 400);
  }

  // Enforce max 15MB audio payload
  if (audioBytes.byteLength > 15 * 1024 * 1024) {
    return c.json({ detail: "Audio data exceeds maximum limit of 15MB" }, 400);
  }

  try {
    const sttResult = await SyncSTTService.transcribeAudio(audioBytes, mimeType, c.env);
    const transcriptText = sttResult.text;

    const convId = crypto.randomUUID();
    const title = `Voice Note ${new Date().toLocaleTimeString()}`;
    const nowIso = new Date().toISOString();

    await sql(
      `INSERT INTO conversations (id, user_id, title, started_at, ended_at, status, raw_transcript)
       VALUES ($1, $2, $3, $4, $4, 'completed', $5)`,
      [convId, userId, title, nowIso, JSON.stringify({ text: transcriptText, words: sttResult.words })]
    );

    const extraction = await ExtractionService.extractFromTranscript(transcriptText, c.env);
    const persisted = await ExtractionService.persistExtraction(sql, convId, userId, extraction);

    const entityNames = extraction.entities.map((e) => e.name);
    const events = await ResurfacingService.evaluateResurfacing(sql, c.env, userId, convId, entityNames);

    return c.json({
      conversation_id: convId,
      transcript_text: transcriptText,
      claims_extracted: persisted.length,
      entities_found: extraction.entities.length,
      resurfacing_events_triggered: events.length,
    });
  } catch (err: any) {
    return c.json({ detail: "Quick note processing failed", error: err.message }, 500);
  }
});

/**
 * Permanently deletes a session and its associated claims, relationships, task states, and events.
 */
sessionsRouter.delete("/:id", rateLimiter(60000, 30, "sessions-delete"), async (c) => {
  const sessionId = c.req.param("id");
  if (!UUID_REGEX.test(sessionId)) {
    return c.json({ error: "Invalid session ID format" }, 400);
  }

  const sql = getDb(c.env.DATABASE_URL);
  const userId = (await getOptionalAuthUserId(c)) || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";

  // Check if session exists and belongs to the user (or default user)
  const existing = (await sql(
    `SELECT id, user_id FROM conversations WHERE id = $1::uuid AND (user_id = $2::uuid OR user_id = '00000000-0000-0000-0000-000000000001'::uuid) LIMIT 1`,
    [sessionId, userId]
  )) as Array<{ id: string; user_id: string }>;

  if (existing.length === 0) {
    return c.json({ error: "Session not found or access denied" }, 404);
  }

  try {
    // 1. Delete resurfacing events
    await sql(
      `DELETE FROM resurfacing_events 
       WHERE triggered_by_conv = $1::uuid 
          OR subject_claim_id IN (SELECT id FROM claims WHERE conversation_id = $1::uuid)`,
      [sessionId]
    );

    // 2. Delete relationships involving claims from this conversation
    await sql(
      `DELETE FROM relationships 
       WHERE from_claim_id IN (SELECT id FROM claims WHERE conversation_id = $1::uuid)
          OR to_claim_id IN (SELECT id FROM claims WHERE conversation_id = $1::uuid)`,
      [sessionId]
    );

    // 3. Delete claim_entities
    await sql(
      `DELETE FROM claim_entities 
       WHERE claim_id IN (SELECT id FROM claims WHERE conversation_id = $1::uuid)`,
      [sessionId]
    );

    // 4. Delete task states
    await sql(
      `DELETE FROM task_state 
       WHERE claim_id IN (SELECT id FROM claims WHERE conversation_id = $1::uuid)`,
      [sessionId]
    );

    // 5. Delete claims
    await sql(`DELETE FROM claims WHERE conversation_id = $1::uuid`, [sessionId]);

    // 6. Delete speakers
    await sql(`DELETE FROM speakers WHERE conversation_id = $1::uuid`, [sessionId]);

    // 7. Delete conversation record
    await sql(`DELETE FROM conversations WHERE id = $1::uuid`, [sessionId]);

    // 8. Clean up orphan entities no longer referenced by any remaining claims for this user
    try {
      await sql(
        `DELETE FROM entities 
         WHERE user_id = $1::uuid 
           AND id NOT IN (SELECT DISTINCT entity_id FROM claim_entities)`,
        [userId]
      );
    } catch {
      // Ignore if constraint error
    }

    return c.json({
      success: true,
      message: "Session and associated memory claims deleted successfully",
      deleted_id: sessionId,
    });
  } catch (err: any) {
    console.error(`[Sessions] Error deleting session ${sessionId}:`, err);
    return c.json({ error: "Failed to delete session", details: err?.message || String(err) }, 500);
  }
});

