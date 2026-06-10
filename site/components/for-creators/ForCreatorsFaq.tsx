"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

export function ForCreatorsFaq() {
  const t = useTranslations("Creators.public");
  const [open, setOpen] = useState<string>("q3");

  return (
    <section className="mx-auto max-w-2xl px-4 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl"
      >
        {t("faqTitle")}
      </motion.h2>

      <ul className="mt-10 space-y-2">
        {FAQ_KEYS.map((key, i) => {
          const isOpen = open === key;
          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`fc-faq-item creator-card overflow-hidden transition ${isOpen ? "fc-faq-item--open" : ""}`}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start font-semibold text-white"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? "" : key)}
              >
                <span>{t(`faq.${key}`)}</span>
                <span className="fc-faq-icon flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-sm text-[var(--creator-secondary)]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/60">
                      {t(`faq.a${key.slice(1)}`)}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
