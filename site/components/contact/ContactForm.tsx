"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TurnstileField } from "@/components/contact/TurnstileField";
import { trackEvent } from "@/lib/analytics";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Props = {
  defaultIntent?: string;
  defaultTopic?: string;
};

export function ContactForm({ defaultIntent, defaultTopic }: Props) {
  const t = useTranslations("ContactPage.form");
  const [status, setStatus] = useState<
    "idle" | "sending" | "ok" | "err" | "rate"
  >("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRequired = Boolean(TURNSTILE_SITE_KEY);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const companyWebsite = String(fd.get("companyWebsite") ?? "");
    if (companyWebsite.length > 0) {
      setStatus("ok");
      return;
    }

    const intent = String(fd.get("intent") ?? "").trim();
    const topic = String(fd.get("topic") ?? "").trim();
    let message = String(fd.get("message") ?? "").trim();
    if (intent || topic) {
      const header = [
        intent ? `Intent: ${intent}` : null,
        topic ? `Topic: ${topic}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      message = `${header}\n\n${message}`;
    }

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      message,
      intent: intent || undefined,
      topic: topic || undefined,
      companyWebsite: String(fd.get("companyWebsite") ?? "").trim(),
      turnstileToken: turnstileToken || undefined,
    };

    if (turnstileRequired && !turnstileToken.trim()) {
      setStatus("err");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.status === 429 || data.error === "rate_limited") {
        setStatus("rate");
        return;
      }
      if (!res.ok || !data.ok) throw new Error("bad");
      setStatus("ok");
      trackEvent("contact_submit", {
        intent: intent || "none",
        topic: topic || "none",
      });
      form.reset();
      setTurnstileToken("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative mx-auto max-w-xl space-y-4 rounded-xl border border-white/10 bg-surface-elevated/80 p-6"
      noValidate
    >
      <input
        type="hidden"
        name="intent"
        defaultValue={defaultIntent ?? ""}
      />
      <input type="hidden" name="topic" defaultValue={defaultTopic ?? ""} />

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <label htmlFor="companyWebsite">{t("honeypot")}</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <div>
        <label htmlFor="company" className="mb-1 block text-sm font-medium">
          {t("company")}
        </label>
        <input
          id="company"
          name="company"
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>

      {TURNSTILE_SITE_KEY ? (
        <TurnstileField siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
      ) : null}

      <Button
        type="submit"
        disabled={
          status === "sending" || (turnstileRequired && !turnstileToken.trim())
        }
        className="w-full sm:w-auto"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </Button>

      {status === "ok" ? (
        <p className="text-sm text-gold" role="status">
          {t("success")}
        </p>
      ) : null}
      {status === "rate" ? (
        <p className="text-sm text-amber-300" role="alert">
          {t("rateLimited")}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="text-sm text-red-400" role="alert">
          {t("error")}
        </p>
      ) : null}
    </form>
  );
}
