"use client";

import { useLocale, useTranslations } from "next-intl";
import { CINEMA_MOVIES } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";

export function CinemaMoviesPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const selectMovie = useCinemaDemoStore((s) => s.selectMovie);
  const isAr = locale === "ar";

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={0} />
        <h2 className="cinema-title">{t("movies.title")}</h2>
        <p className="cinema-subtitle">{t("movies.subtitle")}</p>
        <div className="cinema-movie-grid">
          {CINEMA_MOVIES.map((movie) => (
            <button
              key={movie.id}
              type="button"
              className="cinema-movie-card"
              onClick={() => selectMovie(movie.id)}
            >
              <div
                className="cinema-movie-poster"
                style={{ background: movie.posterGradient }}
                aria-hidden
              />
              <div className="cinema-movie-body">
                <h3 className="cinema-movie-title">{isAr ? movie.titleAr : movie.titleEn}</h3>
                <p className="cinema-movie-meta">
                  {isAr ? movie.genreAr : movie.genreEn} · {movie.durationMin} {t("movies.min")} ·{" "}
                  {movie.rating}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
