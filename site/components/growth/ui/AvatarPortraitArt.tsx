"use client";

import type { AvatarPreset } from "@/lib/growth/avatar-presets";

type Props = {
  preset: AvatarPreset;
  size?: number;
  className?: string;
};

/** Illustrated RPG-style portrait bust (SVG — no external assets). */
export function AvatarPortraitArt({ preset, size = 80, className = "" }: Props) {
  const uid = preset.id.replace(/\W/g, "");
  const h = Math.round(size * 1.15);

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 115"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={preset.accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#050810" />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5d0b5" />
          <stop offset="100%" stopColor="#c8956c" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={preset.accent} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <ellipse cx="50" cy="52" rx="38" ry="42" />
        </clipPath>
      </defs>

      <rect width="100" height="115" fill={`url(#${uid}-bg)`} rx="8" />
      <ellipse cx="50" cy="30" rx="45" ry="35" fill={`url(#${uid}-glow)`} />

      {/* shoulders / armor */}
      <path
        d="M12 95 Q50 72 88 95 L88 115 L12 115 Z"
        fill={preset.accent}
        opacity="0.85"
      />
      <path
        d="M22 92 Q50 78 78 92 L75 115 L25 115 Z"
        fill="#0a0c14"
        opacity="0.35"
      />

      {/* head */}
      <ellipse cx="50" cy="48" rx="22" ry="26" fill={`url(#${uid}-skin)`} />
      <ellipse cx="50" cy="42" rx="18" ry="14" fill="#000" opacity="0.08" />

      {/* headgear by tier */}
      {preset.tier === "legend" || preset.id.includes("legend") ? (
        <path
          d="M28 38 L50 18 L72 38 L68 44 L32 44 Z"
          fill={preset.accent}
          stroke="#FFF8E7"
          strokeWidth="1"
        />
      ) : preset.tier === "diamond" || preset.tier === "platinum" ? (
        <path
          d="M30 36 Q50 22 70 36 L66 42 L34 42 Z"
          fill={preset.accent}
          opacity="0.9"
        />
      ) : (
        <path d="M32 38 Q50 28 68 38" fill="none" stroke={preset.accent} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* eyes */}
      <ellipse cx="42" cy="48" rx="3" ry="4" fill="#1a1020" />
      <ellipse cx="58" cy="48" rx="3" ry="4" fill="#1a1020" />
      <circle cx="43" cy="47" r="1" fill="#fff" opacity="0.7" />
      <circle cx="59" cy="47" r="1" fill="#fff" opacity="0.7" />

      {/* emblem on chest */}
      <g transform="translate(50,88)">
        <circle r="8" fill={preset.accent} opacity="0.25" />
        <circle r="5" fill="none" stroke={preset.accent} strokeWidth="1.5" />
      </g>

      {/* vignette */}
      <rect width="100" height="115" fill="url(#000)" opacity="0" />
      <ellipse cx="50" cy="58" rx="42" ry="48" fill="none" stroke={preset.accent} strokeWidth="1" opacity="0.25" />
    </svg>
  );
}
