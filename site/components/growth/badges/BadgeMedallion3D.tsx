"use client";

import { useId } from "react";
import {
  getBadgeDef,
  getRarityStarCount,
  type BadgeRarity,
} from "@/lib/growth/badge-visual";
import {
  getShapePath,
  resolvePremiumShape,
  type BadgeShape,
} from "@/lib/growth/badge-shapes";

type MedallionProps = {
  badgeKey: string;
  px: number;
  showGlow: boolean;
  animate: boolean;
  earned: boolean;
};

function rarityMetal(rarity: BadgeRarity): { rim: string; highlight: string; shadow: string } {
  switch (rarity) {
    case "mythic":
      return { rim: "#F5E6A8", highlight: "#FFF8E7", shadow: "#5C3D0A" };
    case "legendary":
      return { rim: "#E8C547", highlight: "#FFF4C2", shadow: "#6B4E12" };
    case "epic":
      return { rim: "#C084FC", highlight: "#F3E8FF", shadow: "#581C87" };
    case "rare":
      return { rim: "#60A5FA", highlight: "#DBEAFE", shadow: "#1E3A8A" };
    default:
      return { rim: "#9CA3AF", highlight: "#F3F4F6", shadow: "#374151" };
  }
}

function RarityGems({
  rarity,
  color,
  uid,
}: {
  rarity: string;
  color: string;
  uid: string;
}) {
  const count = getRarityStarCount(rarity);
  const offset = ((count - 1) * 10) / 2;
  return (
    <g transform="translate(60, 108)">
      {Array.from({ length: count }, (_, i) => {
        const x = i * 10 - offset;
        return (
          <polygon
            key={`${uid}-gem-${i}`}
            points={`${x},-3 ${x + 3},0 ${x},3 ${x - 3},0`}
            fill={color}
            stroke={color}
            strokeWidth="0.5"
            opacity={0.95}
          />
        );
      })}
    </g>
  );
}

export function BadgeMedallion3D({ badgeKey, px, showGlow, animate, earned }: MedallionProps) {
  const uid = useId().replace(/:/g, "");
  const def = getBadgeDef(badgeKey);
  const premiumShape = resolvePremiumShape(def.rarity, def.shape as BadgeShape);
  const shapePath = getShapePath(premiumShape);
  const innerPath = getShapePath(premiumShape, 0.88);
  const metal = rarityMetal(def.rarity);

  if (!earned) {
    return (
      <svg width={px} height={px} viewBox="0 0 120 120" aria-hidden className="growth-badge-3d-svg">
        <defs>
          <clipPath id={`clip-locked-${uid}`}>
            <path d={shapePath} />
          </clipPath>
          <linearGradient id={`lock-rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A3A4A" />
            <stop offset="100%" stopColor="#1A1A24" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="112" rx="34" ry="5" fill="#000" opacity="0.35" />
        <path d={shapePath} fill={`url(#lock-rim-${uid})`} stroke="#2A2A36" strokeWidth="2" />
        <g clipPath={`url(#clip-locked-${uid})`}>
          <rect x="0" y="0" width="120" height="120" fill="#12121A" />
          <rect x="0" y="0" width="120" height="120" fill={def.primaryColor} opacity="0.06" />
        </g>
        <path d={innerPath} fill="none" stroke="#3A3A4A" strokeWidth="1" opacity="0.5" />
        <g transform="translate(60,54)">
          <rect x="-9" y="-1" width="18" height="14" rx="2.5" fill="none" stroke="#5A5A6A" strokeWidth="1.75" />
          <path d="M-5,-1 C-5,-9 5,-9 5,-1" fill="none" stroke="#5A5A6A" strokeWidth="1.75" />
          <circle cx="0" cy="6" r="2" fill="#5A5A6A" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      aria-hidden
      className={`growth-badge-3d-svg ${animate ? "growth-badge-earn" : ""} ${def.rarity === "mythic" ? "growth-mythic" : ""} ${showGlow ? "growth-badge-3d-glow" : ""}`}
    >
      <defs>
        <radialGradient id={`face-${uid}`} cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor={def.gradientFrom} stopOpacity="1" />
          <stop offset="55%" stopColor={def.gradientTo} stopOpacity="1" />
          <stop offset="100%" stopColor="#050508" stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={metal.highlight} />
          <stop offset="45%" stopColor={metal.rim} />
          <stop offset="100%" stopColor={metal.shadow} />
        </linearGradient>
        <linearGradient id={`bevel-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <filter id={`depth-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={def.glowColor} floodOpacity="0.45" />
        </filter>
        <filter id={`spec-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4"
            specularConstant="0.75"
            specularExponent="18"
            lightingColor={metal.highlight}
            result="spec"
          >
            <fePointLight x="30" y="20" z="80" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceGraphic" operator="in" result="specOut" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="specOut" />
          </feMerge>
        </filter>
        <clipPath id={`clip-${uid}`}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="112" rx="36" ry="5.5" fill="#000" opacity="0.4" />

      <g filter={`url(#depth-${uid})`}>
        <path d={shapePath} fill={`url(#rim-${uid})`} stroke={metal.shadow} strokeWidth="1.5" />
        <g clipPath={`url(#clip-${uid})`} filter={`url(#spec-${uid})`}>
          <rect x="0" y="0" width="120" height="120" fill={`url(#face-${uid})`} />
          <rect x="0" y="0" width="120" height="120" fill={`url(#bevel-${uid})`} />
          <ellipse cx="38" cy="28" rx="28" ry="16" fill="#FFFFFF" opacity="0.1" transform="rotate(-18 38 28)" />
        </g>
        <path d={shapePath} fill="none" stroke={metal.highlight} strokeWidth="1.25" opacity="0.55" />
        <path d={innerPath} fill="none" stroke={def.primaryColor} strokeWidth="0.75" opacity="0.35" />
      </g>

      <g transform="translate(60,52) scale(1.15)">
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

      <RarityGems rarity={def.rarity} color={def.primaryColor} uid={uid} />

      {def.rarity === "mythic" ? (
        <path
          d={getShapePath(premiumShape, 1.04)}
          fill="none"
          stroke={def.primaryColor}
          strokeWidth="1.5"
          className="growth-mythic-ring"
          opacity="0.85"
        />
      ) : null}
    </svg>
  );
}
