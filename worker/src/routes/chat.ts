import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { ContextEngineService } from "../services/context-engine";
import { getAuthUserId } from "../services/auth";

export const chatRouter = new Hono<AppEnv>();

chatRouter.post("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<{
    query: string;
    conversation_id?: string;
    max_citations?: number;
  }>();

  if (!body.query) {
    return c.json({ detail: "query is required" }, 400);
  }

  const userId = await getAuthUserId(c);
  const maxCitations = body.max_citations || 5;

  const result = await ContextEngineService.answerChatQuery(
    sql,
    c.env,
    userId,
    body.query,
    body.conversation_id,
    maxCitations
  );

  return c.json(result);
});
