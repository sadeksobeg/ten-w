"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { AscendCampaign } from "@/lib/growth/ascend-campaigns";
import {
  AscendRevealBanner,
  dismissCampaignId,
  readDismissedCampaignIds,
} from "@/components/growth/campaign/AscendRevealBanner";

type Props = {
  campaigns: AscendCampaign[];
  locale: string;
};

const AUTO_MS = 6500;

export function AscendCampaignStrip({ campaigns, locale }: Props) {
  const t = useTranslations("Growth.campaigns");
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);

  const [slides, setSlides] = useState<AscendCampaign[]>(campaigns);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const dismissed = new Set(readDismissedCampaignIds());
    const visible = campaigns.filter((c) => !dismissed.has(c.id));
    setSlides(visible);
    setIndex(0);
    setReady(true);
  }, [campaigns]);

  const count = slides.length;
  const active = slides[index];
  const useTrack = isMobile || Boolean(reduceMotion);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (count <= 1) return;
      const wrapped = (next + count) % count;
      setDirection(dir);
      setIndex(wrapped);
      if (useTrack) scrollToIndex(wrapped);
      pauseUntilRef.current = Date.now() + AUTO_MS;
    },
    [count, useTrack, scrollToIndex],
  );

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (!ready || count <= 1 || useTrack) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [ready, count, useTrack]);

  useEffect(() => {
    if (!ready || count <= 1 || !useTrack) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setDirection(1);
      setIndex((i) => {
        const next = (i + 1) % count;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [ready, count, useTrack, scrollToIndex]);

  const handleDismiss = useCallback(
    (id: string) => {
      dismissCampaignId(id);
      setSlides((prev) => {
        const next = prev.filter((c) => c.id !== id);
        setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
        return next;
      });
      pauseUntilRef.current = Date.now() + AUTO_MS;
    },
    [],
  );

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;
    const w = track.clientWidth;
    if (w <= 0) return;
    const i = Math.round(track.scrollLeft / w);
    if (i !== index && i >= 0 && i < count) {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
      pauseUntilRef.current = Date.now() + AUTO_MS;
    }
  }, [count, index]);

  if (!ready || count === 0 || !active) return null;

  const slideVariants = {
    enter: (d: number) => ({
      x: d >= 0 ? "100%" : "-100%",
      opacity: 0.4,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d >= 0 ? "-100%" : "100%",
      opacity: 0.4,
      scale: 0.96,
    }),
  };

  return (
    <section
      className="ascend-campaign-carousel growth-bleed-x"
      aria-roledescription="carousel"
      aria-label={t("carouselAria")}
    >
      <div className="ascend-campaign-viewport">
        {useTrack ? (
          <div
            ref={trackRef}
            className="ascend-campaign-track"
            onScroll={onScroll}
          >
            {slides.map((c) => (
              <div key={c.id} className="ascend-campaign-slide">
                <AscendRevealBanner
                  campaign={c}
                  locale={locale}
                  variant="carousel"
                  onDismiss={() => handleDismiss(c.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="ascend-campaign-stage">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="ascend-campaign-slide ascend-campaign-slide--motion"
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -48 || info.velocity.x < -400) goNext();
                  else if (info.offset.x > 48 || info.velocity.x > 400) goPrev();
                }}
              >
                <AscendRevealBanner
                  campaign={active}
                  locale={locale}
                  variant="carousel"
                  onDismiss={() => handleDismiss(active.id)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {count > 1 && !useTrack ? (
          <>
            <button
              type="button"
              className="ascend-campaign-nav ascend-campaign-nav--prev"
              onClick={goPrev}
              aria-label={t("prevSlide")}
            >
              ‹
            </button>
            <button
              type="button"
              className="ascend-campaign-nav ascend-campaign-nav--next"
              onClick={goNext}
              aria-label={t("nextSlide")}
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="ascend-campaign-footer">
          <div className="ascend-campaign-dots" role="tablist" aria-label={t("carouselAria")}>
            {slides.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t("slideDot", { n: i + 1 })}
                className={`ascend-campaign-dot ${i === index ? "ascend-campaign-dot--active" : ""}`}
                onClick={() => goTo(i, i > index ? 1 : -1)}
              />
            ))}
          </div>
          <p dir="ltr" className="ascend-campaign-counter text-[10px] font-semibold tabular-nums text-white/40">
            {t("slideCounter", { current: index + 1, total: count })}
          </p>
        </div>
      ) : null}
    </section>
  );
}
