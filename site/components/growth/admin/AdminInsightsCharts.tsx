"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  drawDonutChart,
  drawHorizontalBarChart,
  drawLineChart,
  type ChartPoint,
  type DonutSegment,
} from "@/lib/growth/canvas-chart";
import type {
  LevelDistRow,
  TopPartnerRow,
  WeekWinRatePoint,
} from "@/lib/growth/admin-insights-data";

type Props = {
  weeklyWinRateSeries: WeekWinRatePoint[];
  topPartnersByClosed: TopPartnerRow[];
  levelDistribution: LevelDistRow[];
};

export function AdminInsightsCharts({
  weeklyWinRateSeries,
  topPartnersByClosed,
  levelDistribution,
}: Props) {
  const t = useTranslations("Growth.admin.insightsPage.charts");
  const locale = useLocale();
  const rtl = locale === "ar";
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (lineRef.current && !reduced) {
      const closed: ChartPoint[] = weeklyWinRateSeries.map((w) => ({
        label: w.label,
        value: w.closed,
      }));
      drawLineChart(lineRef.current, closed, { rtl });
    }
    if (barRef.current) {
      drawHorizontalBarChart(barRef.current, topPartnersByClosed, { rtl });
    }
    if (donutRef.current) {
      const segments: DonutSegment[] = levelDistribution.map((l) => ({
        label: l.label,
        value: l.value,
        color: l.color,
      }));
      drawDonutChart(donutRef.current, segments);
    }
  }, [weeklyWinRateSeries, topPartnersByClosed, levelDistribution, rtl]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div>
        <h3 className="text-sm font-bold text-white/80">{t("winRate")}</h3>
        <canvas ref={lineRef} className="mt-3 h-[200px] w-full" role="img" aria-label={t("winRate")} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white/80">{t("topPartners")}</h3>
        <canvas ref={barRef} className="mt-3 h-[220px] w-full" role="img" aria-label={t("topPartners")} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white/80">{t("levelDist")}</h3>
        <canvas ref={donutRef} className="mt-3 h-[220px] w-full" role="img" aria-label={t("levelDist")} />
      </div>
    </div>
  );
}
