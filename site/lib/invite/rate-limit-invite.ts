import { getClientIp, rateLimitContact } from "@/lib/rate-limit";

/** Reuse contact rate limiter bucket for invite accept POSTs. */
export async function rateLimitInviteAccept(req: Request) {
  return rateLimitContact(getClientIp(req));
}
