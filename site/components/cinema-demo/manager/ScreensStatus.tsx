"use client";

import { useLocale, useTranslations } from "next-intl";
import { SCREEN_STATUSES } from "@/lib/cinema-demo/manager-data";

export function ScreensStatus() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";

  const statusLabel = (status: string) => {
    if (status === "active") return t("manager.statusActive");
    if (status === "upcoming") return t("manager.statusUpcoming");
    return t("manager.statusIssue");
  };

  return (
    <div className="mgr-screens">
      {SCREEN_STATUSES.map((screen) => (
        <article key={screen.id} className={`mgr-screen-card mgr-screen-card--${screen.status}`}>
          <header>
            <h3>{isAr ? screen.nameAr : screen.nameEn}</h3>
            <span className="mgr-screen-status">{statusLabel(screen.status)}</span>
          </header>
          <p className="cinema-movie-meta">{isAr ? screen.movieAr : screen.movieEn}</p>
          <p className="cinema-movie-meta">{screen.timeRange}</p>
          <div className="mgr-mini-grid" aria-hidden>
            {Array.from({ length: 25 }, (_, i) => (
              <span
                key={i}
                className={i < Math.round((screen.occupancy / 100) * 25) ? "is-filled" : ""}
              />
            ))}
          </div>
          <p className="mgr-screen-stat">
            {screen.occupancy}% · {screen.revenue.toLocaleString("ar-SY")} {t("currency")}
          </p>
        </article>
      ))}
    </div>
  );
}
