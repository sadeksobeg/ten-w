"use client";

import { useLocale } from "next-intl";
import { SCREEN_STATUSES } from "@/lib/cinema-demo/manager-data";

function MiniSeatGrid({ occupancy, capacity }: { occupancy: number; capacity: number }) {
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
  const locale = useLocale();
  const isAr = locale === "ar";

  const borderClass = (status: string, id: number) => {
    if (status === "active" && id === 1) return "is-active";
    if (status === "active") return "is-upcoming";
    return "is-standby";
  };

  return (
    <div className="cinema-os-screens">
      {SCREEN_STATUSES.map((screen) => (
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
          {screen.id === 1 ? (
            <>
              <p>
                {Math.round((screen.occupancy / 100) * screen.capacity)} / {screen.capacity}
              </p>
              <MiniSeatGrid occupancy={screen.occupancy} capacity={screen.capacity} />
              <p className="cinema-os-screen-remaining">يتبقى 26 دقيقة</p>
            </>
          ) : screen.id === 2 ? (
            <>
              <p>يبدأ في {screen.startsInMin ?? 47} دقيقة</p>
              <p>
                {Math.round((screen.occupancy / 100) * screen.capacity)} / {screen.capacity}
              </p>
              <div className="cinema-os-progress">
                <div style={{ width: `${screen.occupancy}%` }} />
              </div>
            </>
          ) : (
            <p>
              {Math.round((screen.occupancy / 100) * screen.capacity)} من أصل {screen.capacity} حجزاً
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
