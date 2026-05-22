"use client";

import { GameIcon } from "@/components/growth/icons/GameIcon";
import type { AvatarPreset } from "@/lib/growth/avatar-presets";
import { getAvatarTierRing } from "@/lib/growth/avatar-presets";

type Props = {
  preset: AvatarPreset;
  size?: number;
  className?: string;
};

export function AvatarPresetFace({ preset, size = 40, className = "" }: Props) {
  const ring = getAvatarTierRing(preset.tier);
  const iconSize = Math.round(size * 0.48);
  const isLegend = preset.tier === "legend";

  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white ${isLegend ? "growth-avatar-legend-ring" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        background: preset.gradient,
        boxShadow: `0 0 24px ${preset.accent}66, 0 0 0 3px ${ring}, 0 0 0 5px rgba(5,8,22,0.9), inset 0 0 16px rgba(255,255,255,0.12)`,
      }}
    >
      <GameIcon slug={preset.portraitSlug} size={iconSize} color="#fff" glow={isLegend} />
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.4) 0%, transparent 38%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      {isLegend ? (
        <span
          className="pointer-events-none absolute -inset-0.5 rounded-full growth-shimmer opacity-40"
          style={{
            background: "conic-gradient(from 0deg, #e4b84d, #a855f7, #22d3ee, #e4b84d)",
          }}
        />
      ) : null}
    </div>
  );
}
