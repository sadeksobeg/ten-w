"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { CreatorPulseStats } from "@/lib/growth/creator-arena";

type Props = {
  pulse: CreatorPulseStats;
};

export function CreatorPulsePanel({ pulse }: Props) {
  const t = useTranslations("Growth.creators");

  const stats = [
    { key: "online", value: pulse.onlineMembers },
    { key: "challenges", value: pulse.activeChallenges },
    { key: "posts", value: pulse.postsThisWeek },
  ] as const;

  return (
    <GlassCard className="border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-purple-500/10 p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-gold">
        {t("pulseTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("pulseSubtitle")}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-white/10 bg-black/25 px-3 py-4 text-center"
          >
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-white/45">
              {t(`pulse.${s.key}`)}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
