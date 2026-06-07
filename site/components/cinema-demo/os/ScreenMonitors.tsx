"use client";

import { useLocale, useTranslations } from "next-intl";
import { SCREEN_STATUSES } from "@/lib/cinema-demo/manager-data";

function MiniSeatGrid({ occupancy }: { occupancy: number }) {
  const filled = Math.round((occupancy / 100) * 40);
  return (
    <div className="cinema-os-mini-grid" aria-hidden>
      {Array.from({ length: 40 }, (_, i) => (
        <span key={i} className={i < filled ? "is-occupied" : i < filled + 2 ? "is-vip" : ""} />
      ))}
    </div>
  );
}

export function ScreenMonitors() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";

  const borderClass = (status: string, id: number) => {
    if (status === "active" && id === 1) return "is-active";
    if (status === "active") return "is-upcoming";
    return "is-standby";
  };

  return (
    <div className="cinema-os-screens">
      {SCREEN_STATUSES.map((screen) => {
        const filled = Math.round((screen.occupancy / 100) * screen.capacity);
        return (
          <article
            key={screen.id}
            className={`cinema-os-screen-monitor ${borderClass(screen.status, screen.id)}`}
          >
            <header>
              <span className="cinema-os-screen-pulse" aria-hidden />
              <strong>{isAr ? screen.nameAr : screen.nameEn}</strong>
            </header>
            <p className="cinema-os-screen-movie">{isAr ? screen.movieAr : screen.movieEn}</p>
            <p className="cinema-os-screen-meta">{screen.timeRange}</p>
            <p className="cinema-os-screen-occupancy">
              {t("os.screenOccupancy", { filled, capacity: screen.capacity })}
            </p>
            <MiniSeatGrid occupancy={screen.occupancy} />
            <div className="cinema-os-progress" aria-hidden>
              <div className="cinema-os-progress-fill" style={{ width: `${screen.occupancy}%` }} />
            </div>
            {screen.id === 1 ? (
              <p className="cinema-os-screen-remaining">{t("os.screenRemaining", { min: 26 })}</p>
            ) : screen.startsInMin ? (
              <p className="cinema-os-screen-remaining">{t("os.screenStartsIn", { min: screen.startsInMin })}</p>
            ) : (
              <p className="cinema-os-screen-remaining">{t("os.screenBookedCount", { filled, capacity: screen.capacity })}</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
