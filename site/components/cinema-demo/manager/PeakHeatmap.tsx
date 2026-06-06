"use client";

import { Fragment, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PEAK_HEATMAP, PEAK_SLOTS_AR, PEAK_SLOTS_EN, WEEK_DAYS_AR, WEEK_DAYS_EN } from "@/lib/cinema-demo/manager-data";

export function PeakHeatmap() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const days = isAr ? WEEK_DAYS_AR : WEEK_DAYS_EN;
  const slots = isAr ? PEAK_SLOTS_AR : PEAK_SLOTS_EN;
  const [active, setActive] = useState<{ ri: number; ci: number; val: number } | null>(null);

  const recommendation =
    active && active.val >= 90
      ? t("manager.peakRecHigh")
      : active && active.val >= 60
        ? t("manager.peakRecMid")
        : t("manager.peakRecLow");

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
              <button
                key={`${ri}-${ci}`}
                type="button"
                className={`mgr-heatmap-cell ${active?.ri === ri && active?.ci === ci ? "is-active" : ""}`}
                style={{ background: `rgba(245, 197, 24, ${val / 120})` }}
                onMouseEnter={() => setActive({ ri, ci, val })}
                onFocus={() => setActive({ ri, ci, val })}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                aria-label={`${days[ri]} ${slots[ci]} ${val}%`}
              />
            ))}
          </Fragment>
        ))}
      </div>
      {active ? (
        <div className="mgr-heatmap-popover" role="status">
          <strong>
            {days[active.ri]} · {slots[active.ci]}
          </strong>
          <span>{active.val}% {t("manager.peakOccupancy")}</span>
          <p>{recommendation}</p>
        </div>
      ) : (
        <p className="mgr-insight">{t("manager.peakInsight")}</p>
      )}
    </div>
  );
}
