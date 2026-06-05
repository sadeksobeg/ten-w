"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getBadgeDef, type BadgeRarity } from "@/lib/growth/badge-visual";
import { getShapePath, type BadgeShape } from "@/lib/growth/badge-shapes";

export type BadgeIconSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "hero"
  | "showcase";

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
  xs: 40,
  sm: 52,
  md: 72,
  lg: 96,
  xl: 128,
  xxl: 152,
  hero: 200,
  showcase: 176,
};

function getRarityDots(rarity: BadgeRarity, color: string): ReactNode {
  const counts: Record<BadgeRarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
  };
  const n = counts[rarity] ?? 1;
  const spacing = 7;
  const startX = 60 - ((n - 1) * spacing) / 2;

  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={startX + i * spacing}
          cy={108}
          r={i === Math.floor(n / 2) ? 3.5 : 2.5}
          fill={color}
          fillOpacity={0.85}
        />
      ))}
    </g>
  );
}

function LockedBadge({
  badgeKey,
  px,
  shapePath,
  def,
  className,
  onClick,
  lockText,
}: {
  badgeKey: string;
  px: number;
  shapePath: string;
  def: ReturnType<typeof getBadgeDef>;
  className: string;
  onClick?: () => void;
  lockText: string;
}) {
  const clipId = `clip-lock-${badgeKey}-${px}`;
  const innerPath = getShapePath(def.shape as BadgeShape, 0.84);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      className={`${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      style={{ flexShrink: 0 }}
      role="img"
      aria-label={lockText}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shapePath} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="120" fill="#111118" />
        <rect width="120" height="120" fill={def.borderColor ?? def.primaryColor} fillOpacity="0.04" />
      </g>
      <path d={shapePath} fill="none" stroke={def.borderColor ?? def.primaryColor} strokeWidth="1.5" strokeOpacity="0.35" />
      <path d={innerPath} fill="none" stroke={def.borderColor ?? def.primaryColor} strokeWidth="0.75" strokeOpacity="0.15" />
      <g transform="translate(60,60)">
        <rect x="-9" y="-1" width="18" height="14" rx="2.5" fill="none" stroke="#4A4A5A" strokeWidth="1.75" />
        <path
          d="M-5,-1 C-5,-7.627 5,-7.627 5,-1"
          fill="none"
          stroke="#4A4A5A"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="0" cy="6" r="2.5" fill="#4A4A5A" />
        <rect x="-1" y="6.5" width="2" height="3" rx="1" fill="#4A4A5A" />
      </g>
    </svg>
  );
}

function EarnedBadge({
  badgeKey,
  px,
  shapePath,
  def,
  className,
  onClick,
  showGlow,
  animate,
}: {
  badgeKey: string;
  px: number;
  shapePath: string;
  def: ReturnType<typeof getBadgeDef>;
  className: string;
  onClick?: () => void;
  showGlow: boolean;
  animate: boolean;
}) {
  const gradId = `grad-${badgeKey}-${px}`;
  const clipId = `clip-${badgeKey}-${px}`;
  const dotId = `dots-${badgeKey}-${px}`;
  const innerPath = getShapePath(def.shape as BadgeShape, 0.85);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      className={[
        className,
        onClick ? "cursor-pointer" : "",
        animate ? "growth-badge-earn" : "",
        def.rarity === "mythic" ? "growth-mythic" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      style={{ flexShrink: 0, overflow: "visible" }}
      role="img"
      aria-hidden
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={def.borderColor ?? def.primaryColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={def.bgColor ?? def.gradientTo} stopOpacity="1" />
        </radialGradient>
        <pattern id={dotId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.75" fill={def.borderColor ?? def.primaryColor} fillOpacity="0.08" />
        </pattern>
        <clipPath id={clipId}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      {showGlow ? (
        <path
          d={getShapePath(def.shape as BadgeShape, 1.08)}
          fill={def.glowColor}
          fillOpacity="0.12"
          className={animate ? "growth-badge-pulse" : ""}
        />
      ) : null}

      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="120" fill={def.bgColor ?? def.gradientTo} />
        <rect width="120" height="120" fill={`url(#${gradId})`} />
        <rect width="120" height="120" fill={`url(#${dotId})`} />
        <ellipse cx="38" cy="28" rx="28" ry="16" fill="white" fillOpacity="0.05" transform="rotate(-20 38 28)" />
      </g>

      <path d={shapePath} fill="none" stroke={def.borderColor ?? def.primaryColor} strokeWidth="2" strokeOpacity="0.85" />
      <path d={innerPath} fill="none" stroke={def.borderColor ?? def.primaryColor} strokeWidth="0.75" strokeOpacity="0.25" />

      <svg x="46" y="46" width="28" height="28" viewBox="0 0 24 24" overflow="visible">
        <path
          d={def.iconPath ?? def.innerPath}
          fill="none"
          stroke={def.iconColor ?? def.innerStroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {getRarityDots(def.rarity, def.borderColor ?? def.primaryColor)}
    </svg>
  );
}

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
  const def = getBadgeDef(badgeKey);
  const px = chip ? 20 : SIZE_PX[size];
  const shapePath = useMemo(() => getShapePath(def.shape as BadgeShape), [def.shape]);

  const svg = earned ? (
    <EarnedBadge
      badgeKey={badgeKey}
      px={px}
      shapePath={shapePath}
      def={def}
      className={chip ? "" : className}
      onClick={chip ? undefined : onClick}
      showGlow={showGlow && !chip}
      animate={animate && !chip}
    />
  ) : (
    <LockedBadge
      badgeKey={badgeKey}
      px={px}
      shapePath={shapePath}
      def={def}
      className={chip ? "" : className}
      onClick={chip ? undefined : onClick}
      lockText={lockText}
    />
  );

  if (chip) {
    return (
      <span
        className={`growth-badge-chat-chip inline-flex shrink-0 ${earned ? "" : "opacity-70"} ${className}`}
        title={name ?? badgeKey}
      >
        {svg}
      </span>
    );
  }

  const wrapClass = `group relative inline-flex flex-col items-center gap-1 ${className}`;
  const innerWrap = (
    <>
      <div className="relative motion-safe:transition-transform motion-safe:group-hover:scale-[1.04] motion-safe:group-hover:-translate-y-0.5">
        {svg}
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
