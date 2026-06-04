"use client";

import { GameIcon } from "@/components/growth/icons/GameIcon";
import { AvatarPortraitArt } from "@/components/growth/ui/AvatarPortraitArt";
import type { AvatarPreset } from "@/lib/growth/avatar-presets";
import { getAvatarTierRing } from "@/lib/growth/avatar-presets";

type Props = {
  preset: AvatarPreset;
  size?: number;
  className?: string;
  showPortrait?: boolean;
};

export function AvatarPresetFace({
  preset,
  size = 40,
  className = "",
  showPortrait = true,
}: Props) {
  const ring = getAvatarTierRing(preset.tier);
  const iconSize = Math.round(size * 0.38);
  const isLegend = preset.tier === "legend";

  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${isLegend ? "growth-avatar-legend-ring" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        background: preset.gradient,
        boxShadow: `0 0 28px ${preset.accent}77, 0 0 0 3px ${ring}, 0 0 0 6px rgba(5,8,22,0.95), inset 0 0 20px rgba(255,255,255,0.14)`,
      }}
    >
      {showPortrait && size >= 36 ? (
        <AvatarPortraitArt preset={preset} size={Math.round(size * 0.92)} className="relative z-[1]" />
      ) : (
        <GameIcon slug={preset.portraitSlug} size={iconSize} color="#fff" glow={isLegend} />
      )}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {isLegend ? (
        <span
          className="pointer-events-none absolute -inset-0.5 rounded-full growth-shimmer opacity-50"
          style={{
            background: "conic-gradient(from 0deg, #e4b84d, #a855f7, #22d3ee, #e4b84d)",
          }}
        />
      ) : null}
    </div>
  );
}
