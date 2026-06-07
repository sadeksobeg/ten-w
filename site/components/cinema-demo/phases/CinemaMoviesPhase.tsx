"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { CINEMA_MOVIES } from "@/lib/cinema-demo/data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaMoviePoster } from "@/components/cinema-demo/CinemaMoviePoster";
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function CinemaMoviesPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const selectMovie = useCinemaDemoStore((s) => s.selectMovie);
  const isAr = locale === "ar";

  return (
    <section className="cinema-phase cinema-phase--movies">
      <div className="cinema-os-center-panel">
        <p className="cinema-os-greeting">{t("os.greeting")}</p>
        <h2 className="cinema-title cinema-reveal">{t("movies.title")}</h2>
        <p className="cinema-subtitle cinema-reveal cinema-reveal--delay-1">{t("movies.subtitle")}</p>
        <motion.div className="cinema-movie-grid" variants={container} initial="hidden" animate="show">
          {CINEMA_MOVIES.map((movie, i) => {
            const title = isAr ? movie.titleAr : movie.titleEn;
            return (
              <motion.button
                key={movie.id}
                type="button"
                variants={item}
                className="cinema-movie-card cinema-movie-card--motion"
                onClick={() => selectMovie(movie.id)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CinemaMoviePoster movie={movie} title={title} priority={i === 0} />
                <div className="cinema-movie-body">
                  <h3 className="cinema-movie-title">{title}</h3>
                  <p className="cinema-movie-meta">
                    {isAr ? movie.genreAr : movie.genreEn} · {movie.durationMin} {t("movies.min")}
                  </p>
                  <span className="cinema-movie-cta">{t("movies.book")}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
