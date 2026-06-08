"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CreatorStudioShareTools } from "@/components/creators/CreatorStudioShareTools";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

const STAT_KEYS = ["creators", "content", "commissions"] as const;

export function StudioHero() {
  const t = useTranslations("Creators.studio");

  function scrollToHowItWorks() {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative overflow-hidden border-b border-white/10 px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
      <style>{`
        @keyframes studio-stat-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .studio-stat-float {
          animation: studio-stat-float 4.5s ease-in-out infinite;
        }
        .studio-stat-float--1 { animation-delay: 0s; }
        .studio-stat-float--2 { animation-delay: 0.75s; }
        .studio-stat-float--3 { animation-delay: 1.5s; }
        @media (prefers-reduced-motion: reduce) {
          .studio-stat-float { animation: none; }
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_80%_20%,rgba(201,160,97,0.22),transparent_50%)]"
      />
      <div
        aria-hidden
        className="hero-aurora pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-screen"
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
            href="/ascend"
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 motion-safe:hover:scale-[1.02]"
          >
            {t("hero.joinCta")}
          </Link>
          <GoldButton variant="ghost" className="min-h-12 px-6" onClick={scrollToHowItWorks}>
            {t("hero.watchHow")}
          </GoldButton>
        </div>

        <div className="relative mt-14 grid gap-4 sm:grid-cols-3">
          {STAT_KEYS.map((key, i) => (
            <GlassCard
              key={key}
              className={`studio-stat-float studio-stat-float--${i + 1} border border-white/10 bg-white/[0.04] p-5 text-center sm:text-start`}
            >
              <div className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
                {t(`hero.stats.${key}.value`)}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-white/50">
                {t(`hero.stats.${key}.label`)}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
