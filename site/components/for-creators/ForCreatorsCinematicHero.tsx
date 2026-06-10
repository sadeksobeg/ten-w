"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CinematicVideoLayer } from "./CinematicVideoLayer";
import { CreatorBrowserChrome } from "./CreatorBrowserChrome";
import { CinemaSceneFilm } from "./cinema-scenes/CinemaSceneFilm";

function HeroTitleLine({
  children,
  delay,
  shimmer,
}: {
  children: React.ReactNode;
  delay: number;
  shimmer?: boolean;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 36, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`block fc-hero-title-line ${shimmer ? "fc-shimmer-text" : ""}`}
    >
      {children}
    </motion.span>
  );
}

export function ForCreatorsCinematicHero() {
  const t = useTranslations("Creators.public.hero");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const isAr = locale === "ar";
  const { scrollY } = useScroll();
  const floatY = useTransform(scrollY, [0, 400], [0, -40]);
  const floatRotate = useTransform(scrollY, [0, 400], [0, 4]);

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: (i * 17 + 7) % 100,
        top: (i * 23 + 11) % 100,
        size: 1 + (i % 3),
        delay: (i % 8) * 0.6,
        duration: 2.5 + (i % 5),
      })),
    [],
  );

  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = [t("stat1.sub"), t("stat2.sub"), t("stat3.sub")];

  useEffect(() => {
    const id = window.setInterval(() => setTickerIndex((i) => (i + 1) % tickers.length), 3200);
    return () => window.clearInterval(id);
  }, [tickers.length]);

  const floatingStats = useMemo(
    () => [
      { key: "stat1" as const, rot: "-4deg", className: "top-[12%] start-[2%] hidden lg:block" },
      { key: "stat2" as const, rot: "3deg", className: "top-[26%] end-[1%] hidden lg:block" },
      { key: "stat3" as const, rot: "-2deg", className: "bottom-[18%] start-[4%] hidden lg:block" },
    ],
    [],
  );

  return (
    <section className="relative flex min-h-[96dvh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-20 text-center">
      <CinematicVideoLayer
        srcBase="/videos/for-creators/hero-loop"
        poster="/videos/for-creators/hero-loop-poster.jpg"
        gradientClass="fc-cinema-gradient--hero"
        className="!opacity-100"
        overlayClassName="fc-cinema-hero-vignette"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#03010A]/75" aria-hidden />
      <div className="fc-hero-mesh pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="fc-hero-beam fc-hero-beam--1 pointer-events-none absolute inset-0" aria-hidden />
      <div className="fc-hero-beam fc-hero-beam--2 pointer-events-none absolute inset-0" aria-hidden />

      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animation: `fc-twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
          aria-hidden
        />
      ))}

      {floatingStats.map(({ key, rot, className }) => (
        <div
          key={key}
          className={`fc-float-stat creator-card absolute z-10 px-4 py-3 text-start ${className}`}
          style={{ "--fc-rot": rot } as React.CSSProperties}
        >
          <p className="font-[family-name:var(--font-cairo)] text-xl font-black text-[var(--creator-secondary)]">{t(`${key}.value`)}</p>
          <p className="mt-0.5 text-[10px] text-white/50">{t(`${key}.sub`)}</p>
        </div>
      ))}

      <motion.div
        style={{ y: floatY, rotateX: floatRotate }}
        className="fc-hero-float-browser pointer-events-none absolute end-[4%] top-[18%] z-[5] hidden w-[min(28vw,320px)] lg:block"
      >
        <CreatorBrowserChrome url="tenegta.com/for-creators#cinema" progress={35}>
          <div className="relative h-full min-h-[140px] bg-[#050208]">
            <CinematicVideoLayer srcBase="/videos/for-creators/cinema-film" gradientClass="fc-cinema-gradient--film" />
            <div className="relative z-10 scale-[0.85] origin-top">
              <CinemaSceneFilm />
            </div>
          </div>
        </CreatorBrowserChrome>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`font-mono text-[11px] tracking-[0.35em] text-[var(--creator-secondary)]/80 ${isAr ? "fc-eyebrow-ar" : ""}`}
        >
          {t("eyebrow", { year })}
        </motion.p>

        <h1 className="mt-6 font-[family-name:var(--font-cairo)] text-[clamp(2.25rem,7vw,4rem)] font-black leading-[1.08] text-white">
          <HeroTitleLine delay={0.35}>{t("title1")}</HeroTitleLine>
          <HeroTitleLine delay={0.55} shimmer>
            {t("title2")}
          </HeroTitleLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="fc-hero-ticker mx-auto mt-4 max-w-md rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-[11px] text-white/55"
        >
          {tickers[tickerIndex]}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a href="#apply">
            <GoldButton type="button" className="fc-cta-glow min-w-[200px] !px-8 !py-3.5">
              {t("cta")}
            </GoldButton>
          </a>
          <Link
            href="/growth/creators"
            className="fc-hero-secondary rounded-full border border-[var(--creator-secondary)]/45 bg-[var(--creator-secondary)]/10 px-6 py-3.5 text-sm font-bold text-[var(--creator-secondary)] transition hover:bg-[var(--creator-secondary)]/20 hover:text-white"
          >
            {t("creatorHub")}
          </Link>
          <a
            href="#cinema"
            className="text-sm font-semibold text-white/55 underline-offset-4 transition hover:text-white hover:underline"
          >
            {t("secondary")}
          </a>
        </motion.div>

        <div className="mt-12 grid grid-cols-3 gap-2 lg:hidden">
          {(["stat1", "stat2", "stat3"] as const).map((key) => (
            <div key={key} className="fc-mobile-stat rounded-xl border px-2 py-3">
              <p className="font-[family-name:var(--font-cairo)] text-lg font-black text-[var(--creator-secondary)]">{t(`${key}.value`)}</p>
              <p className="mt-0.5 text-[9px] leading-tight text-white/45">{t(`${key}.sub`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fc-separator relative z-10 mx-auto mt-14 h-px bg-gradient-to-r from-transparent via-[var(--creator-secondary)]/50 to-transparent" aria-hidden />
    </section>
  );
}
