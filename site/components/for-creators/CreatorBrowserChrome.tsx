"use client";

import type { ReactNode } from "react";

type Props = {
  url: string;
  live?: boolean;
  progress?: number;
  children: ReactNode;
  className?: string;
  footerLabel?: string;
};

export function CreatorBrowserChrome({
  url,
  live = true,
  progress,
  children,
  className = "",
  footerLabel,
}: Props) {
  return (
    <div className={`fc-demo-browser fc-demo-browser--premium overflow-hidden rounded-2xl border border-white/12 bg-[#0a0614] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/50 px-4 py-3">
        <span className="size-2.5 rounded-full bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        <span className="size-2.5 rounded-full bg-amber-400/90" />
        <span className="size-2.5 rounded-full bg-emerald-500/90" />
        <span className="ms-2 min-w-0 flex-1 truncate rounded-lg border border-white/8 bg-white/[0.04] px-3 py-1.5 text-start font-mono text-[10px] text-white/50">
          {url}
        </span>
        {live ? (
          <span className="hidden shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-200 sm:inline">
            LIVE
          </span>
        ) : null}
      </div>
      {typeof progress === "number" ? (
        <div className="h-0.5 bg-white/5" aria-hidden>
          <div
            className="fc-cinema-chapter-progress h-full bg-gradient-to-r from-[var(--creator-secondary)] via-rose-400 to-violet-400 transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#050208]">{children}</div>
      {footerLabel ? (
        <div className="border-t border-white/8 bg-black/40 px-4 py-2">
          <p className="font-[family-name:var(--font-cairo)] text-xs font-bold text-white/75">{footerLabel}</p>
        </div>
      ) : null}
    </div>
  );
}
