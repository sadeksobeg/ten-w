"use client";

import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { getLevelVisual } from "@/lib/growth/level-visual";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";

type Props = {
  locale: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  levelName: string;
  levelCode?: string;
  levelOrder: number;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelName: string | null;
  nextLevelMinXp: number | null;
};

export function DashboardHero({
  locale,
  name,
  email,
  avatarUrl,
  levelName,
  levelCode,
  totalXp,
  currentLevelMinXp,
  nextLevelName,
  nextLevelMinXp,
}: Props) {
  const t = useTranslations("Growth.dashboard");
  const lv = getLevelVisual(levelName);
  const hasNext = nextLevelMinXp !== null && nextLevelMinXp > currentLevelMinXp;
  const target = hasNext ? nextLevelMinXp! : currentLevelMinXp + 1;
  const span = Math.max(1, target - currentLevelMinXp);
  const pct = hasNext
    ? Math.min(100, Math.max(0, Math.round(((totalXp - currentLevelMinXp) / span) * 100)))
    : 100;
  const powerLabel = getXpBrandLabel(locale);
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = levelCode
    ? `var(--growth-level-ring, ${lv.ringColor})`
    : lv.ringColor;

  return (
    <GlassCard variant="highlight" className="relative overflow-hidden p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 motion-safe:animate-[pulse_8s_ease-in-out_infinite] motion-reduce:opacity-30 motion-reduce:animate-none"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${lv.ringColor}33, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 100%, ${lv.ringColor}22, transparent 50%)`,
        }}
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <svg width="88" height="88" className="-rotate-90" aria-hidden>
            <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="44"
              cy="44"
              r="34"
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <GrowthAvatar name={name} email={email} avatarUrl={avatarUrl} size="lg" />
          </div>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-start">
          <p className="text-sm text-[var(--growth-text-sub)]">{t("heroWelcome")}</p>
          <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <LevelBadge levelName={levelName} levelCode={levelCode} locale={locale} size="md" />
            {nextLevelName ? (
              <span className="text-xs text-[var(--growth-text-sub)]">
                · {t("heroNext")} {nextLevelName}
              </span>
            ) : null}
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--growth-text-sub)]">
              <span>
                {hasNext
                  ? `${powerLabel} — ${pct}%`
                  : `${powerLabel} — ${t("heroMaxLevel")}`}
              </span>
              <span>
                {hasNext
                  ? `${Math.max(0, totalXp - currentLevelMinXp)} / ${span}`
                  : totalXp.toLocaleString(
                      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
                    )}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="growth-shimmer h-full rounded-full transition-[width] duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
