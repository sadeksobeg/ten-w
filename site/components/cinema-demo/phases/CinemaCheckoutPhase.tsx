"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { FeatureMoment } from "@/components/cinema-demo/features/FeatureMoment";
import { getMovie, getShowtime } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const PAYMENT_KEYS = ["paymentSyriatel", "paymentMtn", "paymentCard", "paymentCash"] as const;

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
    <section className="cinema-phase cinema-phase--checkout">
      <div className="cinema-os-center-panel">
        <FeatureMoment featureId={4} className="cinema-feature--inline">
          <p>{t("features.f4Detail")}</p>
        </FeatureMoment>
        <FeatureMoment featureId={7} durationMs={6000} className="cinema-feature--inline cinema-feature--delay">
          <p>{t("features.f7Detail")}</p>
        </FeatureMoment>
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("seats")}>
          {t("back")}
        </button>
        <h2 className="cinema-title">{t("checkout.title")}</h2>
        <p className="cinema-subtitle">{t("checkout.subtitle")}</p>

        <div className="cinema-checkout-card cinema-checkout-card--animate">
          <div className="cinema-checkout-row">
            <span>{t("checkout.movie")}</span>
            <span>{isAr ? movie.titleAr : movie.titleEn}</span>
          </div>
          <div className="cinema-checkout-row">
            <span>{t("checkout.showtime")}</span>
            <span>
              {showtime.time} · {isAr ? showtime.hallLabelAr : showtime.hallLabelEn}
            </span>
          </div>
          <div className="cinema-checkout-row">
            <span>{t("checkout.seats")}</span>
            <span>{seats.join("، ")}</span>
          </div>
          <div className="cinema-checkout-row cinema-checkout-total">
            <span>{t("checkout.total")}</span>
            <span style={{ color: "var(--cinema-yellow)" }}>
              {total.toLocaleString("ar-SY")} {t("currency")}
            </span>
          </div>
        </div>

        <div className="cinema-payment-grid">
          {PAYMENT_KEYS.map((key) => (
            <span key={key} className="cinema-payment-chip">{t(`checkout.${key}`)}</span>
          ))}
        </div>
        <FeatureMoment featureId={15} durationMs={4000} className="cinema-feature--inline">
          <p>{t("features.f15Detail")}</p>
        </FeatureMoment>

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
      </div>
    </section>
  );
}
