import { Hono } from "hono";
import { cors } from "hono/cors";
import { AppEnv } from "./types";
import { sessionsRouter } from "./routes/sessions";
import { claimsRouter } from "./routes/claims";
import { reviewRouter } from "./routes/review";
import { graphRouter } from "./routes/graph";
import { resurfacingRouter } from "./routes/resurfacing";
import { chatRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";

const app = new Hono<AppEnv>();

app.use("*", cors({
  origin: (origin, c) => {
    const configured = c.env.CORS_ORIGINS || "";
    const list = configured.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (!origin || list.length === 0 || list.includes("*") || list.includes(origin)) {
      return origin || "*";
    }
    return list[0];
  },
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

const healthHandler = (c: any) => {
  return c.json({
    status: "healthy",
    service: "muninn-worker",
    runtime: "cloudflare-workers",
    framework: "hono",
    version: "1.0.0",
    llm_gateway: c.env.LLM_GATEWAY_URL || "https://llm-gateway.assemblyai.com/v1",
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

const api = new Hono<AppEnv>();
api.route("/auth", authRouter);
api.route("/sessions", sessionsRouter);
api.route("/claims", claimsRouter);
api.route("/review", reviewRouter);
api.route("/graph", graphRouter);
api.route("/resurfacing", resurfacingRouter);
api.route("/chat", chatRouter);

// Support both /api/* and root routes
app.route("/api", api);
app.route("/", api);

app.onError((err, c) => {
  console.error("Worker unhandled error:", err);
  return c.json({
    error: "Internal Server Error",
    message: err.message,
  }, 500);
});

export default app;
