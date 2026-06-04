"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import type { BattleView } from "@/lib/growth/battles";
import { acceptBattleAction, declineBattleAction } from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  battle: BattleView;
  myUserId: string;
};

export function BattleCard({ battle, myUserId }: Props) {
  const t = useTranslations("Growth.battles");
  const [pending, start] = useTransition();
  const opponent = battle.isChallenger ? battle.challenged : battle.challenger;
  const myProgress = battle.isChallenger ? battle.challengerProgress : battle.challengedProgress;
  const theirProgress = battle.isChallenger ? battle.challengedProgress : battle.challengerProgress;
  const isChallenged = battle.challenged.id === myUserId;

  return (
    <GlassCard className="p-5">
      {battle.status === "PENDING" && isChallenged ? (
        <>
          <h3 className="font-bold text-rose-300">{t("incoming")}</h3>
          <p className="mt-2 text-sm text-white/80">{opponent.name}</p>
          <p className="mt-1 text-xs text-white/55">
            {t("challengeDesc", { target: battle.target, metric: battle.metric, stakes: battle.stakesXp })}
          </p>
          <div className="mt-4 flex gap-2">
            <GoldButton
              type="button"
              disabled={pending}
              onClick={() => start(() => void acceptBattleAction(battle.id))}
            >
              {t("accept")}
            </GoldButton>
            <GoldButton
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => start(() => void declineBattleAction(battle.id))}
            >
              {t("decline")}
            </GoldButton>
          </div>
        </>
      ) : battle.status === "ACTIVE" ? (
        <>
          <h3 className="font-bold text-gold">{t("active")}</h3>
          <p className="text-sm text-white/70">{opponent.name}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div>
              <span>{t("you")}</span>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${Math.min(100, (myProgress / battle.target) * 100)}%` }}
                />
              </div>
              <span>
                {myProgress}/{battle.target}
              </span>
            </div>
            <div>
              <span>{opponent.name}</span>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-rose-500/70"
                  style={{ width: `${Math.min(100, (theirProgress / battle.target) * 100)}%` }}
                />
              </div>
              <span>
                {theirProgress}/{battle.target}
              </span>
            </div>
          </div>
          {battle.endsAt ? (
            <p className="mt-3 text-xs text-white/50">
              {t("ends", {
                date: battle.endsAt.toLocaleString(),
              })}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-white/60">
          {battle.winnerId === myUserId ? t("won") : battle.winnerId ? t("lost") : battle.status}
        </p>
      )}
    </GlassCard>
  );
}
