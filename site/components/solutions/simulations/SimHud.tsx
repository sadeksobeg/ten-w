"use client";

import type { ReactNode } from "react";

const accentClass = {
  gold: "border-gold/25 shadow-[0_0_24px_rgba(201,160,97,0.14)]",
  emerald: "border-emerald-500/30 shadow-[0_0_24px_rgba(34,197,94,0.14)]",
  indigo: "border-indigo-400/25 shadow-[0_0_24px_rgba(129,140,248,0.14)]",
  amber: "border-amber-400/25 shadow-[0_0_24px_rgba(251,191,36,0.12)]",
} as const;

export type SimHudAccent = keyof typeof accentClass;

export function SimHudPill({
  label,
  value,
  accent = "gold",
}: {
  label: string;
  value: string;
  accent?: SimHudAccent;
}) {
  return (
    <div
      className={`rounded-lg border bg-black/60 px-2 py-1.5 backdrop-blur-md sm:px-2.5 sm:py-2 ${accentClass[accent]}`}
    >
      <div className="text-[8px] font-medium uppercase tracking-[0.16em] text-white/45 sm:text-[9px]">
        {label}
      </div>
      <div className="font-mono text-[11px] tabular-nums text-white/95 sm:text-[13px]">{value}</div>
    </div>
  );
}

export function SimHudRow({
  children,
  position = "top",
}: {
  children: ReactNode;
  position?: "top" | "bottom";
}) {
  const y = position === "top" ? "top-2 sm:top-2.5" : "bottom-8 sm:bottom-9";
  return (
    <div
      className={`pointer-events-none absolute ${y} left-2 right-2 z-10 flex flex-wrap items-start justify-between gap-1 sm:left-2.5 sm:right-2.5 sm:gap-2`}
    >
      {children}
    </div>
  );
}

export function SimHudEventStrip({ lines }: { lines: string[] }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 overflow-hidden rounded-md border border-emerald-500/20 bg-black/55 py-1.5 pr-2 pl-2 font-mono text-[9px] leading-relaxed text-emerald-200/80 backdrop-blur-md sm:text-[10px]">
      {lines.slice(0, 4).map((line, i) => (
        <div
          key={`${line}-${i}`}
          className="truncate"
          style={{ opacity: 0.88 - i * 0.18 }}
        >
          <span className="text-emerald-500/70">{">"} </span>
          {line}
        </div>
      ))}
    </div>
  );
}
