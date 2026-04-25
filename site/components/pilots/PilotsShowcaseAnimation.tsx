"use client";

import { useLocale, useTranslations } from "next-intl";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PilotsShowcaseAnimation() {
  const t = useTranslations("PilotsShowcasePage");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated/60 shadow-xl shadow-black/30">
      <div
        className={cx(
          "pointer-events-none absolute inset-0 opacity-90",
          isAr ? "[transform:scaleX(-1)]" : "",
        )}
        aria-hidden
      >
        <div className="showcase-grid absolute inset-0" />
        <div className="showcase-sweep absolute inset-0" />
        <div className="showcase-orbs absolute inset-0" />
      </div>

      <div className="relative p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wide text-gold/90">
              {t("reel.eyebrow")}
            </p>
            <p className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-semibold text-foreground sm:text-2xl">
              {t("reel.title")}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("reel.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
              <p className="text-[11px] text-muted">{t("reel.kpi1.label")}</p>
              <p className="mt-1 text-sm font-semibold text-gold">
                {t("reel.kpi1.value")}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
              <p className="text-[11px] text-muted">{t("reel.kpi2.label")}</p>
              <p className="mt-1 text-sm font-semibold text-gold">
                {t("reel.kpi2.value")}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
              <p className="text-[11px] text-muted">{t("reel.kpi3.label")}</p>
              <p className="mt-1 text-sm font-semibold text-gold">
                {t("reel.kpi3.value")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
            <p className="text-xs font-semibold text-gold">{t("reel.cards.c1.title")}</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("reel.cards.c1.body")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
            <p className="text-xs font-semibold text-gold">{t("reel.cards.c2.title")}</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("reel.cards.c2.body")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
            <p className="text-xs font-semibold text-gold">{t("reel.cards.c3.title")}</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("reel.cards.c3.body")}
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs text-muted/80">{t("reel.disclaimer")}</p>
      </div>

      <style jsx>{`
        .showcase-grid {
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            );
          background-size: 46px 46px;
          mask-image: radial-gradient(circle at 50% 40%, black 0%, transparent 65%);
          transform: translateZ(0);
          animation: grid-pan 18s linear infinite;
        }

        .showcase-sweep {
          background: radial-gradient(
            800px 260px at 15% 30%,
            rgba(212, 175, 55, 0.18),
            transparent 60%
          );
          animation: sweep 7.5s ease-in-out infinite;
        }

        .showcase-orbs {
          background: radial-gradient(
              280px 280px at 75% 45%,
              rgba(120, 140, 255, 0.14),
              transparent 60%
            ),
            radial-gradient(
              360px 360px at 25% 70%,
              rgba(212, 175, 55, 0.12),
              transparent 62%
            );
          animation: orbs 10s ease-in-out infinite;
        }

        @keyframes grid-pan {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 180px 120px;
          }
        }

        @keyframes sweep {
          0% {
            transform: translate3d(-6%, -2%, 0) scale(1);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(10%, 4%, 0) scale(1.06);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(-6%, -2%, 0) scale(1);
            opacity: 0.55;
          }
        }

        @keyframes orbs {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            filter: saturate(1);
          }
          50% {
            transform: translate3d(0, -10px, 0);
            filter: saturate(1.25);
          }
        }
      `}</style>
    </div>
  );
}

