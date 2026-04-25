"use client";

import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "", onMouseMove, onMouseLeave, ...rest }: Props) {
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    onMouseMove?.(e);
  };

  const leave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.removeProperty("--mx");
    e.currentTarget.style.removeProperty("--my");
    onMouseLeave?.(e);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.035] p-7 shadow-[0_0_0_1px_rgba(201,160,97,0.06),0_24px_64px_-32px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:border-gold/30 hover:shadow-[0_0_52px_-24px_rgba(201,160,97,0.35)] motion-safe:hover:-translate-y-0.5 ${className}`}
      onMouseMove={move}
      onMouseLeave={leave}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
        style={{
          background:
            "radial-gradient(520px circle at var(--mx,50%) var(--my,50%), rgba(201,160,97,0.1), transparent 42%)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
