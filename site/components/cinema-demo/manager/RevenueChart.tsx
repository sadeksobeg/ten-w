"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hover, setHover] = useState<{ x: number; y: number; label: string; value: number; index: number } | null>(null);

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
      hover ? { x: hover.x * 2, index: hover.index } : null,
    );
  }, [progress, isAr, hover]);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const labels = isAr ? WEEK_DAYS_AR : WEEK_DAYS_EN;
      const padL = 40 * (rect.width / canvas.clientWidth);
      const padR = 16 * (rect.width / canvas.clientWidth);
      const chartW = rect.width - padL - padR;
      const rel = (x - padL) / chartW;
      if (rel < 0 || rel > 1) {
        setHover(null);
        return;
      }
      const idx = Math.round(rel * (labels.length - 1));
      const clamped = Math.max(0, Math.min(labels.length - 1, idx));
      setHover({
        x,
        y: e.clientY - wrap.getBoundingClientRect().top,
        label: labels[clamped],
        value: WEEKLY_REVENUE_THIS[clamped],
        index: clamped,
      });
    },
    [isAr],
  );

  return (
    <div className="mgr-chart-card" ref={wrapRef}>
      <h3>{t("manager.revenueChart")}</h3>
      <div className="mgr-chart-legend">
        <span className="mgr-legend-this">{t("manager.thisWeek")}</span>
        <span className="mgr-legend-last">{t("manager.lastWeek")}</span>
      </div>
      <div className="mgr-chart-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="mgr-revenue-canvas"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
        {hover ? (
          <>
            <span className="mgr-chart-crosshair" style={{ left: hover.x }} aria-hidden />
            <span className="mgr-chart-tooltip" style={{ left: hover.x, top: Math.max(8, hover.y - 36) }}>
              {hover.label}: {hover.value.toLocaleString("ar-SY")}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
