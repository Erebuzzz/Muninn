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
    exp: now + 60 * 60 * 24 * 30,
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

export async function getAuthUserId(c: Context<AppEnv>): Promise<string> {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const secret = c.env.JWT_SECRET || "muninn-jwt-secret-key-prod-2026-super-secure";
    const decoded = await verifyAuthToken(token, secret);
    if (decoded?.sub) {
      return decoded.sub;
    }
  }

  return (
    c.req.query("user_id") ||
    c.env.DEFAULT_USER_ID ||
    "00000000-0000-0000-0000-000000000001"
  );
}
