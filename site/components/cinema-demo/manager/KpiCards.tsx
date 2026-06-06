"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAnimatedNumber } from "@/components/cinema-demo/hooks/useAnimatedNumber";
import { drawSparkline } from "@/lib/cinema-demo/charts";
import { MANAGER_KPIS } from "@/lib/cinema-demo/manager-data";

export function KpiCards() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="mgr-kpi-grid">
      {MANAGER_KPIS.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} isAr={isAr} />
      ))}
    </div>
  );
}

function KpiCard({ kpi, isAr }: { kpi: (typeof MANAGER_KPIS)[0]; isAr: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animated = useAnimatedNumber(kpi.value, 1400);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSparkline(ctx, kpi.sparkline, canvas.width, canvas.height, "#f5c518");
  }, [kpi.sparkline]);

  const display =
    kpi.id === "occupancy"
      ? `${animated}%`
      : `${animated.toLocaleString("ar-SY")} ${isAr ? kpi.suffixAr : kpi.suffixEn}`;

  return (
    <div className="mgr-kpi-card">
      <p className="mgr-kpi-label">{isAr ? kpi.labelAr : kpi.labelEn}</p>
      <p className="mgr-kpi-value">{display}</p>
      <p className="mgr-kpi-trend">{isAr ? kpi.trendLabelAr : kpi.trendLabelEn}</p>
      <canvas ref={canvasRef} width={120} height={32} className="mgr-sparkline" />
    </div>
  );
}
