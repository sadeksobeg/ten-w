"use client";

import { useTranslations } from "next-intl";
import { TimeCapsuleVisual } from "@/components/growth/capsule/TimeCapsuleVisual";
import { IconLock } from "@/components/growth/icons/GrowthIcons";

type Props = { daysLeft: number };

export function TimeCapsuleCountdown({ daysLeft }: Props) {
  const t = useTranslations("Growth.capsule");
  const totalDays = 180;
  const elapsed = Math.max(0, totalDays - daysLeft);
  const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="growth-capsule-countdown relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#0f1424] via-[#0a0c14] to-[#050810] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(228,184,77,0.08),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative flex size-36 shrink-0 items-center justify-center">
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#capsuleProgressGold)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
            />
            <defs>
              <linearGradient id="capsuleProgressGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B6914" />
                <stop offset="50%" stopColor="#E4B84D" />
                <stop offset="100%" stopColor="#FFF4C2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="relative z-[1] flex flex-col items-center">
            <TimeCapsuleVisual size={72} sealed className="motion-safe:growth-capsule-float" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-start">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
            <IconLock size={12} />
            {t("lockedTitle")}
          </div>
          <p className="font-[family-name:var(--font-cairo)] text-3xl font-bold tabular-nums text-white">
            {daysLeft}
          </p>
          <p className="mt-2 text-sm text-white/65">{t("lockedBody", { days: daysLeft })}</p>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-white/35">{pct}%</p>
        </div>
      </div>
    </div>
  );
}
