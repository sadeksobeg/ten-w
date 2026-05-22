"use client";

import { useTranslations } from "next-intl";
import { GameIcon } from "@/components/growth/icons/GameIcon";
import { getLevelI18nKey, LEVEL_COLORS } from "@/lib/growth/level-i18n";
import { getLevelVisual } from "@/lib/growth/level-visual";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; text: string; icon: number }> = {
  sm: { box: "size-10", text: "text-[8px]", icon: 22 },
  md: { box: "size-14", text: "text-[9px]", icon: 28 },
  lg: { box: "size-20", text: "text-[10px]", icon: 36 },
  xl: { box: "size-28", text: "text-xs", icon: 48 },
};

type Props = {
  levelCode?: string | null;
  levelName?: string | null;
  locale?: string;
  size?: Size;
  className?: string;
};

export function RankEmblem({
  levelCode,
  levelName,
  size = "md",
  className = "",
}: Props) {
  const t = useTranslations("Growth.levels");
  const key = getLevelI18nKey(levelCode, levelName);
  const color = LEVEL_COLORS[key] ?? LEVEL_COLORS.starter;
  const visual = getLevelVisual(levelName ?? "", levelCode);
  const label = t(`${key}.name`);
  const s = sizeMap[size];

  return (
    <span
      className={`relative inline-flex flex-col items-center gap-1 ${className}`}
      title={label}
    >
      <span
        className={`${s.box} relative flex items-center justify-center ${visual.isLegend ? "growth-rank-legend" : ""}`}
        style={{
          clipPath:
            "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
          background: `linear-gradient(145deg, ${color}55, ${visual.gradientFrom} 40%, ${visual.gradientTo})`,
          boxShadow: `0 0 20px ${color}44, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        <span
          className="absolute inset-[3px] flex items-center justify-center"
          style={{
            clipPath:
              "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <GameIcon
            slug={visual.iconSlug}
            size={s.icon}
            color={color}
            glow={visual.isLegend}
          />
        </span>
      </span>
      <span
        className={`max-w-[5.5rem] truncate text-center font-extrabold uppercase tracking-wide text-[var(--growth-gold-bright)] ${s.text} ${visual.isLegend ? "growth-shimmer" : ""}`}
      >
        {label}
      </span>
    </span>
  );
}
