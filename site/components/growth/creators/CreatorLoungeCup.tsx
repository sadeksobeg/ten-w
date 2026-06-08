"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconInfo, IconTrophy } from "@/components/growth/icons/GrowthIcons";
import { CreatorCupPanel } from "@/components/growth/creators/CreatorCupPanel";
import type { CreatorCupRow } from "@/lib/growth/creator-arena";

type Props = {
  rows: CreatorCupRow[];
  myUserId: string;
};

export function CreatorLoungeCup({ rows, myUserId }: Props) {
  const t = useTranslations("Growth.creators.lounge");
  const myRow = rows.find((r) => r.userId === myUserId);

  return (
    <div className="space-y-4">
      {myRow ? (
        <GlassCard className="border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <IconTrophy size={24} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gold/80">
                {t("cupRankHighlight")}
              </p>
              <p className="font-[family-name:var(--font-cairo)] text-2xl font-black text-white">
                #{myRow.rank}
              </p>
              <p className="text-xs text-white/55">
                {t("cupYourScore", { score: myRow.score, posts: myRow.submissions })}
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <CreatorCupPanel rows={rows} myUserId={myUserId} />

      <GlassCard className="flex gap-3 border border-white/10 bg-white/[0.03] p-4">
        <IconInfo size={18} className="mt-0.5 shrink-0 text-gold" />
        <p className="text-xs leading-relaxed text-white/60">{t("cupPointsExplainer")}</p>
      </GlassCard>
    </div>
  );
}
