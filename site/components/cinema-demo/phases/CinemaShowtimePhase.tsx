"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getMovie, showtimesForMovie } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaMoviePoster } from "@/components/cinema-demo/CinemaMoviePoster";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";

export function CinemaShowtimePhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const movieId = useCinemaDemoStore((s) => s.movieId);
  const selectShowtime = useCinemaDemoStore((s) => s.selectShowtime);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  useEffect(() => {
    if (!movieId) setPhase("movies");
  }, [movieId, setPhase]);

  const movie = movieId ? getMovie(movieId) : null;
  const showtimes = movieId ? showtimesForMovie(movieId) : [];

  if (!movie) return null;

  const title = isAr ? movie.titleAr : movie.titleEn;

  return (
    <section className="cinema-phase cinema-phase--showtime">
      <div
        className="cinema-hero-backdrop"
        style={{ backgroundImage: `url(${movie.posterSrc})` }}
        aria-hidden
      />
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={1} />
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("movies")}>
          {t("back")}
        </button>

        <div className="cinema-showtime-hero">
          <CinemaMoviePoster movie={movie} title={title} className="cinema-showtime-poster" />
          <div>
            <h2 className="cinema-title">{title}</h2>
            <p className="cinema-subtitle">{t("showtime.subtitle")}</p>
          </div>
        </div>

        <div className="cinema-showtime-list">
          {showtimes.map((st, i) => {
            const occupancy = 55 + ((st.id.length * 13 + i * 17) % 40);
            return (
              <button
                key={st.id}
                type="button"
                className={`cinema-showtime-btn cinema-reveal cinema-reveal--delay-${i + 1}`}
                onClick={() => selectShowtime(st.id)}
              >
                <div className="cinema-showtime-ring" style={{ "--occ": `${occupancy}%` } as CSSProperties}>
                  <span>{occupancy}%</span>
                </div>
                <div>
                  <p className="cinema-showtime-time">{st.time}</p>
                  <p className="cinema-movie-meta">{isAr ? st.dateLabelAr : st.dateLabelEn}</p>
                </div>
                <p className="cinema-movie-meta">{isAr ? st.hallLabelAr : st.hallLabelEn}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
