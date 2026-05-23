import { getTranslations } from "next-intl/server";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { AnimatedNumber } from "@/components/growth/ui/AnimatedNumber";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { CompositeLeaderboardRow } from "@/lib/growth/leaderboard";

type Props = {
  locale: string;
  rows: CompositeLeaderboardRow[];
  viewerUserId: string;
};

const PODIUM_ORDER = [1, 0, 2] as const;

export async function LeaderboardPodium({ rows, viewerUserId }: Props) {
  const t = await getTranslations("Growth.leaderboardPage");
  const top = rows.slice(0, 3);
  if (top.length === 0) return null;

  const podiumHeights = ["h-28", "h-36", "h-24"];
  const podiumClasses = ["growth-podium-2", "growth-podium-1", "growth-podium-3"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
        {PODIUM_ORDER.map((idx, displayIdx) => {
          const row = top[idx];
          if (!row) {
            return <div key={`empty-${idx}`} className="min-h-[180px]" />;
          }
          const rank = idx + 1;
          const isMe = row.userId === viewerUserId;
          return (
            <div
              key={row.userId}
              className={`flex flex-col items-center text-center ${podiumClasses[displayIdx]}`}
            >
              <div className="relative mb-2">
                <GrowthAvatar
                  name={row.name ?? t("anonymous")}
                  email={row.userId}
                  size="md"
                  className={rank === 1 ? "!size-16 !text-lg" : "!size-14"}
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-bg">
                  #{rank}
                </span>
              </div>
              <p className="max-w-full truncate text-xs font-bold text-white sm:text-sm">
                {row.name ?? t("anonymous")}
                {isMe ? ` (${t("you")})` : ""}
              </p>
              <p className="mt-1 text-lg font-extrabold text-gold">
                <AnimatedNumber value={Math.round(row.score)} />
              </p>
              <div
                className={`mt-3 w-full rounded-t-2xl bg-gradient-to-t from-gold/25 to-gold/5 ${podiumHeights[displayIdx]} flex items-end justify-center pb-2`}
              >
                <span className="text-[10px] text-white/50">
                  {row.closedDeals} {t("deals")} · {row.totalXp} {t("xp")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length > 3 ? (
        <GlassCard className="overflow-hidden p-0">
          <ol className="divide-y divide-white/10">
            {rows.slice(3).map((row, i) => {
              const rank = i + 4;
              const isMe = row.userId === viewerUserId;
              return (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${isMe ? "bg-gold/10" : ""}`}
                >
                  <span className="w-8 shrink-0 font-bold text-gold/80">#{rank}</span>
                  <GrowthAvatar name={row.name ?? "?"} email={row.userId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {row.name ?? t("anonymous")}
                      {isMe ? ` (${t("you")})` : ""}
                    </p>
                    <p className="text-[10px] text-white/45">
                      {row.closedDeals} {t("deals")} · {row.totalXp} {t("xp")} · {row.streak}{" "}
                      {t("streak")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-gold">
                    {Math.round(row.score)}
                  </span>
                </li>
              );
            })}
          </ol>
        </GlassCard>
      ) : null}
    </div>
  );
}
