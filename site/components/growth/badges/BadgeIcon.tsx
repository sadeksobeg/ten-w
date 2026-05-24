"use client";

import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import { IconLock } from "@/components/growth/icons/GrowthIcons";
import {
  getBadgeDef,
  getRarityStarCount,
  getShapePath,
} from "@/lib/growth/badge-visual";

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

function RarityStars({
  rarity,
  color,
  uid,
}: {
  rarity: string;
  color: string;
  uid: string;
}) {
  const count = getRarityStarCount(rarity);
  const offset = ((count - 1) * 8) / 2;
  return (
    <g transform="translate(60, 105)">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={`${uid}-star-${i}`}
          cx={i * 8 - offset}
          cy={0}
          r={rarity === "legendary" || rarity === "mythic" ? 2.8 : 2.5}
          fill={color}
          opacity={0.9}
        />
      ))}
    </g>
  );
}

function EarnedBadgeSvg({
  badgeKey,
  px,
  showGlow,
  animate,
}: {
  badgeKey: string;
  px: number;
  showGlow: boolean;
  animate: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const def = getBadgeDef(badgeKey);
  const shapePath = getShapePath(def.shape);
  const innerShapePath = getShapePath(def.shape, 0.85);
  const mythicRing = def.rarity === "mythic" ? getShapePath(def.shape, 1.05) : null;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      className={`${animate ? "growth-badge-earn" : ""} ${def.rarity === "mythic" ? "growth-mythic" : ""} ${showGlow ? "growth-badge-pulse" : ""}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`grad-${uid}`} cx="40%" cy="30%">
          <stop offset="0%" stopColor={def.gradientFrom} />
          <stop offset="100%" stopColor={def.gradientTo} />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={def.glowColor} floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`clip-${uid}`}>
          <path d={shapePath} />
        </clipPath>
        <pattern id={`dots-${uid}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.8" fill={def.primaryColor} opacity="0.12" />
        </pattern>
      </defs>

      {showGlow ? (
        <circle
          cx="60"
          cy="60"
          r="58"
          fill={def.glowColor}
          opacity="0.15"
          className="motion-safe:growth-badge-pulse motion-reduce:opacity-15"
        />
      ) : null}

      <g clipPath={`url(#clip-${uid})`}>
        <rect x="0" y="0" width="120" height="120" fill={`url(#grad-${uid})`} />
        <rect x="0" y="0" width="120" height="120" fill={`url(#dots-${uid})`} />
        <ellipse cx="35" cy="30" rx="25" ry="15" fill="white" opacity="0.06" transform="rotate(-20 35 30)" />
      </g>

      <path
        d={shapePath}
        fill="none"
        stroke={def.primaryColor}
        strokeWidth="2"
        opacity="0.9"
        filter={`url(#glow-${uid})`}
      />
      <path d={innerShapePath} fill="none" stroke={def.primaryColor} strokeWidth="0.5" opacity="0.3" />

      <g transform="translate(60,55) scale(1.1)">
        <svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24" overflow="visible">
          <path
            d={def.innerPath}
            fill="none"
            stroke={def.innerStroke}
            strokeWidth={def.innerStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </g>

      <RarityStars rarity={def.rarity} color={def.primaryColor} uid={uid} />

      {mythicRing ? (
        <path
          d={mythicRing}
          fill="none"
          stroke={def.primaryColor}
          strokeWidth="2"
          className="growth-mythic-ring"
        />
      ) : null}
    </svg>
  );
}

function LockedBadgeSvg({ badgeKey, px }: { badgeKey: string; px: number }) {
  const uid = useId().replace(/:/g, "");
  const def = getBadgeDef(badgeKey);
  const shapePath = getShapePath(def.shape);

  return (
    <svg width={px} height={px} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <clipPath id={`clip-locked-${uid}`}>
          <path d={shapePath} />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-locked-${uid})`}>
        <rect x="0" y="0" width="120" height="120" fill="#1A1A24" />
        <rect x="0" y="0" width="120" height="120" fill={def.primaryColor} opacity="0.08" />
      </g>
      <path d={shapePath} fill="none" stroke="#3A3A4A" strokeWidth="1.5" />
      <g transform="translate(60,56)">
        <rect x="-8" y="-2" width="16" height="13" rx="2" fill="none" stroke="#4A4A5A" strokeWidth="1.5" />
        <path d="M-4,-2 C-4,-8 4,-8 4,-2" fill="none" stroke="#4A4A5A" strokeWidth="1.5" />
        <circle cx="0" cy="5" r="2" fill="#4A4A5A" />
      </g>
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
  const px = chip ? 20 : SIZE_PX[size];

  const glowStyle = useMemo(
    () =>
      earned && showGlow && !chip
        ? {
            filter: `drop-shadow(0 0 8px ${getBadgeDef(badgeKey).glowColor}) drop-shadow(0 0 16px ${getBadgeDef(badgeKey).glowColor}44)`,
          }
        : undefined,
    [badgeKey, earned, showGlow, chip],
  );

  const inner = earned ? (
    <EarnedBadgeSvg badgeKey={badgeKey} px={px} showGlow={showGlow} animate={animate} />
  ) : (
    <LockedBadgeSvg badgeKey={badgeKey} px={px} />
  );

  if (chip) {
    return (
      <span
        className={`growth-badge-chat-chip inline-flex shrink-0 ${earned ? "" : "opacity-70"} ${className}`}
        title={name ?? badgeKey}
      >
        <span style={{ width: px, height: px, display: "inline-block" }}>{inner}</span>
      </span>
    );
  }

  const wrapClass = `group relative inline-flex flex-col items-center gap-1 ${className}`;
  const innerWrap = (
    <>
      <div
        className={`relative motion-safe:transition-transform motion-safe:group-hover:scale-105 ${defShowBorder(earned, badgeKey)}`}
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
