"use client";

import { useTranslations } from "next-intl";
import { challengePartnerFormAction } from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  rivals: { id: string; name: string }[];
};

export function BattleChallengeForm({ rivals }: Props) {
  const t = useTranslations("Growth.battles");

  return (
    <GlassCard className="p-5">
      <h3 className="font-bold text-gold">{t("challenge")}</h3>
      <form action={challengePartnerFormAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-white/60 sm:col-span-2">
          {t("pickRival")}
          <select
            name="challengedId"
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="">{t("select")}</option>
            {rivals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
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
        <input type="hidden" name="metric" value="deals" />
        <GoldButton type="submit" className="sm:col-span-2">
          {t("sendChallenge")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
