import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { VoiceAgentService } from "../services/voice-agent";
import { ExtractionService } from "../services/extraction";
import { ResurfacingService } from "../services/resurfacing";
import { SyncSTTService } from "../services/sync-stt";

export const sessionsRouter = new Hono<AppEnv>();

sessionsRouter.get("/token", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("user_id") || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const expiresIn = parseInt(c.req.query("expires_in") || "300", 10);
  const maxDuration = parseInt(c.req.query("max_duration") || "8640", 10);

  const tokenInfo = await VoiceAgentService.generateToken(sql, c.env, userId, expiresIn, maxDuration);
  return c.json(tokenInfo);
});

sessionsRouter.post("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<{
    user_id?: string;
    title?: string;
    audio_url?: string;
    raw_transcript?: any;
  }>();

  const userId = body.user_id || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const id = crypto.randomUUID();
  const title = body.title || `Live Muninn Session ${new Date().toLocaleTimeString()}`;
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

sessionsRouter.get("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("user_id") || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
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

sessionsRouter.get("/:id", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const sessionId = c.req.param("id");

  const convRows = (await sql(
    `SELECT * FROM conversations WHERE id = $1 LIMIT 1`,
    [sessionId]
  )) as any[];

  if (convRows.length === 0) {
    return c.json({ detail: "Session not found" }, 404);
  }
  const conv = convRows[0];

  const claimsRows = (await sql(
    `SELECT
       c.*,
       sp.diarization_tag AS speaker_tag,
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
     LEFT JOIN speakers sp ON sp.id = c.speaker_id
     LEFT JOIN task_state ts ON ts.claim_id = c.id
     LEFT JOIN claim_entities ce ON ce.claim_id = c.id
     LEFT JOIN entities e ON e.id = ce.entity_id
     WHERE c.conversation_id = $1
     GROUP BY c.id, sp.diarization_tag, ts.status, ts.blocked_by, ts.resurfaced_at
     ORDER BY c.timestamp ASC`,
    [sessionId]
  )) as any[];

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
    entities: c.entities || [],
    task_state: c.task_status
      ? {
          status: c.task_status,
          blocked_by: c.task_blocked_by,
          resurfaced_at: c.task_resurfaced_at || [],
        }
      : null,
  }));

  const speakerRows = (await sql(
    `SELECT id, diarization_tag AS tag, resolved_name FROM speakers WHERE conversation_id = $1`,
    [sessionId]
  )) as any[];

  const entitiesMap = new Map<string, any>();
  for (const c of formattedClaims) {
    for (const e of c.entities) {
      if (!entitiesMap.has(e.id)) {
        entitiesMap.set(e.id, e);
      }
    }
  }

  return c.json({
    conversation: {
      ...conv,
      claim_count: formattedClaims.length,
    },
    claims: formattedClaims,
    entities: Array.from(entitiesMap.values()),
    speakers: speakerRows,
  });
});

sessionsRouter.post("/:id/complete", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const sessionId = c.req.param("id");
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
    `SELECT * FROM conversations WHERE id = $1 LIMIT 1`,
    [sessionId]
  )) as any[];

  if (convRows.length === 0) {
    return c.json({ detail: "Session not found" }, 404);
  }
  const conv = convRows[0];
  const nowIso = new Date().toISOString();

  let audioUrl = conv.audio_url;
  let rawTranscript = conv.raw_transcript;
  let rawTranscriptText = payload.transcript_text || "";

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
     WHERE id = $4`,
    [nowIso, audioUrl || null, rawTranscript ? JSON.stringify(rawTranscript) : null, sessionId]
  );

  if (rawTranscriptText) {
    const extraction = await ExtractionService.extractFromTranscript(rawTranscriptText, c.env);
    await ExtractionService.persistExtraction(sql, sessionId, conv.user_id, extraction);

    const entityNames = extraction.entities.map((e) => e.name);
    await ResurfacingService.evaluateResurfacing(sql, c.env, conv.user_id, sessionId, entityNames);
  }

  return c.json({ status: "completed", session_id: sessionId });
});

sessionsRouter.post("/extract-raw", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const payload = await c.req.json<{
    transcript_text: string;
    user_id?: string;
    title?: string;
  }>();

  if (!payload.transcript_text) {
    return c.json({ detail: "transcript_text is required" }, 400);
  }

  const userId = payload.user_id || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const convId = crypto.randomUUID();
  const title = payload.title || `Captured Conversation ${new Date().toLocaleTimeString()}`;
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

sessionsRouter.post("/quick-note", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("user_id") || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";

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

