"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CreatorStudioShareTools } from "@/components/creators/CreatorStudioShareTools";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

const FACT_KEYS = ["commission", "discount", "products"] as const;

export function StudioHero() {
  const t = useTranslations("Creators.studio");

  function scrollToHowItWorks() {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative overflow-hidden border-b border-white/10 px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(201,160,97,0.22),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-gold/80 sm:text-start">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-center font-[family-name:var(--font-cairo)] text-4xl font-extrabold leading-[1.05] text-white sm:text-start sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base text-white/70 sm:mx-0 sm:text-start md:text-lg">
          {t("hero.tagline")}
        </p>

        <div className="mt-8 flex justify-center sm:justify-start">
          <CreatorStudioShareTools title={t("title")} />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href="/growth/register"
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 motion-safe:hover:scale-[1.02]"
          >
            {t("hero.joinCta")}
          </Link>
          <Link
            href="/order"
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-gold/40 bg-gold/10 px-6 py-3 text-sm font-semibold text-gold transition hover:border-gold/60"
          >
            {t("hero.orderCta")}
          </Link>
          <GoldButton variant="ghost" className="min-h-12 px-6" onClick={scrollToHowItWorks}>
            {t("hero.watchHow")}
          </GoldButton>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {FACT_KEYS.map((key) => (
            <GlassCard
              key={key}
              className="border border-white/10 bg-white/[0.04] p-5 text-center sm:text-start"
            >
              <div className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
                {t(`hero.facts.${key}.value`)}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-white/50">
                {t(`hero.facts.${key}.label`)}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
