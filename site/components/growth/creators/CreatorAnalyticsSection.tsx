"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { drawLineChart } from "@/lib/growth/canvas-chart";
import type { CreatorAnalyticsPoint } from "@/lib/growth/creator-arena";

type Props = {
  series: CreatorAnalyticsPoint[];
  totalSubmissions: number;
  totalReferrals: number;
  cupPoints: number;
  approvalRate: number;
  benchmarks: { avgSubmissions: number; avgClicks: number };
};

export function CreatorAnalyticsSection({
  series,
  totalSubmissions,
  totalReferrals,
  cupPoints,
  approvalRate,
  benchmarks,
}: Props) {
  const t = useTranslations("Creators.analytics");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || series.length < 2) return;
    drawLineChart(
      canvas,
      series.map((s) => ({ label: s.weekKey.slice(-3), value: s.submissions })),
      { strokeColor: "#C9922A" },
    );
  }, [series]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "submissions", value: totalSubmissions },
          { key: "referrals", value: totalReferrals },
          { key: "cup", value: cupPoints },
          { key: "approval", value: `${approvalRate}%` },
        ].map((m) => (
          <div key={m.key} className="creator-card p-4">
            <p className="text-[10px] uppercase text-white/45">{t(`metric.${m.key}`)}</p>
            <p className="creator-metric mt-1">{m.value}</p>
          </div>
        ))}
      </div>
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("chartTitle")}</h2>
        <canvas ref={canvasRef} width={640} height={220} className="mt-4 w-full max-w-full rounded-xl bg-black/20" />
        <p className="mt-3 text-xs text-white/55">
          {totalSubmissions >= benchmarks.avgSubmissions
            ? t("aboveAvg", { pct: Math.round(((totalSubmissions - benchmarks.avgSubmissions) / Math.max(benchmarks.avgSubmissions, 1)) * 100) })
            : t("belowAvg", { pct: Math.round(((benchmarks.avgSubmissions - totalSubmissions) / Math.max(benchmarks.avgSubmissions, 1)) * 100) })}
        </p>
      </GlassCard>
    </div>
  );
}
