"use client";

import { useEffect, useMemo, useState } from "react";
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
  const liveBrowsers = useCinemaDemoStore((s) => s.liveBrowsers);
  const setLiveBrowsers = useCinemaDemoStore((s) => s.setLiveBrowsers);
  const toggleSeat = useCinemaDemoStore((s) => s.toggleSeat);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  useEffect(() => {
    if (!showtimeId) setPhase("movies");
  }, [showtimeId, setPhase]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveBrowsers(10 + Math.floor(Math.random() * 6));
    }, 5000);
    return () => clearInterval(id);
  }, [setLiveBrowsers]);

  const countdown = useMemo(() => {
    const base = 154;
    return `${Math.floor(base / 60)}:${String(base % 60).padStart(2, "0")}`;
  }, []);

  if (!showtimeId) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const count = selectedSeatIds.length;

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={2} />
        <div className="cinema-seats-live">
          <span className="cinema-live-dot" />
          {t("seats.liveBrowsers", { count: liveBrowsers })}
        </div>
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("showtime")}>
          {t("back")}
        </button>
        <h2 className="cinema-title">{t("seats.title")}</h2>
        <p className="cinema-subtitle">{t("seats.subtitle")}</p>
        <p className="cinema-pricing-hint">
          <span className="cinema-badge cinema-badge--vip">{t("seats.vipScarcity")}</span>
          <span className="cinema-badge cinema-badge--value">{t("seats.bestValue")}</span>
          <span className="cinema-badge cinema-badge--timer">{countdown}</span>
        </p>

        <CinemaSeatMap showtimeId={showtimeId} selectedIds={selectedSeatIds} onToggle={toggleSeat} live />
        <p className="cinema-pin-hint">{t("seats.pinchHint")}</p>
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
