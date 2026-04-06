import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimitContact } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  company: z.string().max(200).optional(),
  message: z.string().min(5).max(8000),
  intent: z.string().max(80).optional(),
  topic: z.string().max(80).optional(),
  /** Honeypot — must stay empty */
  companyWebsite: z.string().optional(),
  /** Cloudflare Turnstile — required when TURNSTILE_SECRET_KEY is set */
  turnstileToken: z.string().max(4000).optional(),
});

/**
 * Forwards leads to CONTACT_WEBHOOK_URL when set.
 * Payload includes: source, name, email, company, message, intent, topic, at (ISO).
 * CRM systems (Zapier, Make, HubSpot, etc.) can map intent/topic to pipelines.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimitContact(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.companyWebsite && parsed.data.companyWebsite.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstileToken(parsed.data.turnstileToken ?? "");
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "turnstile_failed" },
        { status: 400 },
      );
    }
  }

  const { name, email, company, message, intent, topic } = parsed.data;

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "tenegta-website",
          name,
          email,
          company,
          message,
          intent: intent ?? null,
          topic: topic ?? null,
          at: new Date().toISOString(),
        }),
      });
    } catch {
      return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
    }
  } else if (process.env.NODE_ENV === "development") {
    console.info("[contact]", { name, email, company, message, intent, topic });
  }

  return NextResponse.json({ ok: true });
}
