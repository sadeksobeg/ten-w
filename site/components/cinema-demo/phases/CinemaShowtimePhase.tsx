"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getMovie, showtimesForMovie } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
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

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={1} />
        <button type="button" className="cinema-btn cinema-btn-ghost mb-4" onClick={() => setPhase("movies")}>
          {t("back")}
        </button>
        <h2 className="cinema-title">{isAr ? movie.titleAr : movie.titleEn}</h2>
        <p className="cinema-subtitle">{t("showtime.subtitle")}</p>
        <div className="cinema-showtime-list">
          {showtimes.map((st) => (
            <button
              key={st.id}
              type="button"
              className="cinema-showtime-btn"
              onClick={() => selectShowtime(st.id)}
            >
              <div>
                <p className="cinema-showtime-time">{st.time}</p>
                <p className="cinema-movie-meta">{isAr ? st.dateLabelAr : st.dateLabelEn}</p>
              </div>
              <p className="cinema-movie-meta">{isAr ? st.hallLabelAr : st.hallLabelEn}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
