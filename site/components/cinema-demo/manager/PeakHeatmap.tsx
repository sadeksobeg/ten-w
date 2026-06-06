"use client";

import { Fragment, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PEAK_HEATMAP, PEAK_SLOTS_AR, PEAK_SLOTS_EN, WEEK_DAYS_AR, WEEK_DAYS_EN } from "@/lib/cinema-demo/manager-data";

export function PeakHeatmap() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const days = isAr ? WEEK_DAYS_AR : WEEK_DAYS_EN;
  const slots = isAr ? PEAK_SLOTS_AR : PEAK_SLOTS_EN;

  return (
    <div className="mgr-heatmap-card">
      <h3>{t("manager.peakTitle")}</h3>
      <div className="mgr-heatmap">
        <div className="mgr-heatmap-corner" />
        {slots.map((slot) => (
          <span key={slot} className="mgr-heatmap-slot">
            {slot}
          </span>
        ))}
        {PEAK_HEATMAP.map((row, ri) => (
          <Fragment key={days[ri]}>
            <span className="mgr-heatmap-day">{days[ri]}</span>
            {row.map((val, ci) => (
              <span
                key={`${ri}-${ci}`}
                className="mgr-heatmap-cell"
                style={{ background: `rgba(245, 197, 24, ${val / 120})` }}
                title={`${val}%`}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <p className="mgr-insight">{t("manager.peakInsight")}</p>
    </div>
  );
}
