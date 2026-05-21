"use client";

import { useState } from "react";
import { saveLeaderboardSeasonAction } from "@/lib/growth/actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { CompositeLeaderboardRow } from "@/lib/growth/leaderboard";

type Props = {
  locale: string;
  season: {
    name: string;
    windowMs: number;
    weightDeals: number;
    weightXp: number;
    weightStreak: number;
  };
  preview: CompositeLeaderboardRow[];
};

export function AdminLeaderboardClient({ locale, season, preview }: Props) {
  const [deals, setDeals] = useState(season.weightDeals);
  const [xp, setXp] = useState(season.weightXp);
  const [streak, setStreak] = useState(season.weightStreak);
  const windowDays = Math.round(season.windowMs / (24 * 60 * 60 * 1000));

  const ar = locale === "ar";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GlassCard>
        <h2 className="text-lg font-bold">{ar ? "أوزان الترتيب المركّب" : "Composite weights"}</h2>
        <form action={saveLeaderboardSeasonAction} className="mt-4 space-y-4">
          <label className="block text-xs text-white/55">
            {ar ? "اسم الموسم" : "Season name"}
            <input
              name="name"
              defaultValue={season.name}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-white/55">
            {ar ? "نافذة (أيام)" : "Window (days)"}
            <input
              name="windowDays"
              type="number"
              min={1}
              max={90}
              defaultValue={windowDays}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </label>
          <div>
            <label className="text-xs text-white/55">
              {ar ? "صفقات مغلقة" : "Closed deals"} — {deals}%
            </label>
            <input
              name="weightDeals"
              type="range"
              min={0}
              max={100}
              value={deals}
              onChange={(e) => setDeals(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/55">
              XP — {xp}%
            </label>
            <input
              name="weightXp"
              type="range"
              min={0}
              max={100}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/55">
              {ar ? "سلسلة نشاط" : "Streak"} — {streak}%
            </label>
            <input
              name="weightStreak"
              type="range"
              min={0}
              max={100}
              value={streak}
              onChange={(e) => setStreak(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <GoldButton type="submit">{ar ? "حفظ وتفعيل" : "Save & activate"}</GoldButton>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-bold">{ar ? "معاينة Top 10" : "Live preview"}</h2>
        <ul className="mt-4 space-y-2">
          {preview.map((row, i) => (
            <li
              key={row.userId}
              className="flex justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
            >
              <span>
                #{i + 1} {row.name ?? "—"}
              </span>
              <span className="font-bold text-gold">{row.score}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
