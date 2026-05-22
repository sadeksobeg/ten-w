"use client";

import { useTranslations } from "next-intl";
import { getLevelVisual } from "@/lib/growth/level-visual";
import { getLevelI18nKey, resolveLevelName } from "@/lib/growth/level-i18n";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  levelName: string;
  levelCode?: string;
  locale?: string;
  size?: Size;
  className?: string;
};

const sizeClass: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
  xl: "px-5 py-2 text-base font-extrabold",
};

export function LevelBadge({
  levelName,
  levelCode,
  locale = "en",
  size = "md",
  className = "",
}: Props) {
  const t = useTranslations("Growth.levels");
  const key = getLevelI18nKey(levelCode, levelName);
  const v = getLevelVisual(levelName, levelCode);
  const i18nKey = `${key}.name` as const;
  let label = resolveLevelName(levelName, locale);
  try {
    const translated = t(i18nKey);
    if (translated && translated !== i18nKey) label = translated;
  } catch {
    /* use resolveLevelName fallback */
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${v.pillClass} ${sizeClass[size]} ${v.isLegend ? "growth-shimmer" : ""} ${className}`}
    >
      {label}
    </span>
  );
}
