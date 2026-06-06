"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { calcRoi } from "@/lib/cinema-demo/roi";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaRoiPanel() {
  const t = useTranslations("CinemaDemo");
  const roiSeats = useCinemaDemoStore((s) => s.roiSeats);
  const setRoiSeats = useCinemaDemoStore((s) => s.setRoiSeats);
  const goToClosing = useCinemaDemoStore((s) => s.goToClosing);

  const result = useMemo(() => calcRoi(roiSeats), [roiSeats]);
  const roiDisplay = result.roiRatio.toFixed(1);

  return (
    <section className="cinema-phase">
      <div className="cinema-container cinema-roi">
        <h2 className="cinema-title text-center">{t("roi.title")}</h2>
        <p className="cinema-subtitle text-center">{t("roi.subtitle")}</p>

        <label className="cinema-roi-slider-label" htmlFor="roi-seats">
          {t("roi.seatsLabel")}: <strong>{roiSeats}</strong>
        </label>
        <input
          id="roi-seats"
          type="range"
          min={50}
          max={500}
          step={10}
          value={roiSeats}
          onChange={(e) => setRoiSeats(Number(e.target.value))}
          className="cinema-roi-slider"
        />

        <div className="cinema-roi-stats">
          <div className="cinema-stat">
            <p className="cinema-stat-value">{result.extraRevenueMonthly.toLocaleString("ar-SY")}</p>
            <p className="cinema-stat-label">{t("roi.extraRevenue")}</p>
          </div>
          <div className="cinema-stat">
            <p className="cinema-stat-value">{result.timeSavedHours}h</p>
            <p className="cinema-stat-label">{t("roi.timeSaved")}</p>
          </div>
          <div className="cinema-stat">
            <p className="cinema-stat-value">1:{roiDisplay}</p>
            <p className="cinema-stat-label">{t("roi.ratio")}</p>
          </div>
        </div>

        <div className="cinema-roi-actions">
          <Link href="/contact?intent=demo&topic=cinema" className="cinema-btn cinema-btn-primary">
            {t("roi.contactCta")}
          </Link>
          <button type="button" className="cinema-btn cinema-btn-ghost" onClick={goToClosing}>
            {t("roi.continue")}
          </button>
        </div>
      </div>
    </section>
  );
}
