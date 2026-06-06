"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";
import { getMovie, getShowtime } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaCheckoutPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const movieId = useCinemaDemoStore((s) => s.movieId);
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const selectedSeatIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const guestName = useCinemaDemoStore((s) => s.guestName);
  const setGuestName = useCinemaDemoStore((s) => s.setGuestName);
  const confirmCheckout = useCinemaDemoStore((s) => s.confirmCheckout);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  const movie = movieId ? getMovie(movieId) : null;
  const showtime = showtimeId ? getShowtime(showtimeId) : null;

  useEffect(() => {
    if (!movie || !showtime || !showtimeId || selectedSeatIds.length === 0) {
      setPhase("seats");
    }
  }, [movie, showtime, showtimeId, selectedSeatIds.length, setPhase]);

  if (!movie || !showtime || !showtimeId || selectedSeatIds.length === 0) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const seats = seatLabelsForSelection(showtimeId, selectedSeatIds);

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={3} />
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("seats")}>
          {t("back")}
        </button>
        <h2 className="cinema-title">{t("checkout.title")}</h2>
        <p className="cinema-subtitle">{t("checkout.subtitle")}</p>

        <div className="cinema-checkout-card cinema-checkout-card--animate">
          <div className="cinema-checkout-row cinema-checkout-row--reveal">
            <span>{t("checkout.movie")}</span>
            <span>{isAr ? movie.titleAr : movie.titleEn}</span>
          </div>
          <div className="cinema-checkout-row cinema-checkout-row--reveal cinema-checkout-row--delay-1">
            <span>{t("checkout.showtime")}</span>
            <span>
              {showtime.time} · {isAr ? showtime.hallLabelAr : showtime.hallLabelEn}
            </span>
          </div>
          <div className="cinema-checkout-row cinema-checkout-row--reveal cinema-checkout-row--delay-2">
            <span>{t("checkout.seats")}</span>
            <span>{seats.join("، ")}</span>
          </div>
          <div className="cinema-checkout-row cinema-checkout-row--reveal cinema-checkout-row--delay-3 cinema-checkout-total">
            <span>{t("checkout.total")}</span>
            <span style={{ color: "var(--cinema-yellow)" }}>
              {total.toLocaleString("ar-SY")} {t("currency")}
            </span>
          </div>
        </div>

        <label className="block mt-4 text-sm text-white/70" htmlFor="cinema-guest-name">
          {t("checkout.nameLabel")}
        </label>
        <input
          id="cinema-guest-name"
          className="cinema-input"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder={t("checkout.namePlaceholder")}
        />

        <button type="button" className="cinema-btn cinema-btn-primary mt-6 w-full" onClick={confirmCheckout}>
          {t("checkout.pay")}
        </button>
        <p className="cinema-demo-note">{t("checkout.mockNote")}</p>
      </div>
    </section>
  );
}
