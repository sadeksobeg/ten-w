"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useLocale, useTranslations } from "next-intl";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaConfetti } from "@/components/cinema-demo/CinemaConfetti";
import { FeatureMoment } from "@/components/cinema-demo/features/FeatureMoment";
import { CinemaProgressBar } from "@/components/cinema-demo/CinemaProgressBar";
import { getMovie, getShowtime } from "@/lib/cinema-demo/data";
import { playSuccessChime } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  bookingRef: string;
  onComplete: () => void;
};

export function CinemaTicketCeremony({ bookingRef, onComplete }: Props) {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const movieId = useCinemaDemoStore((s) => s.movieId);
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const selectedSeatIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const pushBookingFeed = useCinemaDemoStore((s) => s.pushBookingFeed);
  const incrementRevenue = useCinemaDemoStore((s) => s.incrementRevenue);
  const addTicketsBooked = useCinemaDemoStore((s) => s.addTicketsBooked);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [qrProgress, setQrProgress] = useState(0);
  const synced = useRef(false);

  const movie = movieId ? getMovie(movieId) : null;
  const showtime = showtimeId ? getShowtime(showtimeId) : null;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const steps = reduced ? [0, 200, 400, 600, 800, 1000, 1200] : [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000];
    const timers = steps.map((ms, i) => window.setTimeout(() => setStage(i), ms));
    const finish = window.setTimeout(onComplete, reduced ? 1500 : 13000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onComplete]);

  useEffect(() => {
    if (stage < 8 || !canvasRef.current) return;
    let row = 0;
    const id = window.setInterval(() => {
      row += 1;
      setQrProgress(row);
      if (row >= 150) {
        clearInterval(id);
        playSuccessChime(soundEnabled);
      }
    }, 20);
    return () => clearInterval(id);
  }, [stage, soundEnabled]);

  useEffect(() => {
    if (stage < 8 || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, `SLAMiya-DEMO:${bookingRef}`, {
      width: 150,
      margin: 1,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    });
  }, [stage, bookingRef]);

  useEffect(() => {
    if (stage >= 10 && !synced.current && showtime) {
      synced.current = true;
      const seats = seatLabelsForSelection(showtimeId ?? "", selectedSeatIds);
      pushBookingFeed({
        id: `ticket-${Date.now()}`,
        name: "حجز جديد",
        tickets: selectedSeatIds.length,
        movieAr: movie?.titleAr ?? "",
        movieEn: movie?.titleEn ?? "",
        hallAr: showtime.hallLabelAr,
        hallEn: showtime.hallLabelEn,
        time: showtime.time,
        amount: selectedSeatIds.length * 20000,
      });
      incrementRevenue(selectedSeatIds.length * 20000);
      addTicketsBooked(selectedSeatIds.length);
    }
  }, [stage, showtime, showtimeId, selectedSeatIds, movie, pushBookingFeed, incrementRevenue, addTicketsBooked]);

  if (!movie || !showtime || !showtimeId) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const seats = seatLabelsForSelection(showtimeId, selectedSeatIds);

  return (
    <div className={`cinema-ceremony-v3 cinema-ceremony-v3--stage-${stage}`}>
      {stage >= 10 ? <CinemaConfetti /> : null}
      {stage >= 1 ? <div className="cinema-ticket-v3-line" /> : null}
      <div className="cinema-ticket-v3">
        {stage >= 3 ? (
          <header className="cinema-ticket-v3-head">
            <span>SALAMIYA CINEMA</span>
            <span>TENEGTA SYSTEMS</span>
          </header>
        ) : null}
        {stage >= 4 ? (
          <div className="cinema-ticket-v3-body">
            <h3>{isAr ? movie.titleAr : movie.titleEn}</h3>
            <p>{movie.titleEn}</p>
            <p>{showtime.time} · {isAr ? showtime.hallLabelAr : showtime.hallLabelEn}</p>
            <p>{seats.join(" · ")}</p>
            <p>{total.toLocaleString("ar-SY")} {t("currency")}</p>
            <p>{bookingRef}</p>
          </div>
        ) : null}
        {stage >= 6 ? <div className="cinema-ticket-v3-perforation" /> : null}
        {stage >= 7 ? <div className="cinema-ticket-v3-stub" /> : null}
        {stage >= 8 ? (
          <div className="cinema-ticket-v3-qr" style={{ opacity: qrProgress / 150 }}>
            <canvas ref={canvasRef} aria-label={t("ticket.qrLabel")} />
          </div>
        ) : null}
        {stage >= 9 ? <div className="cinema-ticket-v3-seal">VALID</div> : null}
      </div>
      {stage >= 11 ? <p className="cinema-ticket-v3-ready">{t("ticket.ready")}</p> : null}
      {stage >= 12 ? (
        <div className="cinema-ticket-v3-actions">
          <button type="button" className="cinema-btn cinema-btn-primary">{t("ticket.share")}</button>
          <button type="button" className="cinema-btn cinema-btn-ghost">{t("ticket.download")}</button>
        </div>
      ) : null}
      <FeatureMoment featureId={3} durationMs={5000} className="cinema-feature--whatsapp">
        <p>{t("features.f3Detail")}</p>
      </FeatureMoment>
      <FeatureMoment featureId={11} durationMs={5000} className="cinema-feature--marketing">
        <p>{t("features.f11Detail")}</p>
      </FeatureMoment>
    </div>
  );
}
