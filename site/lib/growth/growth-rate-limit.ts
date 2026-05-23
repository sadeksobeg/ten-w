import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

let limiterCache: Map<string, Ratelimit> | null = null;

function getLimiter(
  key: string,
  max: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`,
): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!limiterCache) limiterCache = new Map();
  let limiter = limiterCache.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: `tenegta-growth-${key}`,
    });
    limiterCache.set(key, limiter);
  }
  return limiter;
}

function inMemoryLimit(
  bucketKey: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false } {
  const now = Date.now();
  let b = buckets.get(bucketKey);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, b);
  }
  b.count += 1;
  if (b.count > max) return { ok: false };
  return { ok: true };
}

async function limit(
  scope: string,
  userId: string,
  max: number,
  window: `${number} h` | `${number} d`,
  windowMs: number,
): Promise<{ ok: true } | { ok: false }> {
  const key = `${scope}:${userId}`;
  const upstash = getLimiter(scope, max, window);
  if (upstash) {
    const res = await upstash.limit(key);
    if (!res.success) return { ok: false };
    return { ok: true };
  }
  return inMemoryLimit(key, max, windowMs);
}

export async function rateLimitGrowthAction(
  scope: "add_lead" | "payout" | "join_event" | "daily_checkin" | "appreciation",
  userId: string,
): Promise<{ ok: true } | { ok: false }> {
  switch (scope) {
    case "add_lead":
      return limit("add_lead", userId, 10, "1 h", 60 * 60 * 1000);
    case "payout":
      return limit("payout", userId, 3, "1 d", 24 * 60 * 60 * 1000);
    case "join_event":
      return limit("join_event", userId, 20, "1 d", 24 * 60 * 60 * 1000);
    case "daily_checkin":
      return limit("daily_checkin", userId, 1, "1 d", 24 * 60 * 60 * 1000);
    case "appreciation":
      return limit("appreciation", userId, 3, "1 d", 24 * 60 * 60 * 1000);
    default:
      return { ok: true };
  }
}
