import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { ContextEngineService } from "../services/context-engine";
import { getOptionalAuthUserId } from "../services/auth";

export const graphRouter = new Hono<AppEnv>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

graphRouter.get("/entities", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getOptionalAuthUserId(c);
  const entityName = c.req.query("entity_name");

  const graphData = await ContextEngineService.getEntityGraph(sql, userId, entityName);
  return c.json(graphData);
});

graphRouter.get("/dependencies/:claim_id", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const claimId = c.req.param("claim_id");

  if (!UUID_REGEX.test(claimId)) {
    return c.json({ detail: "Invalid claim ID format" }, 400);
  }

  const userId = await getOptionalAuthUserId(c);
  const defaultUserId = c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";

  // Enforce claim ownership check before running recursive CTE
  const allowed = (await sql`
    SELECT c.id FROM claims c
    JOIN conversations cv ON cv.id = c.conversation_id
    WHERE c.id = ${claimId}::uuid AND (cv.user_id = ${userId} OR cv.user_id = ${defaultUserId})
    LIMIT 1
  `) as any[];

  if (allowed.length === 0) {
    return c.json({ detail: "Claim not found or access denied" }, 404);
  }

  const chain = await ContextEngineService.getDependencyChain(sql, claimId);
  return c.json(chain);
});
