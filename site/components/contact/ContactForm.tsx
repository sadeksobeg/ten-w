"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TurnstileField } from "@/components/contact/TurnstileField";
import { trackEvent } from "@/lib/analytics";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Props = {
  defaultIntent?: string;
  defaultTopic?: string;
};

function SuccessBurst() {
  const sparks = [
    { x: "12%", y: "18%", d: 0 },
    { x: "78%", y: "22%", d: 0.08 },
    { x: "88%", y: "55%", d: 0.16 },
    { x: "18%", y: "72%", d: 0.1 },
    { x: "50%", y: "8%", d: 0.12 },
    { x: "65%", y: "78%", d: 0.2 },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
      aria-hidden
    >
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[120%] w-[120%] bg-[radial-gradient(ellipse_at_50%_40%,rgba(201,160,97,0.22)_0%,transparent_52%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_12px_rgba(255,215,0,0.8)]"
          style={{ left: s.x, top: s.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{
            duration: 1.2,
            delay: 0.45 + s.d,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function AnimatedSuccessMark() {
  return (
    <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-gold/25 blur-2xl"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/70 bg-gradient-to-br from-gold/25 via-gold/5 to-transparent shadow-[0_0_48px_rgba(201,160,97,0.45)]"
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          damping: 14,
          stiffness: 280,
          delay: 0.05,
        }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gold-bright"
          aria-hidden
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function buildSystemPrefillMessage(
  locale: string,
  systemDesc: string,
): string {
  if (!systemDesc.trim()) return "";
  const prefixes: Record<string, string> = {
    ar: "أريد بناء النظام التالي:",
    en: "I want to build the following system:",
    fr: "Je veux construire le système suivant:",
  };
  const prefix = prefixes[locale] ?? prefixes.en;
  return `${prefix}\n${systemDesc}`;
}

function ContactFormInner({ defaultIntent, defaultTopic }: Props) {
  const t = useTranslations("ContactPage.form");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const systemDesc = searchParams.get("system") ?? "";
  const systemType = searchParams.get("type") ?? "";
  const prefillMessage = buildSystemPrefillMessage(locale, systemDesc);
  const resolvedTopic = defaultTopic ?? systemType;
  const [status, setStatus] = useState<
    "idle" | "sending" | "ok" | "err" | "rate"
  >("idle");
  const [errorKind, setErrorKind] = useState<"generic" | "validation">(
    "generic",
  );
  const [formKey, setFormKey] = useState(0);
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
      setErrorKind("generic");
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
      if (!res.ok || !data.ok) {
        setErrorKind(
          res.status === 400 && data.error === "validation"
            ? "validation"
            : "generic",
        );
        setStatus("err");
        return;
      }
      setStatus("ok");
      trackEvent("lead_generated", { source: "contact_form" });
      trackEvent("contact_submit", {
        intent: intent || "none",
        topic: topic || "none",
      });
      form.reset();
      setTurnstileToken("");
    } catch {
      setErrorKind("generic");
      setStatus("err");
    }
  }

  function handleSendAnother() {
    setFormKey((k) => k + 1);
    setStatus("idle");
    setTurnstileToken("");
  }

  return (
    <div className="relative mx-auto max-w-xl min-h-[min(28rem,75vh)]">
      <AnimatePresence mode="wait">
        {status !== "ok" ? (
          <motion.form
            key={formKey}
            onSubmit={onSubmit}
            initial={formKey === 0 ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -16,
              filter: "blur(6px)",
              transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative space-y-4 rounded-xl border border-white/10 bg-surface-elevated/80 p-6"
            noValidate
          >
            <input
              type="hidden"
              name="intent"
              defaultValue={defaultIntent ?? ""}
            />
            <input
              type="hidden"
              name="topic"
              defaultValue={resolvedTopic}
            />

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
              <label
                htmlFor="company"
                className="mb-1 block text-sm font-medium"
              >
                {t("company")}
              </label>
              <input
                id="company"
                name="company"
                className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium"
              >
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={5}
                rows={5}
                defaultValue={prefillMessage}
                className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>

            {TURNSTILE_SITE_KEY ? (
              <TurnstileField
                siteKey={TURNSTILE_SITE_KEY}
                onToken={setTurnstileToken}
              />
            ) : null}

            <Button
              type="submit"
              disabled={
                status === "sending" ||
                (turnstileRequired && !turnstileToken.trim())
              }
              className="w-full sm:w-auto"
            >
              {status === "sending" ? t("sending") : t("submit")}
            </Button>

            {status === "rate" ? (
              <p className="text-sm text-amber-300" role="alert">
                {t("rateLimited")}
              </p>
            ) : null}
            {status === "err" ? (
              <p className="text-sm text-red-400" role="alert">
                {errorKind === "validation"
                  ? t("validation.checkFields")
                  : t("error")}
              </p>
            ) : null}
          </motion.form>
        ) : (
          <motion.div
            key="success"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 320,
              mass: 0.85,
            }}
            className="relative flex min-h-[min(26rem,70vh)] flex-col items-center justify-center overflow-hidden rounded-xl border border-gold/25 bg-surface-elevated/90 px-6 py-14 text-center shadow-[0_0_0_1px_rgba(201,160,97,0.12),0_24px_80px_-24px_rgba(0,0,0,0.55)]"
          >
            <SuccessBurst />
            <AnimatedSuccessMark />
            <motion.h3
              className="relative z-[1] max-w-md text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
            >
              {t("successTitle")}
            </motion.h3>
            <motion.p
              className="relative z-[1] mt-3 max-w-md text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.45 }}
            >
              {t("successSubtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="relative z-[1] mt-8"
            >
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendAnother}
                className="min-w-[12rem]"
              >
                {t("sendAnother")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactForm(props: Props) {
  return (
    <Suspense fallback={null}>
      <ContactFormInner {...props} />
    </Suspense>
  );
}
