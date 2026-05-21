"use client";

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
  totalXp,
  currentLevelMinXp,
  nextLevelName,
  nextLevelMinXp,
}: Props) {
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

  return (
    <GlassCard variant="highlight" className="p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <svg width="88" height="88" className="-rotate-90" aria-hidden>
            <circle cx="44" cy="44" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="44"
              cy="44"
              r="34"
              fill="none"
              stroke={lv.ringColor}
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
          <p className="text-sm text-[var(--growth-text-sub)]">
            {locale === "ar" ? "مرحباً،" : locale === "fr" ? "Bonjour," : "Welcome,"}
          </p>
          <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <LevelBadge levelName={levelName} size="md" />
            {nextLevelName ? (
              <span className="text-xs text-[var(--growth-text-sub)]">
                · {locale === "ar" ? "المستوى التالي:" : "Next:"} {nextLevelName}
              </span>
            ) : null}
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--growth-text-sub)]">
              <span>
                {hasNext
                  ? `${powerLabel} — ${pct}%`
                  : locale === "ar"
                    ? `${powerLabel} — أعلى مستوى`
                    : locale === "fr"
                      ? `${powerLabel} — niveau max`
                      : `${powerLabel} — max level`}
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
