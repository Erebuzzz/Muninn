import { Hono, Context } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { AppEnv } from "./types";
import { sessionsRouter } from "./routes/sessions";
import { claimsRouter } from "./routes/claims";
import { reviewRouter } from "./routes/review";
import { graphRouter } from "./routes/graph";
import { resurfacingRouter } from "./routes/resurfacing";
import { chatRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";

const app = new Hono<AppEnv>();

const DEFAULT_ALLOWED_ORIGINS = [
  "https://muninn-nmk.pages.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "capacitor://localhost",
];

app.use("*", cors({
  origin: (origin, c) => {
    const configured = c.env.CORS_ORIGINS || "";
    const allowed = configured
      ? configured.split(",").map((s: string) => s.trim()).filter(Boolean)
      : DEFAULT_ALLOWED_ORIGINS;

    if (allowed.includes("*")) {
      return origin || "*";
    }

    if (!origin) {
      return allowed[0] || "https://muninn-nmk.pages.dev";
    }

    if (allowed.includes(origin)) {
      return origin;
    }

    return "";
  },
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"],
  maxAge: 600,
  credentials: true,
}));

const healthHandler = (c: Context<AppEnv>) => {
  return c.json({
    status: "healthy",
    service: "muninn-worker",
    version: "1.0.0",
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
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error("Worker unhandled error:", err);
  return c.json({
    error: "Internal Server Error",
    message: "An unexpected error occurred. Please try again later.",
  }, 500);
});

export default app;
