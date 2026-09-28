import { sign, verify } from "hono/jwt";
import { Context } from "hono";
import { AppEnv } from "../types";

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return {
    hash: toHex(bits),
    salt: toHex(salt),
  };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const result = await hashPassword(password, storedSalt);
  return result.hash === storedHash;
}

import { HTTPException } from "hono/http-exception";

export function getJwtSecret(env: AppEnv["Bindings"]): string {
  if (env.JWT_SECRET && env.JWT_SECRET.trim().length >= 16) {
    return env.JWT_SECRET.trim();
  }
  return "muninn-jwt-prod-auth-secret-key-2026-strict";
}

export async function createAuthToken(
  user: { id: string; email: string; name?: string | null },
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || "",
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days
  };
  return sign(payload, secret, "HS256");
}

export async function verifyAuthToken(
  token: string,
  secret: string
): Promise<{ sub: string; email: string; name?: string } | null> {
  try {
    const payload = await verify(token, secret, "HS256");
    if (payload && payload.sub) {
      return {
        sub: String(payload.sub),
        email: String(payload.email || ""),
        name: payload.name ? String(payload.name) : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createPasswordResetToken(
  user: { id: string; email: string },
  code: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    code,
    purpose: "password_reset",
    iat: now,
    exp: now + 15 * 60, // 15 minutes
  };
  return sign(payload, secret, "HS256");
}

export async function verifyPasswordResetToken(
  token: string,
  secret: string
): Promise<{ sub: string; email: string; code: string } | null> {
  try {
    const payload = await verify(token, secret, "HS256");
    if (payload && payload.sub && payload.purpose === "password_reset") {
      return {
        sub: String(payload.sub),
        email: String(payload.email || ""),
        code: String(payload.code || ""),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the authenticated user's ID if a valid Bearer token is provided.
 * If unauthenticated, returns the public DEFAULT_USER_ID for read-only sample vault access.
 * NEVER accepts user_id from query parameters or headers.
 */
export async function getOptionalAuthUserId(c: Context<AppEnv>): Promise<string> {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const secret = getJwtSecret(c.env);
    const decoded = await verifyAuthToken(token, secret);
    if (decoded?.sub) {
      return decoded.sub;
    }
  }

  return c.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001";
}

// Backward compatibility alias for read endpoints
export const getAuthUserId = getOptionalAuthUserId;

/**
 * Enforces strict authentication. Throws 401 Unauthorized if no valid Bearer token is present.
 */
export async function requireAuthUserId(c: Context<AppEnv>): Promise<string> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      res: c.json({ error: "Unauthorized", message: "Authentication required: Missing Bearer token." }, 401),
    });
  }

  const token = authHeader.substring(7).trim();
  const secret = getJwtSecret(c.env);
  const decoded = await verifyAuthToken(token, secret);

  if (!decoded?.sub) {
    throw new HTTPException(401, {
      res: c.json({ error: "Unauthorized", message: "Authentication required: Invalid or expired token." }, 401),
    });
  }

  return decoded.sub;
}

