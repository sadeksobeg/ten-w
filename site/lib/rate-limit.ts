import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 12;

let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!upstashLimiter) {
    upstashLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "15 m"),
      prefix: "tenegta-contact",
    });
  }
  return upstashLimiter;
}

function prune(now: number) {
  for (const [ip, b] of buckets) {
    if (b.resetAt < now) buckets.delete(ip);
  }
}

function rateLimitInMemory(
  ip: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);

  let b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(ip, b);
  }

  b.count += 1;
  if (b.count > MAX_REQUESTS) {
    const retryAfterSec = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  return { ok: true };
}

export async function rateLimitContact(
  ip: string,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    const res = await limiter.limit(ip);
    if (!res.success) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((res.reset - Date.now()) / 1000),
      );
      return { ok: false, retryAfterSec };
    }
    return { ok: true };
  }
  return rateLimitInMemory(ip);
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
