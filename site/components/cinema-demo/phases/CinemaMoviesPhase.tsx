"use client";

import { useLocale, useTranslations } from "next-intl";
import { CINEMA_MOVIES } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaMoviePoster } from "@/components/cinema-demo/CinemaMoviePoster";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";

export function CinemaMoviesPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const selectMovie = useCinemaDemoStore((s) => s.selectMovie);
  const isAr = locale === "ar";

  return (
    <section className="cinema-phase cinema-phase--movies">
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={0} />
        <h2 className="cinema-title cinema-reveal">{t("movies.title")}</h2>
        <p className="cinema-subtitle cinema-reveal cinema-reveal--delay-1">{t("movies.subtitle")}</p>
        <div className="cinema-movie-grid">
          {CINEMA_MOVIES.map((movie, i) => {
            const title = isAr ? movie.titleAr : movie.titleEn;
            return (
              <button
                key={movie.id}
                type="button"
                className={`cinema-movie-card cinema-reveal cinema-reveal--delay-${Math.min(i + 2, 4)}`}
                onClick={() => selectMovie(movie.id)}
              >
                <CinemaMoviePoster movie={movie} title={title} priority={i === 0} />
                <div className="cinema-movie-body">
                  <h3 className="cinema-movie-title">{title}</h3>
                  <p className="cinema-movie-meta">
                    {isAr ? movie.genreAr : movie.genreEn} · {movie.durationMin} {t("movies.min")} ·{" "}
                    {movie.rating}
                  </p>
                  <span className="cinema-movie-cta">{t("movies.book")}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
