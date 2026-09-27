import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { ContextEngineService } from "../services/context-engine";
import { getOptionalAuthUserId } from "../services/auth";
import { rateLimiter } from "../middleware/rate-limit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const chatRouter = new Hono<AppEnv>();

// 20 requests per minute per IP for LLM context chat
chatRouter.post("/", rateLimiter(60000, 20, "chat"), async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  let body: {
    query?: string;
    conversation_id?: string;
    max_citations?: number;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request", message: "Invalid JSON body" }, 400);
  }

  if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
    return c.json({ error: "Bad Request", message: "query is required" }, 400);
  }

  const query = body.query.trim();
  if (query.length > 1000) {
    return c.json({ error: "Bad Request", message: "query must not exceed 1000 characters" }, 400);
  }

  if (body.conversation_id && !UUID_REGEX.test(body.conversation_id)) {
    return c.json({ error: "Bad Request", message: "Invalid conversation_id format" }, 400);
  }

  let maxCitations = 5;
  if (typeof body.max_citations === "number" && !isNaN(body.max_citations)) {
    maxCitations = Math.max(1, Math.min(20, Math.floor(body.max_citations)));
  }

  const userId = await getOptionalAuthUserId(c);

  const result = await ContextEngineService.answerChatQuery(
    sql,
    c.env,
    userId,
    query,
    body.conversation_id,
    maxCitations
  );

  return c.json(result);
});
