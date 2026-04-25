"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { PartnerInsightSlide } from "@/lib/growth/partner-insights";

type Props = {
  slides: PartnerInsightSlide[];
};

export function PartnerInsightCarousel({ slides }: Props) {
  const t = useTranslations("Growth.insights");
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[i]!;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 via-transparent to-gold/10 p-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-200/80">
        {t("label")}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.key + JSON.stringify(slide.params ?? {})}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="mt-2 min-h-[3.25rem] text-sm font-semibold leading-relaxed text-white/90"
        >
          {t(`slides.${slide.key}`, {
            ...(slide.params as Record<string, string | number>),
          })}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={t("dotAria", { n: idx + 1 })}
            className={`h-1.5 flex-1 rounded-full transition ${
              idx === i ? "bg-gold" : "bg-white/15 hover:bg-white/25"
            }`}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
}
