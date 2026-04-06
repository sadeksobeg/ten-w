"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

const STEP_KEYS = [
  "sensors",
  "ingest",
  "models",
  "dashboard",
  "operator",
] as const;

export function SystemFlow() {
  const t = useTranslations("SystemFlow");
  const reduce = useReducedMotion();

  return (
    <div
      className="relative w-full py-4"
      role="img"
      aria-label={t("ariaLabel")}
    >
      <ol className="sr-only">
        {STEP_KEYS.map((key, i) => (
          <li key={key}>
            {i + 1}. {t(`steps.${key}`)}
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-3">
        {STEP_KEYS.map((key, index) => (
          <Fragment key={key}>
            <motion.div
              className="flex min-h-[4.5rem] flex-1 items-center justify-center rounded-xl border border-gold/50 bg-surface-elevated px-3 py-3 text-center text-xs font-semibold leading-snug text-gold shadow-[0_0_20px_-8px_rgba(201,160,97,0.45)] sm:text-sm md:min-w-[6.5rem] md:max-w-[7.5rem] md:flex-none"
              animate={
                reduce
                  ? undefined
                  : { scale: [1, 1.03, 1], opacity: [0.88, 1, 0.88] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 2.2, repeat: Infinity, delay: index * 0.2 }
              }
            >
              {t(`steps.${key}`)}
            </motion.div>
            {index < STEP_KEYS.length - 1 ? (
              <span
                className="hidden text-gold/80 md:inline md:px-1"
                aria-hidden
              >
                →
              </span>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
