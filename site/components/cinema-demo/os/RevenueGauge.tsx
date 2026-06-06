"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function RevenueGauge() {
  const t = useTranslations("CinemaDemo");
  const liveRevenue = useCinemaDemoStore((s) => s.liveRevenue);
  const target = useCinemaDemoStore((s) => s.revenueTarget);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 140;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const pct = Math.min(1, liveRevenue / target);
    const cx = size / 2;
    const cy = size / 2 + 8;
    const r = 52;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * pct);
    ctx.strokeStyle = "#c9922a";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = "#c9922a";
    ctx.font = "bold 18px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(pct * 100)}%`, cx, cy - 4);
  }, [liveRevenue, target]);

  return (
    <div className="cinema-os-revenue">
      <h4>{t("os.revenueTitle")}</h4>
      <canvas ref={canvasRef} aria-label={t("os.revenueTitle")} />
      <p>{liveRevenue.toLocaleString("ar-SY")} / {target.toLocaleString("ar-SY")}</p>
      <p className="cinema-os-revenue-pct">{t("os.revenuePct", { pct: Math.round((liveRevenue / target) * 100) })}</p>
    </div>
  );
}
