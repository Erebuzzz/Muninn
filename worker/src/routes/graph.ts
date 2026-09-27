import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { ContextEngineService } from "../services/context-engine";

export const graphRouter = new Hono<AppEnv>();

graphRouter.get("/entities", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("user_id") || c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
  const entityName = c.req.query("entity_name");

  const graphData = await ContextEngineService.getEntityGraph(sql, userId, entityName);
  return c.json(graphData);
});

graphRouter.get("/dependencies/:claim_id", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const claimId = c.req.param("claim_id");

  const chain = await ContextEngineService.getDependencyChain(sql, claimId);
  return c.json(chain);
});
