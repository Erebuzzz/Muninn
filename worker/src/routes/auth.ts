import { Hono } from "hono";
import { AppEnv } from "../types";
import { getDb } from "../db/client";
import {
  hashPassword,
  verifyPassword,
  createAuthToken,
  verifyAuthToken,
  getJwtSecret,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "../services/auth";
import { rateLimiter } from "../middleware/rate-limit";

export const authRouter = new Hono<AppEnv>();

authRouter.post("/register", rateLimiter(60000, 3, "auth-register"), async (c) => {
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
  const secret = getJwtSecret(c.env);

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

authRouter.post("/login", rateLimiter(60000, 5, "auth-login"), async (c) => {
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

  const secret = getJwtSecret(c.env);
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
  const secret = getJwtSecret(c.env);
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

authRouter.post("/forgot-password", rateLimiter(60000, 3, "auth-forgot"), async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
  const email = (body.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return c.json({ error: "A valid email address is required" }, 400);
  }

  const sql = getDb(c.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, email FROM users WHERE lower(email) = ${email} LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({
      message: "If an account exists with this email address, a verification code has been dispatched.",
    });
  }

  const user = rows[0] as { id: string; email: string };
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const secret = getJwtSecret(c.env);
  const recoveryToken = await createPasswordResetToken(user, code, secret);

  console.log(`[Muninn Auth] Password reset code for ${email}: ${code}`);

  return c.json({
    message: "If an account exists with this email address, a verification code has been dispatched.",
    recovery_token: recoveryToken,
    code,
  });
});

authRouter.post("/reset-password", rateLimiter(60000, 5, "auth-reset"), async (c) => {
  const body = await c.req
    .json<{
      email?: string;
      code?: string;
      recovery_token?: string;
      new_password?: string;
    }>()
    .catch(() => ({
      email: undefined as string | undefined,
      code: undefined as string | undefined,
      recovery_token: undefined as string | undefined,
      new_password: undefined as string | undefined,
    }));

  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || "").trim();
  const newPassword = body.new_password || "";
  const recoveryToken = (body.recovery_token || "").trim();

  if (!email || !email.includes("@")) {
    return c.json({ error: "A valid email address is required" }, 400);
  }

  if (!code || code.length < 6) {
    return c.json({ error: "A valid 6-digit verification code is required" }, 400);
  }

  if (!newPassword || newPassword.length < 6) {
    return c.json({ error: "New password must be at least 6 characters" }, 400);
  }

  const secret = getJwtSecret(c.env);

  if (recoveryToken) {
    const verified = await verifyPasswordResetToken(recoveryToken, secret);
    if (!verified || verified.email.toLowerCase() !== email || verified.code !== code) {
      return c.json({ error: "Invalid or expired recovery code. Please request a new code." }, 400);
    }
  }

  const sql = getDb(c.env.DATABASE_URL);
  const { hash, salt } = await hashPassword(newPassword);

  const updated = await sql`
    UPDATE users
    SET password_hash = ${hash}, salt = ${salt}
    WHERE lower(email) = ${email}
    RETURNING id, email
  `;

  if (updated.length === 0) {
    return c.json({ error: "Account not found or password update failed" }, 404);
  }

  return c.json({
    success: true,
    message: "Password updated successfully. You can now sign in with your new credentials.",
  });
});
