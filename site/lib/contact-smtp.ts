import nodemailer from "nodemailer";

export type ContactMessagePayload = {
  name: string;
  email: string;
  company?: string;
  message: string;
  intent?: string;
  topic?: string;
  source: string;
  sentAt: string;
};

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export function getContactEmailTo(): string {
  return (
    process.env.CONTACT_EMAIL_TO?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ""
  );
}

function smtpPort(): number {
  const raw = process.env.SMTP_PORT?.trim();
  const n = raw ? Number(raw) : 587;
  return Number.isFinite(n) && n > 0 ? n : 587;
}

function isLoopbackHost(host: string): boolean {
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

function buildTransport() {
  const host = process.env.SMTP_HOST!.trim();
  const port = smtpPort();
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;
  const tlsServername =
    process.env.SMTP_TLS_SERVERNAME?.trim() ||
    (isLoopbackHost(host) ? "mail.tenegta.com" : undefined);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
    ...(secure ? {} : { requireTLS: true }),
    ...(tlsServername
      ? {
          tls: {
            servername: tlsServername,
            // Same VPS: Mailcow cert is for mail.tenegta.com, not 127.0.0.1
            rejectUnauthorized: isLoopbackHost(host)
              ? process.env.SMTP_TLS_STRICT === "true"
              : process.env.SMTP_TLS_INSECURE !== "true",
          },
        }
      : {}),
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

function formatBody(payload: ContactMessagePayload): string {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.intent ? `Intent: ${payload.intent}` : null,
    payload.topic ? `Topic: ${payload.topic}` : null,
    `Source: ${payload.source}`,
    `Sent at: ${payload.sentAt}`,
    "",
    payload.message,
  ];
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

function buildSubject(payload: ContactMessagePayload): string {
  const topic = payload.topic ? ` — ${payload.topic}` : "";
  return `[TENEGTA] Contact${topic} — ${payload.name}`;
}

/**
 * Sends contact form submission via Mailcow (or any SMTP) to CONTACT_EMAIL_TO.
 */
export async function sendContactViaSmtp(
  payload: ContactMessagePayload,
): Promise<boolean> {
  if (!isSmtpConfigured()) return false;

  const to = getContactEmailTo();
  if (!to) {
    console.error("[contact] SMTP: CONTACT_EMAIL_TO or SMTP_USER required");
    return false;
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    `TENEGTA Website <${process.env.SMTP_USER!.trim()}>`;

  try {
    const transport = buildTransport();
    await transport.sendMail({
      from,
      to,
      replyTo: `${payload.name} <${payload.email}>`,
      subject: buildSubject(payload),
      text: formatBody(payload),
    });
    return true;
  } catch (err) {
    console.error("[contact] SMTP failed", {
      host: process.env.SMTP_HOST,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
