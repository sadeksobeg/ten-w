import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  leaderboard: DashboardData["leaderboard"];
  currentUserId: string;
};

export function DashboardLeaderboardPreview({ locale, leaderboard, currentUserId }: Props) {
  const top = leaderboard.slice(0, 5);
  const title = locale === "ar" ? "أفضل الشركاء هذا الأسبوع" : "Top partners this week";

  return (
    <section>
      <SectionHeader title={title} />
      <GlassCard className="mt-4 divide-y divide-white/10 p-0">
        <ul>
          {top.map((row, i) => {
            const highlight = row.userId === currentUserId;
            return (
              <li
                key={row.userId}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                  highlight ? "bg-gold/10" : ""
                }`}
              >
                <span className="font-bold text-gold">#{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {row.name ?? row.userId.slice(0, 8)}
                </span>
                <span className="text-xs text-[var(--growth-text-sub)]">
                  {row.closedDeals} {locale === "ar" ? "صفقة" : "deals"}
                </span>
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </section>
  );
}
