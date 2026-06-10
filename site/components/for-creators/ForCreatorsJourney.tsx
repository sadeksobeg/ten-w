"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

export function ForCreatorsJourney() {
  const t = useTranslations("Creators.public");

  return (
    <section id="how" className="relative mx-auto max-w-4xl px-4 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl"
      >
        {t("howTitle")}
      </motion.h2>

      <ol className="fc-journey-timeline relative mt-14 space-y-0">
        {STEPS.map((key, i) => (
          <motion.li
            key={key}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="fc-journey-step relative flex gap-5 pb-12 last:pb-0"
          >
            <div className="relative z-10 flex flex-col items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--creator-secondary)]/50 bg-[#0a0614] font-black text-[var(--creator-secondary)] shadow-[0_0_24px_rgba(201,146,42,0.15)]">
                {i + 1}
              </span>
            </div>
            <div className="fc-journey-card creator-card flex-1 p-5 pt-4">
              <h3 className="font-[family-name:var(--font-cairo)] text-lg font-bold text-white">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t(`${key}.body`)}</p>
              {i === 2 ? (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-rose-300/80">{t("journey.challengeHint")}</p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
