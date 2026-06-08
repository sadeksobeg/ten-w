"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { challengeCreatorBattleAction } from "@/lib/growth/creator-arena-actions";

type Candidate = {
  userId: string;
  name: string;
  levelCode: string;
  initials: string;
};

type Props = {
  candidates: Candidate[];
};

export function CreatorBattlesPanel({ candidates }: Props) {
  const t = useTranslations("Growth.creators");
  const [state, formAction, pending] = useActionState(challengeCreatorBattleAction, undefined);

  if (candidates.length === 0) return null;

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("battlesTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("battlesSubtitle")}</p>

      <form action={formAction} className="mt-4 space-y-3">
        <label className="block text-xs text-white/60">
          {t("battlesPick")}
          <select
            name="challengedId"
            required
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
          >
            <option value="">{t("battlesSelect")}</option>
            {candidates.map((c) => (
              <option key={c.userId} value={c.userId}>
                {c.name} · {c.levelCode}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="metric" value="creator_posts" />
        <input type="hidden" name="target" value="1" />
        <input type="hidden" name="stakesXp" value="500" />
        {state && !state.ok ? (
          <p className="text-xs text-rose-300">{t("battlesError")}</p>
        ) : null}
        <GoldButton type="submit" disabled={pending}>
          {t("battlesSend")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
