"use client";

import type { AvatarPreset } from "@/lib/growth/avatar-presets";

const GLYPHS: Record<string, string> = {
  "gold-1": "👑",
  "gold-2": "⚔️",
  "violet-1": "🔮",
  "violet-2": "✦",
  "emerald-1": "🎯",
  "emerald-2": "🏹",
  "crimson-1": "🔥",
  "crimson-2": "💎",
  "cyan-1": "🌊",
  "cyan-2": "⚡",
  "slate-1": "🛡️",
  "slate-2": "🦅",
};

type Props = {
  preset: AvatarPreset;
  size?: number;
  className?: string;
};

export function AvatarPresetFace({ preset, size = 40, className = "" }: Props) {
  const glyph = GLYPHS[preset.id] ?? "★";
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white ring-2 ring-gold/40 ring-offset-2 ring-offset-[#050816] ${className}`}
      style={{
        width: size,
        height: size,
        background: preset.gradient,
        boxShadow: `0 0 20px ${preset.accent}55, inset 0 0 12px rgba(255,255,255,0.15)`,
      }}
    >
      <span
        className="select-none"
        style={{ fontSize: Math.round(size * 0.42), filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}
      >
        {glyph}
      </span>
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.35) 0%, transparent 42%, rgba(0,0,0,0.25) 100%)",
        }}
      />
    </div>
  );
}
