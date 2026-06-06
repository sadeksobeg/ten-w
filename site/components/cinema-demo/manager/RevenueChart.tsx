"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { drawLineChart } from "@/lib/cinema-demo/charts";
import {
  WEEKLY_REVENUE_LAST,
  WEEKLY_REVENUE_THIS,
  WEEK_DAYS_AR,
  WEEK_DAYS_EN,
} from "@/lib/cinema-demo/manager-data";

export function RevenueChart() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1800);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    drawLineChart(
      canvas,
      WEEKLY_REVENUE_THIS,
      WEEKLY_REVENUE_LAST,
      isAr ? WEEK_DAYS_AR : WEEK_DAYS_EN,
      progress,
    );
  }, [progress, isAr]);

  return (
    <div className="mgr-chart-card">
      <h3>{t("manager.revenueChart")}</h3>
      <div className="mgr-chart-legend">
        <span className="mgr-legend-this">{t("manager.thisWeek")}</span>
        <span className="mgr-legend-last">{t("manager.lastWeek")}</span>
      </div>
      <canvas ref={canvasRef} className="mgr-revenue-canvas" />
    </div>
  );
}
