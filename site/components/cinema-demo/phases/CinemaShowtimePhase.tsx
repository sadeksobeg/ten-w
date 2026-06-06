"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeatureMoment } from "@/components/cinema-demo/features/FeatureMoment";
import { CinemaProgressBar } from "@/components/cinema-demo/CinemaProgressBar";
import { CinemaMoviePoster } from "@/components/cinema-demo/CinemaMoviePoster";
import { getMovie, showtimesForMovie } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

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
      <CinemaProgressBar />
      <div className="cinema-os-center-panel">
        <FeatureMoment featureId={1} className="cinema-feature--inline">
          <p>{t("features.f1Detail")}</p>
        </FeatureMoment>
        <FeatureMoment featureId={2} durationMs={6000} className="cinema-feature--inline cinema-feature--delay">
          <p>{t("features.f2Detail")}</p>
        </FeatureMoment>
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
            const full = occupancy >= 95;
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
                {full ? <span className="cinema-badge cinema-badge--waitlist">{t("features.f14Detail")}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
