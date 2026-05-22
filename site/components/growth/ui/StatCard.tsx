"use client";

import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/growth/ui/AnimatedNumber";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconTrending } from "@/components/growth/icons/GrowthIcons";

type Props = {
  label: string;
  value: number | string;
  sub?: string;
  icon?: ReactNode;
  trend?: { delta: number; label?: string };
  animateValue?: boolean;
  valueFormat?: (n: number) => string;
  colorClass?: string;
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  animateValue = typeof value === "number",
  valueFormat,
  colorClass = "text-[var(--growth-gold-bright)]",
}: Props) {
  const numeric = typeof value === "number";

  return (
    <GlassCard
      variant="elevated"
      className="bg-[linear-gradient(135deg,#1A1A24,#111118)] p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--growth-text-sub)]">
            {label}
          </p>
          <div className={`mt-2 text-2xl font-extrabold sm:text-3xl ${colorClass}`}>
            {numeric && animateValue ? (
              <AnimatedNumber
                value={value}
                format={valueFormat ?? ((n) => String(Math.round(n)))}
              />
            ) : (
              value
            )}
          </div>
          {sub ? <p className="mt-1 text-xs text-[var(--growth-text-sub)]">{sub}</p> : null}
          {trend ? (
            <p
              className={`mt-1 text-xs font-semibold ${trend.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              <IconTrending
                size={12}
                className={`inline ${trend.delta < 0 ? "rotate-180" : ""}`}
                aria-hidden
              />{" "}
              {Math.abs(trend.delta)}
              {trend.label ? ` ${trend.label}` : ""}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--growth-border)] bg-white/[0.04]">
            {icon}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
