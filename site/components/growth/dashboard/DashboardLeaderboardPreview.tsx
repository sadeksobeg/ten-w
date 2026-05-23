"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { IconStarFilled } from "@/components/growth/icons/GrowthIcons";

type Props = {
  weekly: DashboardData["leaderboard"];
  monthly: DashboardData["monthlyLeaderboard"];
  season: DashboardData["leaderboardSeason"];
  currentUserId: string;
};

function MedalIcon({ i }: { i: number }) {
  if (i > 2) return null;
  return (
    <IconStarFilled
      size={16}
      className={i === 0 ? "text-gold" : i === 1 ? "text-white/70" : "text-amber-700"}
      aria-hidden
    />
  );
}

export function DashboardLeaderboardPreview({ weekly, monthly, season, currentUserId }: Props) {
  const t = useTranslations("Growth.dashboard.leaderboard");
  const [tab, setTab] = useState<"week" | "month">("week");
  const rows = tab === "week" ? weekly : monthly;
  const weightsHint = t("weights", {
    deals: season.weightDeals,
    xp: season.weightXp,
    streak: season.weightStreak,
  });

  return (
    <div>
      <p className="text-xs text-white/50">{weightsHint}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === "week" ? "bg-gold/20 text-gold" : "text-white/50"}`}
        >
          {t("week")}
        </button>
        <button
          type="button"
          onClick={() => setTab("month")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === "month" ? "bg-gold/20 text-gold" : "text-white/50"}`}
        >
          {t("month")}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-white/50">—</p>
        ) : (
          rows.slice(0, 5).map((row, idx) => (
            <div
              key={row.userId}
              className={`growth-podium-row flex items-center justify-between rounded-xl border px-4 py-3 ${
                row.userId === currentUserId
                  ? "border-gold/35 bg-gold/10"
                  : "border-white/10 bg-black/20"
              } ${idx < 3 ? `growth-podium-${idx + 1}` : ""}`}
            >
              <div className="text-sm text-white/80">
                <span className="me-2 inline-flex w-4 justify-center">
                  <MedalIcon i={idx} />
                </span>
                <span className="text-white/40">#{idx + 1}</span> {row.name ?? "—"}
              </div>
              <div className="text-sm font-semibold text-gold/90">
                {row.score}{" "}
                <span className="text-[10px] text-white/40">
                  ({row.closedDeals} {t("dealsUnit")})
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <Link
        href="/growth/leaderboard"
        className="mt-4 inline-flex text-xs font-semibold text-gold hover:underline"
      >
        {t("viewAll")} →
      </Link>
    </div>
  );
}
