"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { MotivationLine } from "@/lib/growth/get-dashboard";

type Props = {
  primary: MotivationLine;
  secondary: MotivationLine | null;
};

export function GrowthMotivationBar({ primary, secondary }: Props) {
  const t = useTranslations("Growth.motivation");
  const reduce = useReducedMotion();

  function line(m: MotivationLine): string {
    const p = m.params ?? {};
    switch (m.key) {
      case "dealsToNextLevel":
        return t("dealsToNextLevel", { n: Number(p.n) });
      case "topWeekly":
        return t("topWeekly", { rank: Number(p.rank) });
      case "streakHot":
        return t("streakHot", { n: Number(p.n) });
      case "percentileStrong":
        return t("percentileStrong", { p: Number(p.p) });
      case "percentileLine":
        return t("percentileLine", { p: Number(p.p) });
      case "weeklyRankLine":
        return t("weeklyRankLine", {
          rank: Number(p.rank),
          total: Number(p.total),
          closed: Number(p.closed),
        });
      default:
        return t("defaultPrimary");
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/[0.08] via-purple-500/[0.06] to-gold/[0.06] px-5 py-4 shadow-[0_0_40px_-20px_rgba(201,160,97,0.35)]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-gold via-gold-bright to-purple-400"
        aria-hidden
      />
      <div className="ps-3 text-sm leading-relaxed text-white/90">
        <div className="font-semibold text-gold/95">{line(primary)}</div>
        {secondary ? (
          <div className="mt-1 text-xs text-white/65">{line(secondary)}</div>
        ) : null}
      </div>
    </motion.div>
  );
}
