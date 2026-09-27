import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import { hashPassword, verifyPassword, createAuthToken, verifyAuthToken } from "../services/auth";

export const authRouter = new Hono<AppEnv>();

authRouter.post("/register", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string }>().catch(() => ({ email: undefined, password: undefined, name: undefined }));
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = (body.name || "").trim() || null;

  if (!email || !email.includes("@")) {
    return c.json({ error: "A valid email address is required" }, 400);
  }

  if (!password || password.length < 6) {
    return c.json({ error: "Password or PIN must be at least 6 characters" }, 400);
  }

  const sql = getDb(c.env.DATABASE_URL);

  const existing = await sql`
    SELECT id FROM users WHERE lower(email) = ${email} LIMIT 1
  `;

  if (existing.length > 0) {
    return c.json({ error: "An account with this email already exists" }, 409);
  }

  const userId = crypto.randomUUID();
  const { hash, salt } = await hashPassword(password);
  const secret = c.env.JWT_SECRET || "muninn-jwt-secret-key-prod-2026-super-secure";

  const rows = await sql`
    INSERT INTO users (id, email, password_hash, salt, name, created_at)
    VALUES (${userId}, ${email}, ${hash}, ${salt}, ${name}, NOW())
    RETURNING id, email, name, created_at
  `;

  const user = rows[0] as { id: string; email: string; name: string | null; created_at: string };
  const token = await createAuthToken(user, secret);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }, 201);
});

authRouter.post("/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({ email: undefined, password: undefined }));
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const sql = getDb(c.env.DATABASE_URL);

  const rows = await sql`
    SELECT id, email, password_hash, salt, name, created_at
    FROM users
    WHERE lower(email) = ${email}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const user = rows[0] as {
    id: string;
    email: string;
    password_hash: string | null;
    salt: string | null;
    name: string | null;
    created_at: string;
  };

  if (!user.password_hash || !user.salt) {
    return c.json({ error: "This account has not set a password yet. Please register or reset credentials." }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash, user.salt);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const secret = c.env.JWT_SECRET || "muninn-jwt-secret-key-prod-2026-super-secure";
  const token = await createAuthToken(user, secret);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.substring(7).trim();
  const secret = c.env.JWT_SECRET || "muninn-jwt-secret-key-prod-2026-super-secure";
  const decoded = await verifyAuthToken(token, secret);

  if (!decoded || !decoded.sub) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  const sql = getDb(c.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${decoded.sub}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const user = rows[0] as { id: string; email: string; name: string | null; created_at: string };

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    },
  });
});
