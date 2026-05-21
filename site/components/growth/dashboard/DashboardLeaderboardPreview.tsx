"use client";

import { useState } from "react";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  weekly: DashboardData["leaderboard"];
  monthly: DashboardData["monthlyLeaderboard"];
  season: DashboardData["leaderboardSeason"];
  currentUserId: string;
};

function medal(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "";
}

export function DashboardLeaderboardPreview({
  locale,
  weekly,
  monthly,
  season,
  currentUserId,
}: Props) {
  const [tab, setTab] = useState<"week" | "month">("week");
  const rows = tab === "week" ? weekly : monthly;
  const title =
    locale === "ar" ? "أفضل الشركاء" : locale === "fr" ? "Meilleurs partenaires" : "Top partners";
  const weightsHint =
    locale === "ar"
      ? `نقاط مركّبة: صفقات ${season.weightDeals}% · XP ${season.weightXp}% · سلسلة ${season.weightStreak}%`
      : `Composite: deals ${season.weightDeals}% · XP ${season.weightXp}% · streak ${season.weightStreak}%`;

  return (
    <section>
      <SectionHeader title={title} subtitle={weightsHint} />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === "week" ? "bg-gold/20 text-gold" : "text-white/50"}`}
        >
          {locale === "ar" ? "أسبوع" : locale === "fr" ? "Semaine" : "Week"}
        </button>
        <button
          type="button"
          onClick={() => setTab("month")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === "month" ? "bg-gold/20 text-gold" : "text-white/50"}`}
        >
          {locale === "ar" ? "شهر" : locale === "fr" ? "Mois" : "Month"}
        </button>
      </div>
      <GlassCard className="mt-4 divide-y divide-white/10 p-0">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--growth-text-sub)]">
            {locale === "ar" ? "لا يوجد نشاط بعد في هذه الفترة" : "No activity in this window yet"}
          </p>
        ) : (
          <ul>
            {rows.map((row, i) => {
              const highlight = row.userId === currentUserId;
              return (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${highlight ? "bg-gold/10" : ""}`}
                >
                  <span className="w-8 shrink-0 text-center font-bold text-gold">
                    {medal(i) || `#${i + 1}`}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {row.name ?? "—"}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-[var(--growth-gold-bright)]">
                    {row.score}
                  </span>
                  <span className="hidden shrink-0 text-[10px] text-[var(--growth-text-sub)] sm:inline">
                    {row.closedDeals}{" "}
                    {locale === "ar" ? "صفقة" : "deals"} · {row.totalXp} XP
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </section>
  );
}
