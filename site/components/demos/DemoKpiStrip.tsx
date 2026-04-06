"use client";

import { useTranslations } from "next-intl";

export function DemoKpiStrip() {
  const t = useTranslations("DemoKpiStrip");

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface/60 p-6">
      <p className="text-xs text-muted">{t("disclaimer")}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-bg/60 p-4">
          <p className="text-xs text-muted">{t("kpi1.label")}</p>
          <p className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
            {t("kpi1.value")}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-bg/60 p-4">
          <p className="text-xs text-muted">{t("kpi2.label")}</p>
          <p className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
            {t("kpi2.value")}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-bg/60 p-4">
          <p className="text-xs text-muted">{t("kpi3.label")}</p>
          <p className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
            {t("kpi3.value")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
        <span className="font-semibold text-amber-200">{t("alert.title")}</span>
        <span className="text-muted"> — {t("alert.body")}</span>
      </div>

      <div className="pt-2">
        <p className="mb-2 text-xs text-muted">{t("chartLabel")}</p>
        <svg
          viewBox="0 0 320 80"
          className="h-20 w-full text-gold"
          aria-hidden
        >
          <title>{t("chartLabel")}</title>
          <rect
            x="0"
            y="0"
            width="320"
            height="80"
            fill="none"
            className="stroke-white/10"
            strokeWidth="1"
            rx="4"
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points="16,56 56,44 104,52 152,28 200,36 248,20 296,32"
          />
        </svg>
      </div>
    </div>
  );
}
