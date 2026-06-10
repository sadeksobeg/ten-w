"use client";

import { useTranslations } from "next-intl";

export function HubPreviewDashboard() {
  const t = useTranslations("Creators.public.bento.hubPreview");

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-wider text-violet-300/80">{t("dashboard")}</p>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-bold text-emerald-200">LIVE</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: t("metricViews"), value: "24.8K", tone: "rose" },
          { label: t("metricRank"), value: "#3", tone: "gold" },
          { label: t("metricEarn"), value: "$340", tone: "violet" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-white/10 bg-black/35 p-2">
            <p className="text-[7px] text-white/40">{m.label}</p>
            <p className={`font-[family-name:var(--font-cairo)] text-sm font-black ${m.tone === "gold" ? "text-[var(--creator-secondary)]" : m.tone === "rose" ? "text-rose-300" : "text-violet-300"}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-1">
        {[88, 62, 94].map((w, i) => (
          <div key={i} className="h-1 overflow-hidden rounded-full bg-white/8">
            <div className="fc-service-bar h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
