"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorBattlesPanel } from "@/components/growth/creators/CreatorBattlesPanel";

type Candidate = {
  userId: string;
  name: string;
  levelCode: string;
  initials: string;
};

export type CreatorBattleHistoryItem = {
  id: string;
  opponentName: string;
  outcome: "won" | "lost" | "pending";
  endedAt: string | null;
};

type Props = {
  candidates: Candidate[];
  history?: CreatorBattleHistoryItem[];
};

export function CreatorLoungeBattles({ candidates, history = [] }: Props) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <div className="space-y-4">
      <CreatorBattlesPanel candidates={candidates} />

      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("battlesHistory")}
        </h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">{t("battlesHistoryEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-white">{item.opponentName}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.outcome === "won"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : item.outcome === "lost"
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-gold/15 text-gold"
                  }`}
                >
                  {t(`battleOutcome.${item.outcome}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
