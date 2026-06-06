"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaSeatExperience } from "@/components/cinema-demo/CinemaSeatExperience";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
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
  const [countdownSec, setCountdownSec] = useState(154);

  useEffect(() => {
    if (!showtimeId) setPhase("movies");
  }, [showtimeId, setPhase]);

  useEffect(() => {
    const browsersId = window.setInterval(() => {
      setLiveBrowsers(10 + Math.floor(Math.random() * 6));
    }, 5000);
    const timerId = window.setInterval(() => {
      setCountdownSec((s) => (s <= 1 ? 154 : s - 1));
    }, 1000);
    return () => {
      clearInterval(browsersId);
      clearInterval(timerId);
    };
  }, [setLiveBrowsers]);

  if (!showtimeId) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const count = selectedSeatIds.length;
  const countdown = `${Math.floor(countdownSec / 60)}:${String(countdownSec % 60).padStart(2, "0")}`;

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={2} />
        <div className="cinema-seats-live">
          <CinemaIcon name="live" size={14} />
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
          <span className="cinema-badge cinema-badge--timer">
            <CinemaIcon name="clock" size={12} className="inline-icon" />
            {countdown}
          </span>
        </p>

        <CinemaSeatExperience showtimeId={showtimeId} selectedIds={selectedSeatIds} onToggle={toggleSeat} live />
        <p className="cinema-pin-hint">{t("seats.dragHint")}</p>
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
