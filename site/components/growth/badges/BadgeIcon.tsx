"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BadgeMedallion3D } from "@/components/growth/badges/BadgeMedallion3D";
import { getBadgeDef } from "@/lib/growth/badge-visual";

export type BadgeIconSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export type BadgeIconProps = {
  badgeKey: string;
  earned: boolean;
  size?: BadgeIconSize;
  showName?: boolean;
  name?: string;
  showGlow?: boolean;
  animate?: boolean;
  className?: string;
  lockedLabel?: string;
  onClick?: () => void;
  chip?: boolean;
};

const SIZE_PX: Record<BadgeIconSize, number> = {
  xs: 36,
  sm: 52,
  md: 72,
  lg: 96,
  xl: 128,
  xxl: 152,
};

export function BadgeIcon({
  badgeKey,
  earned,
  size = "md",
  showName,
  name,
  showGlow = true,
  animate = false,
  className = "",
  lockedLabel,
  onClick,
  chip = false,
}: BadgeIconProps) {
  const t = useTranslations("Growth.badges");
  const lockText = lockedLabel ?? t("lockedLabel");
  const px = chip ? 20 : SIZE_PX[size];

  const glowStyle = useMemo(
    () =>
      earned && showGlow && !chip
        ? {
            filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.45)) drop-shadow(0 0 12px ${getBadgeDef(badgeKey).glowColor}66)`,
          }
        : undefined,
    [badgeKey, earned, showGlow, chip],
  );

  const inner = (
    <BadgeMedallion3D
      badgeKey={badgeKey}
      px={px}
      showGlow={showGlow}
      animate={animate}
      earned={earned}
    />
  );

  if (chip) {
    return (
      <span
        className={`growth-badge-chat-chip inline-flex shrink-0 ${earned ? "" : "opacity-70"} ${className}`}
        title={name ?? badgeKey}
      >
        <span className="growth-badge-3d-wrap" style={{ width: px, height: px, display: "inline-block" }}>
          {inner}
        </span>
      </span>
    );
  }

  const wrapClass = `group relative inline-flex flex-col items-center gap-1 ${className}`;
  const innerWrap = (
    <>
      <div
        className={`growth-badge-3d-wrap relative motion-safe:transition-transform motion-safe:group-hover:scale-[1.04] motion-safe:group-hover:-translate-y-0.5 ${defShowBorder(earned, badgeKey)}`}
        style={{ width: px, height: px, ...glowStyle }}
      >
        {inner}
      </div>
      {showName && name ? (
        <span className="max-w-[120px] truncate text-center text-[10px] font-semibold text-[var(--growth-text-sub)]">
          {name}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${wrapClass} cursor-pointer border-0 bg-transparent p-0`}
        title={!earned ? lockText : name ?? undefined}
      >
        {innerWrap}
      </button>
    );
  }

  return (
    <div className={wrapClass} title={!earned ? lockText : name ?? undefined}>
      {innerWrap}
    </div>
  );
}

function defShowBorder(earned: boolean, badgeKey: string): string {
  if (!earned) return "";
  const def = getBadgeDef(badgeKey);
  if (def.showBorder) return "rounded-full ring-2 ring-gold/50";
  return "";
}
