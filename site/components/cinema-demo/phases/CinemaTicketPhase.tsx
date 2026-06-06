"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaConfetti } from "@/components/cinema-demo/CinemaConfetti";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";
import { getMovie, getShowtime } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaTicketPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const movieId = useCinemaDemoStore((s) => s.movieId);
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const selectedSeatIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const guestName = useCinemaDemoStore((s) => s.guestName);
  const bookingRef = useCinemaDemoStore((s) => s.bookingRef);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const resetDemo = useCinemaDemoStore((s) => s.resetDemo);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const movie = movieId ? getMovie(movieId) : null;
  const showtime = showtimeId ? getShowtime(showtimeId) : null;

  useEffect(() => {
    if (!bookingRef || !showtimeId) setPhase("movies");
  }, [bookingRef, showtimeId, setPhase]);

  useEffect(() => {
    if (!canvasRef.current || !bookingRef) return;
    void QRCode.toCanvas(canvasRef.current, `SLAMiya-DEMO:${bookingRef}`, {
      width: 160,
      margin: 1,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    });
  }, [bookingRef]);

  if (!movie || !showtime || !showtimeId || !bookingRef) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const seats = seatLabelsForSelection(showtimeId, selectedSeatIds);

  return (
    <section className="cinema-phase cinema-phase--ticket">
      <CinemaConfetti />
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={4} />
        <h2 className="cinema-title text-center cinema-reveal">{t("ticket.title")}</h2>
        <p className="cinema-subtitle text-center cinema-reveal cinema-reveal--delay-1">
          {t("ticket.subtitle")}
        </p>

        <div className="cinema-ticket cinema-ticket--animate">
          <div className="cinema-ticket-head">
            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.85rem" }}>{t("brandName")}</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", opacity: 0.7 }}>{bookingRef}</p>
          </div>
          <div className="cinema-ticket-body">
            <p className="cinema-movie-title">{isAr ? movie.titleAr : movie.titleEn}</p>
            <p className="cinema-movie-meta">
              {showtime.time} · {isAr ? showtime.hallLabelAr : showtime.hallLabelEn}
            </p>
            <p className="cinema-movie-meta">
              {t("checkout.seats")}: {seats.join("، ")}
            </p>
            {guestName ? (
              <p className="cinema-movie-meta">
                {t("checkout.nameLabel")}: {guestName}
              </p>
            ) : null}
            <p className="cinema-sticky-price mt-2">
              {total.toLocaleString("ar-SY")} {t("currency")}
            </p>
            <div className="cinema-ticket-qr">
              <canvas ref={canvasRef} aria-label={t("ticket.qrLabel")} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="cinema-btn cinema-btn-primary"
            onClick={() => setShowDashboard(true)}
          >
            {t("ticket.dashboardCta")}
          </button>
          <button type="button" className="cinema-btn cinema-btn-ghost" onClick={resetDemo}>
            {t("ticket.restart")}
          </button>
        </div>

        {showDashboard ? (
          <div className="cinema-dashboard cinema-dashboard--animate">
            <div className="cinema-stat">
              <p className="cinema-stat-value">87%</p>
              <p className="cinema-stat-label">{t("dashboard.occupancy")}</p>
            </div>
            <div className="cinema-stat">
              <p className="cinema-stat-value">1.2M</p>
              <p className="cinema-stat-label">{t("dashboard.revenue")}</p>
            </div>
            <div className="cinema-stat">
              <p className="cinema-stat-value">342</p>
              <p className="cinema-stat-label">{t("dashboard.tickets")}</p>
            </div>
          </div>
        ) : null}

        <div className="cinema-powered">
          <p className="cinema-powered-title">T.E.N.E.G.T.A</p>
          <p className="mt-2 text-sm text-white/80">{t("powered.body")}</p>
          <Link
            href="/contact?intent=demo&topic=cinema"
            className="cinema-btn cinema-btn-primary mt-4 inline-block"
          >
            {t("powered.cta")}
          </Link>
        </div>

        <p className="cinema-demo-note">{t("demoNote")}</p>
      </div>
    </section>
  );
}
