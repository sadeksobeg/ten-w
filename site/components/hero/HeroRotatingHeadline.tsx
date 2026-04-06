"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const INTERVAL_MS = 5200;

export function HeroRotatingHeadline() {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("HomePage.hero");

  const lines = useMemo(
    () => [t("rotate1"), t("rotate2"), t("rotate3"), t("rotate4")],
    [t],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || lines.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % lines.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced, lines.length]);

  if (lines.length === 0) return null;

  const active = lines[reduced ? 0 : index] ?? lines[0];

  if (reduced) {
    return (
      <p
        className="mt-4 min-h-[1.6em] max-w-xl text-base font-medium leading-snug text-gold md:text-lg"
        aria-hidden
      >
        {active}
      </p>
    );
  }

  const enterX = isRtl ? -18 : 18;

  return (
    <div
      className="relative mt-4 min-h-[3.25rem] max-w-xl md:min-h-[3.5rem]"
      aria-hidden
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={active}
          initial={{ opacity: 0.96, y: 6, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, x: enterX * 0.35, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-0 text-base font-medium leading-snug text-gold md:text-lg"
        >
          {active}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
