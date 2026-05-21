"use client";

import { useMemo } from "react";
import {
  getBadgeVisual,
  RARITY_COLORS,
  type BadgeIconId,
} from "@/lib/growth/badge-visual";
import { badgeShapeElement } from "@/lib/growth/badge-shape";

export type BadgeIconSize = "sm" | "md" | "lg" | "xl";

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
};

const SIZE_PX: Record<BadgeIconSize, number> = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
};

function IconPath({ id, color }: { id: BadgeIconId; color: string }) {
  const s = { stroke: color, fill: "none", strokeWidth: 2, strokeLinecap: "round" as const };
  switch (id) {
    case "lightning":
      return (
        <path
          {...s}
          fill={color}
          fillOpacity={0.2}
          d="M28 8L18 36h12l-4 24 20-28H34l6-24z"
        />
      );
    case "target":
      return (
        <>
          <circle {...s} cx="32" cy="32" r="22" />
          <circle {...s} cx="32" cy="32" r="12" />
          <circle fill={color} cx="32" cy="32" r="4" />
        </>
      );
    case "diamond":
      return (
        <path
          {...s}
          fill={color}
          fillOpacity={0.15}
          d="M32 6l22 26H10L32 6zm0 52L10 32h44L32 58z"
        />
      );
    case "link":
      return (
        <path
          {...s}
          d="M20 32a12 12 0 0112-12h6M44 32a12 12 0 01-12 12h-6M26 38l12-12M38 26L26 38"
        />
      );
    case "globe":
      return (
        <>
          <circle {...s} cx="32" cy="32" r="22" />
          <path {...s} d="M10 32h44M32 10c8 8 8 36 0 44M32 10c-8 8-8 36 0 44" />
        </>
      );
    case "robot":
      return (
        <>
          <rect {...s} x="14" y="18" width="36" height="32" rx="6" />
          <circle fill={color} cx="24" cy="32" r="3" />
          <circle fill={color} cx="40" cy="32" r="3" />
          <path {...s} d="M22 44h20M32 10v8" />
        </>
      );
    case "bolt_clock":
      return (
        <>
          <path
            {...s}
            fill={color}
            fillOpacity={0.2}
            d="M34 10L26 30h10l-6 22 18-24H38l-4-18z"
          />
          <circle {...s} cx="48" cy="48" r="10" />
          <path {...s} d="M48 44v6l4 2" />
        </>
      );
    case "crown":
      return (
        <path
          {...s}
          fill={color}
          fillOpacity={0.2}
          d="M8 40l8-20 8 12 8-16 8 16 8-12 8 20H8z"
        />
      );
    case "sparkle":
      return (
        <>
          <path {...s} d="M32 6v12M32 46v12M6 32h12M46 32h12M14 14l8 8M42 42l8 8M50 14l-8 8M22 42l-8 8" />
          <circle fill={color} cx="32" cy="32" r="6" />
        </>
      );
    default:
      return (
        <path
          {...s}
          fill={color}
          fillOpacity={0.2}
          d="M32 8l6 18h18l-14 10 6 18-16-12-16 12 6-18-14-10h18l6-18z"
        />
      );
  }
}

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

export function BadgeIcon({
  badgeKey,
  earned,
  size = "md",
  showName,
  name,
  showGlow = true,
  animate,
  className = "",
  lockedLabel = "مقفل",
}: BadgeIconProps) {
  const px = SIZE_PX[size];
  const meta = getBadgeVisual(badgeKey);
  const color = earned ? meta.glowColor : "#6b7280";
  const clipId = useMemo(() => `clip-${badgeKey}-${size}`, [badgeKey, size]);

  const glowStyle =
    earned && showGlow
      ? {
          filter: `drop-shadow(0 0 8px ${meta.glowColor}) drop-shadow(0 0 20px ${meta.glowColor}66)`,
        }
      : undefined;

  return (
    <div
      className={`group relative inline-flex flex-col items-center gap-1 ${className}`}
      title={!earned ? lockedLabel : undefined}
    >
      <div
        className={`relative motion-safe:transition-transform motion-safe:group-hover:scale-105 ${animate ? "growth-badge-earn" : ""} ${!earned ? "opacity-40 grayscale" : ""}`}
        style={{ width: px, height: px, ...glowStyle }}
      >
        <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden>
          <defs>
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
            r={px * 0.46}
            fill="none"
            stroke={earned ? RARITY_COLORS[meta.rarity] : "#4b5563"}
            strokeWidth={2}
          />
          <g clipPath={`url(#${clipId})`}>
            <rect width={px} height={px} fill={earned ? `${color}22` : "#1a1a24"} />
            <g transform={`translate(${px * 0.12}, ${px * 0.12}) scale(${(px * 0.76) / 64})`}>
              <IconPath id={meta.iconId} color={color} />
            </g>
          </g>
        </svg>
        {!earned ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width={px * 0.35} height={px * 0.35} viewBox="0 0 24 24" aria-hidden>
              <path
                fill="rgba(255,255,255,0.7)"
                d="M12 2a5 5 0 00-5 5v3H6v13h12V10h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z"
              />
            </svg>
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
