"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { CreatorBattlesPanel } from "./CreatorBattlesPanel";
import { challengeCreatorBattleAction } from "@/lib/growth/creator-arena-actions";
import { acceptBattleAction, declineBattleAction } from "@/lib/growth/engagement-actions";
import type { CreatorBattleHistoryItem } from "./CreatorHubTypes";

type ActiveBattle = {
  id: string;
  challengerId: string;
  challengedId: string;
  status: string;
  challengerProgress: number;
  challengedProgress: number;
  target: number;
  stakesXp: number;
  endsAt: string | null;
  challengerName: string;
  challengedName: string;
};

type PendingInvite = {
  id: string;
  challengerName: string;
  stakesXp: number;
  target: number;
};

type Props = {
  myUserId: string;
  candidates: Array<{ userId: string; name: string; levelCode: string; initials: string }>;
  history: CreatorBattleHistoryItem[];
  activeBattle: ActiveBattle | null;
  pendingInvites: PendingInvite[];
};

export function CreatorBattlesSection({
  myUserId,
  candidates,
  history,
  activeBattle,
  pendingInvites,
}: Props) {
  const t = useTranslations("Creators.battles");
  const [, formAction, pending] = useActionState(challengeCreatorBattleAction, undefined);

  return (
    <div className="space-y-4">
      {activeBattle ? (
        <GlassCard className="creator-card creator-glow-gold p-5">
          <p className="text-[10px] font-bold uppercase text-[var(--creator-secondary)]">{t("active")}</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-center">
              <GrowthAvatar name={activeBattle.challengerId === myUserId ? "You" : activeBattle.challengerName} email={activeBattle.challengerId} size="md" />
              <p className="mt-1 text-xs font-bold text-white">{activeBattle.challengerId === myUserId ? t("you") : activeBattle.challengerName}</p>
              <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[var(--creator-secondary)]" style={{ width: `${Math.min(100, (activeBattle.challengerProgress / activeBattle.target) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-white/45">{activeBattle.challengerProgress}/{activeBattle.target}</p>
            </div>
            <span className="font-black text-rose-300">VS</span>
            <div className="text-center">
              <GrowthAvatar name={activeBattle.challengedId === myUserId ? "You" : activeBattle.challengedName} email={activeBattle.challengedId} size="md" />
              <p className="mt-1 text-xs font-bold text-white">{activeBattle.challengedId === myUserId ? t("you") : activeBattle.challengedName}</p>
              <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[var(--creator-primary)]" style={{ width: `${Math.min(100, (activeBattle.challengedProgress / activeBattle.target) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-white/45">{activeBattle.challengedProgress}/{activeBattle.target}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/55">{t("stakes", { xp: activeBattle.stakesXp })}</p>
        </GlassCard>
      ) : null}

      {pendingInvites.map((inv) => (
        <GlassCard key={inv.id} className="creator-card border-amber-500/30 p-4">
          <p className="text-sm font-bold text-white">{t("invite", { name: inv.challengerName })}</p>
          <p className="text-xs text-white/55">{t("stakes", { xp: inv.stakesXp })}</p>
          <div className="mt-3 flex gap-2">
            <GoldButton type="button" className="text-xs" onClick={() => void acceptBattleAction(inv.id)}>{t("accept")}</GoldButton>
            <button type="button" className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white/70" onClick={() => void declineBattleAction(inv.id)}>{t("decline")}</button>
          </div>
        </GlassCard>
      ))}

      <CreatorBattlesPanel candidates={candidates} />

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("history")}</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">{t("historyEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                <span className="text-sm text-white">{item.opponentName}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.outcome === "won" ? "bg-emerald-500/15 text-emerald-300" : item.outcome === "lost" ? "bg-rose-500/15 text-rose-300" : "bg-gold/15 text-gold"}`}>
                  {t(`outcome.${item.outcome}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
