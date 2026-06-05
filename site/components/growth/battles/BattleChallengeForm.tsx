"use client";

import { useTranslations } from "next-intl";
import { challengePartnerFormAction } from "@/lib/growth/engagement-actions";
import type { BattleCandidateGroup } from "@/lib/growth/battle-candidates";
import { BattleRivalPicker } from "@/components/growth/battles/BattleRivalPicker";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  groups: BattleCandidateGroup[];
  locale: string;
};

export function BattleChallengeForm({ groups, locale }: Props) {
  const t = useTranslations("Growth.battles");

  return (
    <GlassCard className="p-5">
      <h3 className="font-bold text-gold">{t("challenge")}</h3>
      <form action={challengePartnerFormAction} className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-white/70">{t("pickRival")}</p>
          <BattleRivalPicker groups={groups} locale={locale} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-white/60">
            {t("target")}
            <input
              name="target"
              type="number"
              min={1}
              max={10}
              defaultValue={3}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-white/60">
            {t("stakes")}
            <input
              name="stakesXp"
              type="number"
              min={100}
              max={2000}
              step={50}
              defaultValue={500}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <input type="hidden" name="metric" value="deals" />
        <GoldButton type="submit" className="w-full sm:w-auto">
          {t("sendChallenge")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
