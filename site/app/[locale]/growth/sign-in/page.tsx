"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { getSession, signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { PasswordInput } from "@/components/growth/ui/PasswordInput";

function SignInForm() {
  const t = useTranslations("Growth.auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill) setEmail(prefill);
  }, [searchParams]);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const d = reduceMotion ? 0 : 0.55;
  const stagger = reduceMotion ? 0 : 0.11;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("invalid");
        return;
      }
      const session = await getSession();
      router.push(session?.user?.role === "ADMIN" ? "/growth/admin" : "/growth");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const heroLines = ["signInHeroLine1", "signInHeroLine2", "signInHeroLine3"] as const;

  return (
    <div
      dir={dir}
      className="flex min-h-[min(100vh-6rem,880px)] flex-col gap-10 pb-8 md:gap-14 md:pb-12"
    >
      <section className="relative mx-auto w-full max-w-3xl flex-1 px-1 pt-2 md:pt-6">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -start-8 top-0 size-48 rounded-full bg-purple-500/20 blur-3xl md:size-64"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -end-6 bottom-0 size-40 rounded-full bg-gold/25 blur-3xl md:size-56"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <motion.div
          className="relative space-y-5 text-center"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: stagger, delayChildren: reduceMotion ? 0 : 0.08 },
            },
          }}
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: d } },
            }}
            className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold/95"
          >
            {t("signInHeroEyebrow")}
          </motion.span>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: d } },
            }}
            className="font-[family-name:var(--font-cairo)] text-balance text-2xl font-extrabold leading-tight text-white md:text-4xl md:leading-tight"
          >
            {t("signInHeroTitle")}
          </motion.h1>

          <ul className="mx-auto max-w-xl space-y-3 text-pretty text-sm text-white/70 md:text-base">
            {heroLines.map((key) => (
              <motion.li
                key={key}
                variants={{
                  hidden: { opacity: 0, x: reduceMotion ? 0 : locale === "ar" ? 20 : -20 },
                  show: { opacity: 1, x: 0, transition: { duration: d } },
                }}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-start shadow-[0_0_24px_rgba(0,0,0,0.25)] backdrop-blur-sm"
              >
                {t(key)}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      <div className="mx-auto mt-auto w-full max-w-lg shrink-0">
        <GlassCard className="p-4 sm:p-8">
          <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
            {t("signInTitle")}
          </h2>
          {registered ? (
            <p
              className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              role="status"
            >
              {t("registeredBanner")}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs text-white/55">{t("email")}</span>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <PasswordInput
              name="password"
              label={t("password")}
              required
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />

            {error ? (
              <div className="text-sm text-red-300" role="alert">
                {t("signInError")}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg disabled:opacity-60"
            >
              {t("submit")}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

export default function GrowthSignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
