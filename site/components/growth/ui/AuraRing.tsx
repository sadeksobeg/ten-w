"use client";

import type { ReactNode } from "react";
import { GAME_CONFIG } from "@/lib/growth/game-config";
import { getLevelVisual } from "@/lib/growth/level-visual";

type Props = {
  size?: number;
  strokeWidth?: number;
  percent: number;
  levelCode?: string | null;
  levelName?: string;
  children: ReactNode;
  className?: string;
};

export function AuraRing({
  size = 88,
  strokeWidth = 4,
  percent,
  levelCode,
  levelName,
  children,
  className = "",
}: Props) {
  const r = (size - strokeWidth) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const lv = getLevelVisual(levelName ?? "");
  const ringColor =
    (levelCode && GAME_CONFIG.levelColors[levelCode]) ||
    lv.ringColor;

  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r + strokeWidth * 0.4}
          fill="none"
          stroke={ringColor}
          strokeWidth={1}
          opacity={0.35}
          className="motion-safe:animate-[pulse_3s_ease-in-out_infinite] motion-reduce:animate-none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center p-2">{children}</div>
    </div>
  );
}
