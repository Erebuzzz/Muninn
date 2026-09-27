import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { ResurfacingService } from "../services/resurfacing";
import { getAuthUserId } from "../services/auth";

export const resurfacingRouter = new Hono<AppEnv>();

resurfacingRouter.get("/", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getAuthUserId(c);
  const includeDismissed = c.req.query("include_dismissed") === "true";
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "20", 10), 1), 50);

  let query = `
    SELECT
      re.id,
      re.user_id,
      re.triggered_by_conv,
      re.subject_claim_id,
      c.text AS subject_claim_text,
      re.message,
      re.reason,
      re.created_at,
      re.dismissed
    FROM resurfacing_events re
    LEFT JOIN claims c ON c.id = re.subject_claim_id
    WHERE re.user_id = $1
  `;
  const params: any[] = [userId];

  if (!includeDismissed) {
    query += ` AND re.dismissed = false`;
  }

  query += ` ORDER BY re.created_at DESC LIMIT $2`;
  params.push(limit);

  const rows = (await sql(query, params)) as any[];
  return c.json(rows);
});

resurfacingRouter.post("/:id/dismiss", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const eventId = c.req.param("id");

  const rows = (await sql(
    `UPDATE resurfacing_events SET dismissed = true WHERE id = $1::uuid RETURNING id`,
    [eventId]
  )) as any[];

  if (rows.length === 0) {
    return c.json({ detail: "Event not found" }, 404);
  }

  return c.json({ status: "dismissed", event_id: eventId });
});

resurfacingRouter.post("/evaluate", async (c) => {
  const sql = getDb(c.env.DATABASE_URL);
  const userId = await getAuthUserId(c);

  const events = await ResurfacingService.evaluateResurfacing(sql, c.env, userId);
  return c.json({ status: "ok", events_generated: events.length });
});
