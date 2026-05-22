"use client";

import { useMemo, useState } from "react";
import { saveLeaderboardSeasonAction, adminSetLeaderboardBonusFormAction } from "@/lib/growth/actions";
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
  rows: CompositeLeaderboardRow[];
};

export function AdminLeaderboardClient({ locale, season, rows }: Props) {
  const [deals, setDeals] = useState(season.weightDeals);
  const [xp, setXp] = useState(season.weightXp);
  const [streak, setStreak] = useState(season.weightStreak);
  const windowDays = Math.round(season.windowMs / (24 * 60 * 60 * 1000));
  const ar = locale === "ar";

  const ranked = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.score - a.score)
      .map((row, idx) => {
        const systemRank =
          [...rows]
            .sort((a, b) => b.systemScore - a.systemScore)
            .findIndex((r) => r.userId === row.userId) + 1;
        return { ...row, displayRank: idx + 1, systemRank };
      });
  }, [rows]);

  return (
    <div className="space-y-6">
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
              <label className="text-xs text-white/55">XP — {xp}%</label>
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
          <h2 className="text-lg font-bold">{ar ? "معاينة Top 10" : "Top 10 preview"}</h2>
          <ul className="mt-4 space-y-2">
            {ranked.slice(0, 10).map((row) => (
              <li
                key={row.userId}
                className="flex justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
              >
                <span>
                  #{row.displayRank} {row.name ?? "—"}
                  <span className="ms-2 text-[10px] text-white/40">
                    ({ar ? "نظام" : "sys"} #{row.systemRank})
                  </span>
                </span>
                <span className="font-bold text-gold">{row.score}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="overflow-x-auto">
        <h2 className="text-lg font-bold">
          {ar ? "كل الشركاء — ترتيب العرض والنقاط" : "All partners — display order & points"}
        </h2>
        <p className="mt-1 text-xs text-white/50">
          {ar
            ? "النقاط المعروضة = ترتيب النظام + تعديلك اليدوي (−500 إلى +500). الترتيب يتحدّث فور الحفظ."
            : "Display score = system score + manual adjustment (−500 to +500)."}
        </p>
        <table className="mt-4 w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/45">
              <th className="py-2 pe-2">{ar ? "ترتيب العرض" : "Display"}</th>
              <th className="py-2 pe-2">{ar ? "ترتيب النظام" : "System"}</th>
              <th className="py-2 pe-2">{ar ? "الشريك" : "Partner"}</th>
              <th className="py-2 pe-2">{ar ? "نظام" : "System pts"}</th>
              <th className="py-2 pe-2">{ar ? "تعديل" : "Adjust"}</th>
              <th className="py-2 pe-2">{ar ? "المجموع" : "Total"}</th>
              <th className="py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => (
              <tr key={row.userId} className="border-b border-white/5">
                <td className="py-2 font-bold text-gold">#{row.displayRank}</td>
                <td className="py-2 text-white/50">#{row.systemRank}</td>
                <td className="py-2">{row.name ?? "—"}</td>
                <td className="py-2">{row.systemScore}</td>
                <td className="py-2">
                  <form
                    action={adminSetLeaderboardBonusFormAction}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="partnerId" value={row.userId} />
                    <input
                      name="scoreBonus"
                      type="number"
                      min={-500}
                      max={500}
                      defaultValue={row.scoreBonus}
                      className="w-20 rounded border border-white/10 bg-black/40 px-2 py-1 text-center text-xs"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold"
                    >
                      {ar ? "حفظ" : "Save"}
                    </button>
                  </form>
                </td>
                <td className="py-2 font-bold">{row.score}</td>
                <td className="py-2 text-white/40">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
