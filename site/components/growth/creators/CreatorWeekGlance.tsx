"use client";

import { useTranslations } from "next-intl";
import type { CreatorHubSection } from "./CreatorHubTypes";

type Props = {
  weekSubmissions: number;
  weekTarget: number;
  cupScore: number;
  cupTarget: number;
  referrals: number;
  activeBattles: number;
  rank: number | null;
  onNavigate: (s: CreatorHubSection) => void;
};

export function CreatorWeekGlance({
  weekSubmissions,
  weekTarget,
  cupScore,
  cupTarget,
  referrals,
  activeBattles,
  rank,
  onNavigate,
}: Props) {
  const t = useTranslations("Creators.hub.weekGlance");
  const postPct = Math.min(100, Math.round((weekSubmissions / weekTarget) * 100));
  const cupPct = Math.min(100, Math.round((cupScore / cupTarget) * 100));
  const day = new Date().toLocaleDateString(undefined, { weekday: "long" });

  return (
    <div className="creator-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("title")}</h3>
        <span className="text-[10px] text-white/40">{day}</span>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-[11px] text-white/55">
            <span>{t("posts", { n: weekSubmissions, target: weekTarget })}</span>
            <span>{postPct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[var(--creator-secondary)] transition-all" style={{ width: `${postPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-white/55">
            <span>{t("points", { n: cupScore, target: cupTarget })}</span>
            <span>{cupPct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[var(--creator-secondary)] transition-all" style={{ width: `${cupPct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onNavigate("kit")} className="rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-bold text-white/70">
          {t("chipReferrals", { n: referrals })}
        </button>
        <button type="button" onClick={() => onNavigate("battles")} className="rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-bold text-white/70">
          {t("chipBattles", { n: activeBattles })}
        </button>
        <button type="button" onClick={() => onNavigate("leaderboard")} className="rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-bold text-white/70">
          {t("chipRank", { rank: rank ?? "—" })}
        </button>
      </div>
    </div>
  );
}
