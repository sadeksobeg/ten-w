"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconTrophy, IconMedalGold, IconInfo } from "@/components/growth/icons/GrowthIcons";
import { CreatorCupPanel } from "./CreatorCupPanel";
import type { CreatorCupRow } from "@/lib/growth/creator-arena";

type Props = {
  rows: CreatorCupRow[];
  myUserId: string;
  seasonLabel?: string;
};

export function CreatorLeaderboardSection({ rows, myUserId, seasonLabel }: Props) {
  const t = useTranslations("Creators.leaderboard");
  const [showRules, setShowRules] = useState(false);
  const myRow = rows.find((r) => r.userId === myUserId);
  const nextRow = myRow && myRow.rank > 1 ? rows.find((r) => r.rank === myRow.rank - 1) : null;
  const gap = nextRow && myRow ? nextRow.score - myRow.score : 0;

  return (
    <div className="space-y-4">
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("season", { label: seasonLabel ?? "1" })}</h2>
        <p className="mt-1 text-xs text-white/55">{t("competing", { n: rows.length })}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[1, 2, 3].map((rank) => (
            <div key={rank} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs">
              <IconMedalGold size={16} className="text-[var(--creator-secondary)]" />
              #{rank}
            </div>
          ))}
        </div>
      </GlassCard>

      {myRow ? (
        <GlassCard className="creator-active-border p-5">
          <div className="flex items-center gap-4">
            <IconTrophy size={32} className="text-[var(--creator-secondary)]" />
            <div>
              <p className="text-[10px] uppercase text-white/45">{t("yourRank")}</p>
              <p className="creator-metric">#{myRow.rank}</p>
              <p className="text-xs text-white/55">{t("yourPoints", { score: myRow.score, posts: myRow.submissions })}</p>
              {gap > 0 ? <p className="text-[11px] text-rose-200">{t("gapToNext", { n: gap })}</p> : null}
            </div>
          </div>
        </GlassCard>
      ) : null}

      <CreatorCupPanel rows={rows.slice(0, 20)} myUserId={myUserId} />

      <button type="button" className="flex w-full items-center gap-2 text-xs font-semibold text-white/60" onClick={() => setShowRules((v) => !v)}>
        <IconInfo size={14} />
        {t("howPoints")}
      </button>
      {showRules ? (
        <GlassCard className="creator-card p-4 text-xs text-white/65">
          <table className="w-full">
            <tbody>
              {["approved", "battle", "featured", "first", "referral"].map((k) => (
                <tr key={k} className="border-b border-white/5">
                  <td className="py-2">{t(`rule.${k}.label`)}</td>
                  <td className="py-2 text-end font-bold text-[var(--creator-secondary)]">{t(`rule.${k}.pts`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : null}
    </div>
  );
}
