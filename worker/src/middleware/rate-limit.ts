import { Context, MiddlewareHandler } from "hono";
import { AppEnv } from "../types";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Creates an in-memory sliding window rate limiter middleware for Cloudflare Workers.
 *
 * @param windowMs Time window in milliseconds (e.g., 60000 for 1 minute)
 * @param maxRequests Maximum requests allowed within the window
 * @param bucketName Logical bucket name (e.g. 'auth-login', 'chat')
 */
export function rateLimiter(
  windowMs: number,
  maxRequests: number,
  bucketName: string
): MiddlewareHandler<AppEnv> {
  if (!rateLimitStores.has(bucketName)) {
    rateLimitStores.set(bucketName, new Map<string, RateLimitRecord>());
  }
  const store = rateLimitStores.get(bucketName)!;

  return async (c: Context<AppEnv>, next) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const now = Date.now();
    let record = store.get(ip);

    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      };
      store.set(ip, record);
    } else {
      record.count++;
    }

    // Prune stale records if store grows large
    if (store.size > 5000) {
      for (const [key, val] of store.entries()) {
        if (now > val.resetAt) {
          store.delete(key);
        }
      }
    }

    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - record.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)));

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return c.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded for ${bucketName}. Please retry in ${retryAfter} seconds.`,
        },
        429
      );
    }

    await next();
  };
}
