type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 12;

function prune(now: number) {
  for (const [ip, b] of buckets) {
    if (b.resetAt < now) buckets.delete(ip);
  }
}

export function rateLimitContact(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
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
