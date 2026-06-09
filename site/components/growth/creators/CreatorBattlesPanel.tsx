"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorBattlePicker, type BattleCandidate } from "./CreatorBattlePicker";

type Props = {
  candidates: BattleCandidate[];
};

export function CreatorBattlesPanel({ candidates }: Props) {
  const t = useTranslations("Growth.creators");

  if (candidates.length === 0) return null;

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("battlesTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("battlesSubtitle")}</p>
      <div className="mt-4">
        <CreatorBattlePicker candidates={candidates} />
      </div>
    </GlassCard>
  );
}
