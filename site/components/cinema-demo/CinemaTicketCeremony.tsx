"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useLocale, useTranslations } from "next-intl";
import {
  computeSeatTotal,
  seatLabelsForSelection,
} from "@/components/cinema-demo/CinemaSeatMap";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
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
  const guestName = useCinemaDemoStore((s) => s.guestName);
  const upsellAdded = useCinemaDemoStore((s) => s.upsellAdded);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [stars, setStars] = useState(0);

  const movie = movieId ? getMovie(movieId) : null;
  const showtime = showtimeId ? getShowtime(showtimeId) : null;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delays = reduced ? [0, 300, 600, 900, 1200] : [0, 800, 1600, 2800, 4200];
    const timers = delays.map((ms, i) => window.setTimeout(() => setStage(i + 1), ms));
    const finish = window.setTimeout(onComplete, reduced ? 2000 : 7000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onComplete]);

  useEffect(() => {
    if (stage >= 4 && canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, `SLAMiya-DEMO:${bookingRef}`, {
        width: 140,
        margin: 1,
        color: { dark: "#0a0a0a", light: "#ffffff" },
      });
      playSuccessChime(soundEnabled);
      window.setTimeout(() => setScanDone(true), 1200);
    }
  }, [stage, bookingRef, soundEnabled]);

  useEffect(() => {
    if (stage < 5) return;
    let s = 0;
    const id = window.setInterval(() => {
      s += 1;
      setStars(s);
      if (s >= 5) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [stage]);

  if (!movie || !showtime || !showtimeId) return null;

  const total = computeSeatTotal(showtimeId, selectedSeatIds);
  const seats = seatLabelsForSelection(showtimeId, selectedSeatIds);

  return (
    <div className={`cinema-ceremony cinema-ceremony--stage-${stage}`}>
      <div className="cinema-ceremony-spotlight" aria-hidden />
      <div className="cinema-ticket-shape">
        <div className="cinema-ticket-main">
          <div className="cinema-ticket-head">
            <CinemaBrandLogo variant="light" className="mx-auto" />
            <p className="cinema-ticket-ref">{bookingRef}</p>
          </div>
          <div className="cinema-ticket-body">
            <p className="cinema-movie-title">{isAr ? movie.titleAr : movie.titleEn}</p>
            <p className="cinema-movie-meta">
              <CinemaIcon name="clock" size={14} className="inline-icon" />
              {showtime.time} · {isAr ? showtime.hallLabelAr : showtime.hallLabelEn}
            </p>
            <p className="cinema-movie-meta">
              <CinemaIcon name="seat" size={14} className="inline-icon" />
              {seats.join("، ")}
              {upsellAdded ? ` · ${t("upsell.added")}` : ""}
            </p>
            {guestName ? <p className="cinema-movie-meta">{guestName}</p> : null}
            <p className="cinema-sticky-price">
              {total.toLocaleString("ar-SY")} {t("currency")}
            </p>
            {stage >= 4 ? (
              <div className={`cinema-ticket-qr ${scanDone ? "is-scanned" : ""}`}>
                <canvas ref={canvasRef} aria-label={t("ticket.qrLabel")} />
                {scanDone ? (
                  <span className="cinema-scan-ok">
                    <CinemaIcon name="check" size={40} />
                  </span>
                ) : null}
              </div>
            ) : null}
            {stage >= 5 ? (
              <div className="cinema-ticket-stars" aria-label={t("ticket.rate")}>
                {Array.from({ length: 5 }, (_, i) => (
                  <CinemaIcon
                    key={i}
                    name="star-filled"
                    size={20}
                    className={i < stars ? "is-filled" : ""}
                    filled={i < stars}
                  />
                ))}
              </div>
            ) : null}
            <div className="cinema-wallet-btns">
              <span className="cinema-wallet-btn">
                <CinemaIcon name="wallet" size={14} /> Apple Wallet
              </span>
              <span className="cinema-wallet-btn">
                <CinemaIcon name="wallet" size={14} /> Google Wallet
              </span>
            </div>
          </div>
        </div>
        <div className="cinema-ticket-stub">
          <CinemaIcon name="ticket" size={18} />
          <p>{bookingRef}</p>
          <p>{showtime.time}</p>
        </div>
      </div>
    </div>
  );
}
