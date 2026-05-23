"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { IconLock } from "@/components/growth/icons/GrowthIcons";
import { GameIcon } from "@/components/growth/icons/GameIcon";
import {
  getBadgeVisual,
  RARITY_COLORS,
} from "@/lib/growth/badge-visual";
import { badgeShapeElement } from "@/lib/growth/badge-shape";

export type BadgeIconSize = "sm" | "md" | "lg" | "xl" | "xxl";

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
  /** Compact chip for chat name row */
  chip?: boolean;
};

const SIZE_PX: Record<BadgeIconSize, number> = {
  sm: 48,
  md: 72,
  lg: 96,
  xl: 120,
  xxl: 152,
};

function ShapeMask({ rarity, size }: { rarity: string; size: number }) {
  const id = `badge-shape-${rarity}-${size}`;
  if (rarity === "rare") {
    const r = size / 2;
    const points = Array.from({ length: 6 })
      .map((_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${r + r * 0.88 * Math.cos(a)},${r + r * 0.88 * Math.sin(a)}`;
      })
      .join(" ");
    return (
      <clipPath id={id}>
        <polygon points={points} />
      </clipPath>
    );
  }
  if (rarity === "epic") {
    return (
      <clipPath id={id}>
        <path d={`M${size * 0.5} ${size * 0.06} L${size * 0.92} ${size * 0.28} L${size * 0.78} ${size * 0.88} L${size * 0.22} ${size * 0.88} L${size * 0.08} ${size * 0.28} Z`} />
      </clipPath>
    );
  }
  if (rarity === "legendary") {
    const cx = size / 2;
    const cy = size / 2;
    const outer = size * 0.46;
    const inner = size * 0.2;
    const pts: string[] = [];
    for (let i = 0; i < 16; i += 1) {
      const a = (Math.PI / 8) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? outer : inner;
      pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
    }
    return (
      <clipPath id={id}>
        <polygon points={pts.join(" ")} />
      </clipPath>
    );
  }
  return (
    <clipPath id={id}>
      <circle cx={size / 2} cy={size / 2} r={size * 0.44} />
    </clipPath>
  );
}

function LegacyBadgeSvg({
  badgeKey,
  earned,
  px,
  meta,
  color,
  clipId,
}: {
  badgeKey: string;
  earned: boolean;
  px: number;
  meta: ReturnType<typeof getBadgeVisual>;
  color: string;
  clipId: string;
}) {
  return (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden>
      <defs>
        <filter id={`badge-glow-${badgeKey}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={meta.glowColor} floodOpacity="0.6" />
        </filter>
        <ShapeMask rarity={meta.rarity} size={px} />
        <clipPath id={clipId}>
          {(() => {
            const shape = badgeShapeElement(meta.shapeId, px);
            if (shape.type === "polygon") {
              return <polygon points={shape.points} />;
            }
            return <path d={shape.d} />;
          })()}
        </clipPath>
      </defs>
      <circle
        cx={px / 2}
        cy={px / 2}
        r={px * 0.48}
        fill="none"
        stroke={earned ? "#e4b84d" : "#4b5563"}
        strokeWidth={4}
        opacity={0.95}
      />
      {earned ? (
        <circle
          cx={px / 2}
          cy={px / 2}
          r={px * 0.5}
          fill="none"
          stroke={RARITY_COLORS[meta.rarity]}
          strokeWidth={1}
          opacity={0.35}
        />
      ) : null}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={px * 0.44}
        fill="none"
        stroke={earned ? RARITY_COLORS[meta.rarity] : "#4b5563"}
        strokeWidth={2}
        filter={earned ? `url(#badge-glow-${badgeKey})` : undefined}
      />
      <g clipPath={`url(#${clipId})`}>
        <rect width={px} height={px} fill={earned ? `${color}22` : "#1a1a24"} />
        <foreignObject x={px * 0.18} y={px * 0.18} width={px * 0.64} height={px * 0.64}>
          <div className="flex size-full items-center justify-center">
            <GameIcon slug={meta.iconSlug} size={Math.round(px * 0.52)} color={color} glow={earned} />
          </div>
        </foreignObject>
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
  animate,
  className = "",
  lockedLabel,
  chip = false,
}: BadgeIconProps) {
  const t = useTranslations("Growth.badges");
  const lockText = lockedLabel ?? t("lockedLabel");
  const px = chip ? 20 : SIZE_PX[size];
  const meta = getBadgeVisual(badgeKey);
  const color = earned ? meta.glowColor : "#6b7280";
  const clipId = useMemo(() => `clip-${badgeKey}-${size}`, [badgeKey, size]);
  const useAsset = Boolean(meta.assetPath);

  const glowStyle =
    earned && showGlow && !chip
      ? {
          filter: `drop-shadow(0 0 8px ${meta.glowColor}) drop-shadow(0 0 20px ${meta.glowColor}66)`,
        }
      : undefined;

  const tierClass =
    meta.tier === "legendary"
      ? "growth-badge-legendary-shimmer"
      : meta.tier === "gold"
        ? "growth-badge-medal"
        : "";

  if (chip) {
    return (
      <span
        className={`growth-badge-chat-chip inline-flex shrink-0 ${earned ? "" : "opacity-40 grayscale"} ${className}`}
        title={name ?? badgeKey}
      >
        {useAsset ? (
          <Image
            src={meta.assetPath!}
            alt=""
            width={px}
            height={px}
            className="size-5 object-contain"
            unoptimized
          />
        ) : (
          <GameIcon slug={meta.iconSlug} size={px} color={color} glow={earned} />
        )}
      </span>
    );
  }

  return (
    <div
      className={`group relative inline-flex flex-col items-center gap-1 ${className}`}
      title={!earned ? lockText : undefined}
    >
      <div
        className={`relative motion-safe:transition-transform motion-safe:group-hover:scale-105 ${animate ? "growth-badge-earn" : ""} ${earned ? "growth-badge-pulse" : "opacity-40 grayscale"} ${earned && meta.holo ? "growth-badge-holo" : ""} ${earned ? tierClass : ""} growth-badge-medal-wrap`}
        style={{ width: px, height: px, ...glowStyle }}
      >
        {useAsset ? (
          <Image
            src={meta.assetPath!}
            alt=""
            width={px}
            height={px}
            className="size-full object-contain"
            priority={size === "xxl" || size === "xl"}
            unoptimized
          />
        ) : (
          <LegacyBadgeSvg
            badgeKey={badgeKey}
            earned={earned}
            px={px}
            meta={meta}
            color={color}
            clipId={clipId}
          />
        )}
        {!earned ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <IconLock size={Math.round(px * 0.32)} />
          </div>
        ) : null}
      </div>
      {showName && name ? (
        <span className="max-w-[120px] truncate text-center text-[10px] font-semibold text-[var(--growth-text-sub)]">
          {name}
        </span>
      ) : null}
    </div>
  );
}
