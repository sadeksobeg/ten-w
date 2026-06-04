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

function rarityMetal(rarity: BadgeRarity): {
  rim: string;
  highlight: string;
  shadow: string;
  ribbon: string;
} {
  switch (rarity) {
    case "mythic":
      return { rim: "#FFF4C2", highlight: "#FFFDF5", shadow: "#5C3D0A", ribbon: "#7C2D12" };
    case "legendary":
      return { rim: "#F5D76E", highlight: "#FFF8E7", shadow: "#6B4E12", ribbon: "#78350F" };
    case "epic":
      return { rim: "#D8B4FE", highlight: "#FAF5FF", shadow: "#581C87", ribbon: "#4C1D95" };
    case "rare":
      return { rim: "#93C5FD", highlight: "#EFF6FF", shadow: "#1E3A8A", ribbon: "#1E40AF" };
    default:
      return { rim: "#D1D5DB", highlight: "#F9FAFB", shadow: "#374151", ribbon: "#4B5563" };
  }
}

function LaurelBranch({ side, color, uid }: { side: "left" | "right"; color: string; uid: string }) {
  const flip = side === "right" ? "scale(-1,1) translate(-120,0)" : "";
  return (
    <g transform={`translate(0,0) ${flip}`} opacity="0.85">
      <path
        d="M8 58 Q18 42 28 50 Q22 38 32 32 Q24 28 28 18 Q38 26 42 38 Q48 30 58 28 Q52 40 48 52 Q56 48 62 58 Q50 56 42 62 Q48 72 44 82 Q34 74 32 64 Q24 70 14 78 Q18 66 22 58 Q12 62 8 58 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {[38, 48, 58, 68].map((y, i) => (
        <ellipse
          key={`${uid}-leaf-${side}-${i}`}
          cx={36 + (i % 2) * 4}
          cy={y}
          rx="4"
          ry="7"
          fill={color}
          opacity={0.35 + i * 0.08}
          transform={`rotate(${-20 + i * 12} 36 ${y})`}
        />
      ))}
    </g>
  );
}

function RarityGems({ rarity, color, uid }: { rarity: string; color: string; uid: string }) {
  const count = getRarityStarCount(rarity);
  const offset = ((count - 1) * 11) / 2;
  return (
    <g transform="translate(60, 106)">
      {Array.from({ length: count }, (_, i) => {
        const x = i * 11 - offset;
        return (
          <g key={`${uid}-gem-${i}`} transform={`translate(${x},0)`}>
            <polygon points="0,-4 4,0 0,4 -4,0" fill={color} stroke={color} strokeWidth="0.5" />
            <circle cy="-1" r="1" fill="#fff" opacity="0.45" />
          </g>
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
  const innerPath = getShapePath(premiumShape, 0.86);
  const outerRing = getShapePath(premiumShape, 1.08);
  const metal = rarityMetal(def.rarity);
  const showLaurel = def.rarity === "legendary" || def.rarity === "mythic";
  const showHolo = def.rarity === "legendary" || def.rarity === "mythic" || def.rarity === "epic";

  if (!earned) {
    return (
      <svg width={px} height={px} viewBox="0 0 120 120" aria-hidden className="growth-badge-3d-svg">
        <defs>
          <clipPath id={`clip-locked-${uid}`}>
            <path d={shapePath} />
          </clipPath>
          <linearGradient id={`lock-rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A4A5A" />
            <stop offset="100%" stopColor="#12121A" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="114" rx="38" ry="6" fill="#000" opacity="0.45" />
        <path d={shapePath} fill={`url(#lock-rim-${uid})`} stroke="#2A2A36" strokeWidth="2.5" />
        <g clipPath={`url(#clip-locked-${uid})`}>
          <rect width="120" height="120" fill="#0E0E16" />
          <rect width="120" height="120" fill={def.primaryColor} opacity="0.05" />
        </g>
        <path d={innerPath} fill="none" stroke="#3A3A4A" strokeWidth="1" opacity="0.45" />
        <g transform="translate(60,52)">
          <rect x="-10" y="0" width="20" height="15" rx="2.5" fill="none" stroke="#5A5A6A" strokeWidth="2" />
          <path d="M-6,0 C-6,-10 6,-10 6,0" fill="none" stroke="#5A5A6A" strokeWidth="2" />
          <circle cy="7" r="2.5" fill="#5A5A6A" />
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
      className={`growth-badge-3d-svg ${animate ? "growth-badge-earn" : ""} ${def.rarity === "mythic" ? "growth-mythic growth-badge-mythic-orbit" : ""} ${showGlow ? "growth-badge-3d-glow" : ""} ${showHolo ? "growth-badge-holo-sheen" : ""}`}
    >
      <defs>
        <radialGradient id={`face-${uid}`} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor={def.gradientFrom} />
          <stop offset="45%" stopColor={def.gradientTo} />
          <stop offset="100%" stopColor="#030308" />
        </radialGradient>
        <linearGradient id={`rim-${uid}`} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor={metal.highlight} />
          <stop offset="35%" stopColor={metal.rim} />
          <stop offset="70%" stopColor={def.primaryColor} />
          <stop offset="100%" stopColor={metal.shadow} />
        </linearGradient>
        <linearGradient id={`rim2-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={metal.shadow} stopOpacity="0.8" />
          <stop offset="50%" stopColor={metal.highlight} />
          <stop offset="100%" stopColor={metal.shadow} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`bevel-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`holo-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="35%" stopColor="#a855f7" stopOpacity="0.22" />
          <stop offset="65%" stopColor="#e4b84d" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id={`depth-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={def.glowColor} floodOpacity="0.55" />
        </filter>
        <filter id={`spec-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="5"
            specularConstant="0.85"
            specularExponent="22"
            lightingColor={metal.highlight}
            result="spec"
          >
            <fePointLight x="28" y="18" z="90" />
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

      {showLaurel ? (
        <>
          <LaurelBranch side="left" color={def.primaryColor} uid={uid} />
          <LaurelBranch side="right" color={def.primaryColor} uid={uid} />
        </>
      ) : null}

      <ellipse cx="60" cy="114" rx="40" ry="6.5" fill="#000" opacity="0.5" />

      {/* back plate depth */}
      <path d={getShapePath(premiumShape, 1.02)} fill="#000" opacity="0.35" transform="translate(0,3)" />

      <g filter={`url(#depth-${uid})`}>
        <path d={outerRing} fill="none" stroke={`url(#rim2-${uid})`} strokeWidth="2.5" opacity="0.7" />
        <path d={shapePath} fill={`url(#rim-${uid})`} stroke={metal.shadow} strokeWidth="2" />

        <g clipPath={`url(#clip-${uid})`} filter={`url(#spec-${uid})`}>
          <rect width="120" height="120" fill={`url(#face-${uid})`} />
          <rect width="120" height="120" fill={`url(#bevel-${uid})`} />
          {showHolo ? <rect width="120" height="120" fill={`url(#holo-${uid})`} className="growth-badge-holo-layer" /> : null}
          <ellipse cx="36" cy="26" rx="32" ry="18" fill="#FFFFFF" opacity="0.14" transform="rotate(-22 36 26)" />
          <ellipse cx="78" cy="88" rx="24" ry="12" fill="#000" opacity="0.25" />
        </g>

        <path d={shapePath} fill="none" stroke={metal.highlight} strokeWidth="1.5" opacity="0.65" />
        <path d={innerPath} fill="none" stroke={def.primaryColor} strokeWidth="1" opacity="0.4" />
      </g>

      {/* icon — embossed gold */}
      <g transform="translate(60,50)">
        <svg x="-14" y="-14" width="28" height="28" viewBox="0 0 24 24" overflow="visible">
          <path
            d={def.innerPath}
            fill={def.primaryColor}
            fillOpacity="0.15"
            stroke={metal.highlight}
            strokeWidth={def.innerStrokeWidth + 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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

      {/* bottom ribbon */}
      <path
        d="M38 98 L82 98 L78 108 L42 108 Z"
        fill={metal.ribbon}
        stroke={metal.highlight}
        strokeWidth="0.75"
        opacity="0.9"
      />
      <path d="M50 98 L60 92 L70 98" fill={metal.highlight} opacity="0.35" />

      <RarityGems rarity={def.rarity} color={def.primaryColor} uid={uid} />

      {def.rarity === "mythic" ? (
        <path
          d={getShapePath(premiumShape, 1.06)}
          fill="none"
          stroke={def.primaryColor}
          strokeWidth="2"
          className="growth-mythic-ring"
          opacity="0.9"
        />
      ) : null}
    </svg>
  );
}
