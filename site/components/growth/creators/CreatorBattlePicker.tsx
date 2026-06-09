"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorNameWithConsentBadge } from "./CreatorConsentVerifiedBadge";
import { challengeCreatorBattleAction } from "@/lib/growth/creator-arena-actions";
import { useActionState } from "react";

export type BattleCandidate = {
  userId: string;
  name: string;
  levelCode: string;
  initials: string;
  avatarUrl?: string | null;
  consentGiven?: boolean;
};

type Props = {
  candidates: BattleCandidate[];
};

export function CreatorBattlePicker({ candidates }: Props) {
  const t = useTranslations("Growth.creators");
  const tConsent = useTranslations("Creators.consent");
  const [selectedId, setSelectedId] = useState(candidates[0]?.userId ?? "");
  const [state, formAction, pending] = useActionState(challengeCreatorBattleAction, undefined);

  if (candidates.length === 0) return null;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="challengedId" value={selectedId} />
      <input type="hidden" name="metric" value="creator_posts" />
      <input type="hidden" name="target" value="1" />
      <input type="hidden" name="stakesXp" value="500" />

      <p className="text-xs text-white/55">{t("battlesPick")}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {candidates.map((c) => {
          const active = selectedId === c.userId;
          return (
            <li key={c.userId}>
              <button
                type="button"
                onClick={() => setSelectedId(c.userId)}
                className={`creator-battle-pick flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-start transition ${
                  active
                    ? "creator-battle-pick-active border-[var(--creator-secondary)]/50 bg-gradient-to-br from-amber-500/15 to-rose-500/10 shadow-[0_0_20px_rgba(245,196,81,0.12)]"
                    : "border-white/10 bg-black/25 hover:border-white/20"
                }`}
              >
                <GrowthAvatar
                  name={c.name}
                  email={c.userId}
                  avatarUrl={c.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <CreatorNameWithConsentBadge
                    name={c.name}
                    verified={Boolean(c.consentGiven)}
                    label={tConsent("verifiedBadge")}
                    nameClassName="truncate text-sm font-bold text-white"
                    badgeSize="sm"
                  />
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/45">{c.levelCode}</p>
                </div>
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-[var(--creator-secondary)] bg-[var(--creator-secondary)]/25" : "border-white/25"
                  }`}
                  aria-hidden
                >
                  {active ? <span className="size-2 rounded-full bg-[var(--creator-secondary)]" /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {state && !state.ok ? <p className="text-xs text-rose-300">{t("battlesError")}</p> : null}
      <GoldButton type="submit" disabled={pending || !selectedId} className="w-full sm:w-auto">
        {pending ? "…" : t("battlesSend")}
      </GoldButton>
    </form>
  );
}
