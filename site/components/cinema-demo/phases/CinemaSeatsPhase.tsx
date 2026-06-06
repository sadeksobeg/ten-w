"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  CinemaSeatMap,
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaSeatsPhase() {
  const t = useTranslations("CinemaDemo");
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const selectedSeatIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const toggleSeat = useCinemaDemoStore((s) => s.toggleSeat);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  useEffect(() => {
    if (!showtimeId) setPhase("movies");
  }, [showtimeId, setPhase]);

  if (!showtimeId) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const count = selectedSeatIds.length;

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={2} />
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("showtime")}>
          {t("back")}
        </button>
        <h2 className="cinema-title">{t("seats.title")}</h2>
        <p className="cinema-subtitle">{t("seats.subtitle")}</p>

        <CinemaSeatMap
          showtimeId={showtimeId}
          selectedIds={selectedSeatIds}
          onToggle={toggleSeat}
        />
      </div>

      <div className="cinema-sticky-bar">
        <div>
          <p className="cinema-sticky-price">
            {total.toLocaleString("ar-SY")} {t("currency")}
          </p>
          <p className="cinema-movie-meta">
            {count} {t("seats.countLabel")}
            {count > 0 ? ` · ${seatLabelsForSelection(showtimeId, selectedSeatIds).join("، ")}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="cinema-btn cinema-btn-primary"
          disabled={count === 0}
          onClick={() => setPhase("checkout")}
        >
          {t("seats.continue")}
        </button>
      </div>
    </section>
  );
}
