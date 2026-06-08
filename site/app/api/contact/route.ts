import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getContactEmailTo,
  isSmtpConfigured,
  sendContactViaSmtp,
  type ContactMessagePayload,
} from "@/lib/contact-smtp";
import { createContactLead } from "@/lib/growth/contact-lead";
import { getClientIp, rateLimitContact } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  company: z.string().max(200).optional(),
  message: z.string().min(5).max(8000),
  intent: z.string().max(80).optional(),
  topic: z.string().max(80).optional(),
  locale: z.enum(["ar", "en", "fr"]).default("ar"),
  serviceInterest: z
    .enum(["website", "automation-ai", "mobile-app", "general"])
    .optional(),
  discountCode: z.string().max(20).optional(),
  /** Honeypot — must stay empty */
  companyWebsite: z.string().optional(),
  /** Cloudflare Turnstile — required when TURNSTILE_SECRET_KEY is set */
  turnstileToken: z.string().max(4000).optional(),
});

function contactChannelsConfigured(): {
  smtp: boolean;
  formspree: boolean;
  webhook: boolean;
} {
  return {
    smtp: isSmtpConfigured(),
    formspree: Boolean(process.env.FORMSPREE_ENDPOINT?.trim()),
    webhook: Boolean(process.env.CONTACT_WEBHOOK_URL?.trim()),
  };
}

async function sendToFormspree(payload: Record<string, unknown>): Promise<boolean> {
  const url = process.env.FORMSPREE_ENDPOINT?.trim();
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[contact] Formspree HTTP error", {
        status: res.status,
        body: body.slice(0, 500),
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[contact] Formspree request failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

async function sendToWebhook(payload: Record<string, unknown>): Promise<boolean> {
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim();
  if (!webhook) return false;
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        source: "tenegta-website",
        at: payload.sentAt,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[contact] Webhook HTTP error", {
        status: res.status,
        webhook: webhook.split("?")[0],
        body: body.slice(0, 500),
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[contact] Webhook request failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Forwards leads via SMTP (Mailcow), FORMSPREE_ENDPOINT, and/or CONTACT_WEBHOOK_URL.
 */
export async function POST(req: Request) {
  const channels = contactChannelsConfigured();
  if (!channels.smtp && !channels.formspree && !channels.webhook) {
    console.error("[contact] No delivery channel configured", {
      hint: "Set SMTP_* (Mailcow), FORMSPREE_ENDPOINT, and/or CONTACT_WEBHOOK_URL",
    });
    return NextResponse.json(
      { ok: false, error: "service_unconfigured", message: "Contact service not configured" },
      { status: 503 },
    );
  }

  if (channels.smtp && !getContactEmailTo()) {
    console.error("[contact] SMTP configured but CONTACT_EMAIL_TO / SMTP_USER missing");
    return NextResponse.json(
      { ok: false, error: "service_unconfigured", message: "Contact service not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const limited = await rateLimitContact(ip);
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
  } catch (err) {
    console.error("[contact] Invalid JSON body", {
      error: err instanceof Error ? err.message : String(err),
    });
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

  const {
    name,
    email,
    company,
    message,
    intent,
    topic,
    locale,
    serviceInterest,
    discountCode,
  } = parsed.data;

  let leadResult: Awaited<ReturnType<typeof createContactLead>> | null = null;
  try {
    leadResult = await createContactLead({
      locale,
      name,
      email,
      company,
      message,
      serviceInterest,
      discountCode,
    });
  } catch (err) {
    console.error("[contact] lead creation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const host = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://tenegta.com";
  const adminUrl = leadResult?.orderId
    ? `${host}/${locale}/growth/admin/orders`
    : undefined;

  const messagePayload: ContactMessagePayload = {
    name,
    email,
    company,
    message,
    intent,
    topic,
    serviceInterest,
    discountCode: discountCode?.trim().toUpperCase() || undefined,
    creatorName: leadResult?.partnerName ?? undefined,
    discountBps: leadResult?.discountValid ? leadResult.discountBps : undefined,
    orderId: leadResult?.orderId ?? undefined,
    adminUrl,
    source: "tenegta.com",
    sentAt: new Date().toISOString(),
  };

  const payloadRecord = messagePayload as Record<string, unknown>;

  const deliveries: { key: string; run: () => Promise<boolean> }[] = [];
  if (channels.smtp) {
    deliveries.push({ key: "smtp", run: () => sendContactViaSmtp(messagePayload) });
  }
  if (channels.formspree) {
    deliveries.push({ key: "formspree", run: () => sendToFormspree(payloadRecord) });
  }
  if (channels.webhook) {
    deliveries.push({ key: "webhook", run: () => sendToWebhook(payloadRecord) });
  }

  const outcomes = await Promise.all(
    deliveries.map(async (d) => ({ key: d.key, ok: await d.run() })),
  );
  const anyOk = outcomes.some((o) => o.ok);

  if (!anyOk) {
    console.error("[contact] All configured channels failed", {
      email,
      intent,
      topic,
      channels: outcomes.map((o) => ({ [o.key]: o.ok })),
    });
    return NextResponse.json(
      { ok: false, error: "delivery_failed", message: "Contact delivery failed" },
      { status: 503 },
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      "[contact] delivered",
      Object.fromEntries(outcomes.map((o) => [o.key, o.ok])),
    );
  }

  return NextResponse.json({ ok: true });
}
