"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { drawBarChart } from "@/lib/growth/canvas-chart";
import type { MonthEarningsPoint } from "@/lib/growth/get-dashboard";

type Props = {
  data: MonthEarningsPoint[];
};

export function EarningsMonthlyChart({ data }: Props) {
  const t = useTranslations("Growth.earnings.chart");
  const locale = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rtl = locale === "ar";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nf =
      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
    const fmt = (cents: number) =>
      new Intl.NumberFormat(nf, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(cents / 100);

    drawBarChart(
      canvas,
      data.map((d) => ({ label: d.label, value: d.amountCents / 100 })),
      { rtl, valueFormat: fmt },
    );
    if (!reduced) {
      canvas.style.opacity = "0";
      requestAnimationFrame(() => {
        canvas.style.transition = "opacity 0.4s ease";
        canvas.style.opacity = "1";
      });
    }
  }, [data, locale, rtl]);

  const empty = data.every((d) => d.amountCents === 0);

  return (
    <div>
      <h3 className="text-sm font-bold text-white">{t("title")}</h3>
      {empty ? (
        <p className="mt-4 text-sm text-white/50">{t("empty")}</p>
      ) : (
        <canvas ref={canvasRef} className="mt-4 h-[200px] w-full" aria-label={t("title")} />
      )}
    </div>
  );
}
