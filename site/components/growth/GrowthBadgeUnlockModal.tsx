"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

type Props = {
  badgeKey: string;
  badgeName?: string;
  onDismiss: () => void;
};

export function GrowthBadgeUnlockModal({ badgeKey, badgeName, onDismiss }: Props) {
  const t = useTranslations("Growth.badges");
  const reduce = useReducedMotion();
  const fired = useRef(false);

  useEffect(() => {
    if (reduce || fired.current) return;
    fired.current = true;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;
    const end = Date.now() + 700;
    const frame = () => {
      confetti({
        particleCount: 4,
        spread: 70,
        origin: { x: 0.5, y: 0.35 },
        colors: ["#c9a061", "#a855f7", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [reduce]);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-labelledby="badge-unlock-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={reduce ? false : { scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative max-w-md rounded-3xl border border-gold/30 bg-[#0a0f1f] p-8 text-center shadow-[0_0_80px_-20px_rgba(201,160,97,0.45)]"
      >
        <div id="badge-unlock-title" className="text-xs font-semibold tracking-[0.2em] text-gold/90">
          {t("unlockTitle")}
        </div>
        <div className="mt-4 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
          {badgeName ?? badgeKey}
        </div>
        <div className="mt-2 text-sm text-white/60">{t("unlockSubtitle", { key: badgeKey })}</div>
        <button
          type="button"
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg"
          onClick={onDismiss}
        >
          {t("unlockCta")}
        </button>
      </motion.div>
    </motion.div>
  );
}
