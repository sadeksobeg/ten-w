"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorBrowserChrome } from "./CreatorBrowserChrome";
import { CinematicVideoLayer } from "./CinematicVideoLayer";
import { CinemaSceneFilm } from "./cinema-scenes/CinemaSceneFilm";
import { CinemaSceneSolutions } from "./cinema-scenes/CinemaSceneSolutions";
import { CinemaSceneHub } from "./cinema-scenes/CinemaSceneHub";
import { CinemaSceneChallenge } from "./cinema-scenes/CinemaSceneChallenge";
import { CinemaSceneEarn } from "./cinema-scenes/CinemaSceneEarn";

const SCENES = ["film", "solutions", "hub", "challenge", "earn"] as const;
type Scene = (typeof SCENES)[number];

const SCENE_DURATION_MS = 5200;

const GRADIENT: Record<Scene, string> = {
  film: "fc-cinema-gradient--film",
  solutions: "fc-cinema-gradient--solutions",
  hub: "fc-cinema-gradient--hub",
  challenge: "fc-cinema-gradient--challenge",
  earn: "fc-cinema-gradient--earn",
};

type Props = { locale: string };

export function CreatorCinemaStage({ locale }: Props) {
  const t = useTranslations("Creators.public.cinema");
  const [scene, setScene] = useState<Scene>("film");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStart = useRef<number | null>(null);
  const progressRef = useRef(0);

  const goNext = useCallback(() => {
    setScene((s) => SCENES[(SCENES.indexOf(s) + 1) % SCENES.length]!);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const goPrev = useCallback(() => {
    setScene((s) => SCENES[(SCENES.indexOf(s) - 1 + SCENES.length) % SCENES.length]!);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  useEffect(() => {
    if (paused) return;
    const tick = 50;
    const id = window.setInterval(() => {
      progressRef.current += (tick / SCENE_DURATION_MS) * 100;
      if (progressRef.current >= 100) {
        goNext();
        return;
      }
      setProgress(progressRef.current);
    }, tick);
    return () => window.clearInterval(id);
  }, [paused, scene, goNext]);

  function pickScene(next: Scene) {
    setScene(next);
    setProgress(0);
    progressRef.current = 0;
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  const url = t(`scenes.${scene}.url`);

  function SceneUi({ id }: { id: Scene }) {
    switch (id) {
      case "film":
        return <CinemaSceneFilm />;
      case "solutions":
        return <CinemaSceneSolutions locale={locale} />;
      case "hub":
        return <CinemaSceneHub />;
      case "challenge":
        return <CinemaSceneChallenge />;
      case "earn":
        return <CinemaSceneEarn />;
    }
  }

  return (
    <section id="cinema" className="relative mx-auto max-w-5xl overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.14),transparent_70%)]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative text-center"
      >
        <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--creator-secondary)]/70">{t("eyebrow")}</p>
        <h2 className="mt-4 font-[family-name:var(--font-cairo)] text-[clamp(1.75rem,5vw,2.75rem)] font-black leading-tight text-white">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="fc-demo-stage relative mx-auto mt-12 max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <CreatorBrowserChrome
          url={url}
          progress={progress}
          footerLabel={t(`scenes.${scene}.label`)}
        >
          <CinematicVideoLayer
            key={scene}
            reloadKey={scene}
            srcBase={`/videos/for-creators/cinema-${scene}`}
            gradientClass={GRADIENT[scene]}
            lazy
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-10"
            >
              <SceneUi id={scene} />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 bg-gradient-to-t from-black/70 to-transparent" />
        </CreatorBrowserChrome>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label={t("sceneNav")}>
          {SCENES.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scene === s}
              onClick={() => pickScene(s)}
              className={`fc-demo-pill rounded-full px-3 py-1.5 text-[10px] font-bold transition ${scene === s ? "fc-demo-pill--active" : "text-white/45 hover:text-white/70"}`}
            >
              {t(`scenes.${s}.pill`)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-white/35">{t("swipeHint")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 text-center"
      >
        <p className="text-sm text-white/55">{t("below")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/growth/creators">
            <GoldButton type="button" className="fc-cta-glow !px-8 !py-3">
              {t("ctaHub")}
            </GoldButton>
          </Link>
          <Link href={`/${locale}/solutions/intelligent-systems`}>
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white/75 transition hover:border-[var(--creator-secondary)]/40 hover:text-white"
            >
              {t("ctaSolutions")}
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
