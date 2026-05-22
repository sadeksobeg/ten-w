"use client";

import { useEffect, useState } from "react";
import { getXpBrandLabel, XP_BRAND } from "@/lib/growth/xp-brand";
import { IconLevel } from "@/components/growth/icons/GrowthIcons";

type LevelInfo = {
  name: string;
  order: number;
  minXp: number;
};

type Props = {
  locale: string;
  currentXp: number;
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  showDetails?: boolean;
};

export function XpProgressBar({
  locale,
  currentXp,
  currentLevel,
  nextLevel,
  showDetails = true,
}: Props) {
  const label = getXpBrandLabel(locale);
  const [width, setWidth] = useState(0);

  const isMax = !nextLevel;
  let pct = 100;
  if (nextLevel) {
    const span = Math.max(1, nextLevel.minXp - currentLevel.minXp);
    const pos = Math.max(0, currentXp - currentLevel.minXp);
    pct = Math.min(100, Math.round((pos / span) * 100));
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-white">
          <span className="text-gold" aria-hidden>
            {XP_BRAND.symbol}{" "}
          </span>
          {label} — {currentLevel.name}
        </div>
        {showDetails ? (
          <div className="text-xs font-semibold text-white/55">
            {currentXp.toLocaleString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US")}
          </div>
        ) : null}
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${XP_BRAND.color}99, ${XP_BRAND.color})`,
            boxShadow: `0 0 12px ${XP_BRAND.color}66`,
          }}
        />
      </div>
      {showDetails ? (
        <div className="mt-2 text-xs text-white/50">
          {isMax ? (
            <span className="inline-flex items-center gap-1">
              <IconLevel size={14} className="text-gold" aria-hidden />
              {locale === "ar" ? "المستوى الأعلى" : locale === "fr" ? "Niveau max" : "Max level"}
            </span>
          ) : (
            <span>
              {locale === "ar" ? "الهدف التالي" : locale === "fr" ? "Prochain" : "Next"}: {nextLevel.minXp.toLocaleString()}{" "}
              ({nextLevel.name}) — {pct}%
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
