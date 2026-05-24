"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { RivalData } from "@/lib/growth/rival";
import { IconRival } from "@/components/growth/icons/GrowthIcons";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = { rivalData: RivalData };

function barWidth(closed: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((closed / max) * 100));
}

export function RivalCard({ rivalData }: Props) {
  const t = useTranslations("Growth.rival");
  const { rival, myStats, gap, iAmAhead } = rivalData;
  const maxDeals = Math.max(myStats.closedDealsThisWeek, rival.closedDealsThisWeek, 1);

  let messageKey = "ahead_by";
  if (gap === 0) messageKey = "tied";
  else if (!iAmAhead && gap === 1) messageKey = "gap_1";
  else if (!iAmAhead && gap >= 5) messageKey = "gap_many";
  else if (iAmAhead) messageKey = "behind_by";
  else messageKey = "ahead_by";

  return (
    <GlassCard className="border border-rose-500/20 bg-gradient-to-br from-rose-950/40 to-black/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <IconRival className="text-rose-400" size={22} />
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("title")}
        </h3>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex size-12 items-center justify-center rounded-full bg-gold/20 text-sm font-black text-gold ring-2 ring-gold/50">
            {t("you")}
          </div>
          <p className="text-[11px] font-bold text-white/80">{t("you")}</p>
          <p className="text-[10px] text-white/45">#{myStats.rank}</p>
        </div>

        <div className="flex size-11 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-gold text-[10px] font-black text-white motion-reduce:animate-none">
          VS
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white ring-2 ring-white/20">
            {rival.initials}
          </div>
          <p className="max-w-[100px] truncate text-[11px] font-bold text-white/80">{rival.name}</p>
          <p className="text-[10px] text-white/45">#{rivalData.rivalRank}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-[11px]">
        <div>
          <div className="mb-0.5 flex justify-between text-white/60">
            <span>{t("you")}</span>
            <span>{myStats.closedDealsThisWeek}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
              style={{ width: `${barWidth(myStats.closedDealsThisWeek, maxDeals)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-0.5 flex justify-between text-white/60">
            <span>{rival.name}</span>
            <span>{rival.closedDealsThisWeek}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-300"
              style={{ width: `${barWidth(rival.closedDealsThisWeek, maxDeals)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-white/75">
        {t(messageKey, { n: gap, name: rival.name })}
      </p>

      {rival.publicSlug ? (
        <Link
          href={`/growth/profile/${rival.publicSlug}`}
          className="mt-3 block text-center text-[11px] font-bold text-sky-300 hover:underline"
        >
          {t("viewProfile")}
        </Link>
      ) : null}
    </GlassCard>
  );
}
