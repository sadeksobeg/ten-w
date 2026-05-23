import { getTranslations } from "next-intl/server";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import {
  MONTH_MS,
  WEEK_MS,
  compositeLeaderboard,
  getActiveLeaderboardSeason,
} from "@/lib/growth/leaderboard";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function GrowthLeaderboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const tab = sp.tab === "month" || sp.tab === "season" ? sp.tab : "week";
  const t = await getTranslations("Growth.leaderboardPage");
  const session = await auth();
  const userId = session?.user?.id ?? "";

  await requirePartnerDashboard(locale);

  const season = await getActiveLeaderboardSeason();
  const weights = {
    weightDeals: season.weightDeals,
    weightXp: season.weightXp,
    weightStreak: season.weightStreak,
  };
  const windowMs = tab === "month" ? MONTH_MS : tab === "season" ? season.windowMs : WEEK_MS;
  const rows = await compositeLeaderboard(windowMs, weights, 50);

  return (
    <div className="space-y-6">
      <GrowthPageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="flex flex-wrap gap-2">
        {(["week", "month", "season"] as const).map((key) => (
          <a
            key={key}
            href={`?tab=${key}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              tab === key
                ? "bg-gold/20 text-gold"
                : "border border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {t(`tabs.${key}`)}
          </a>
        ))}
      </div>
      <GlassCard className="overflow-hidden p-0">
        <ol className="divide-y divide-white/10">
          {rows.map((row, i) => {
            const isMe = row.userId === userId;
            return (
              <li
                key={row.userId}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                  isMe ? "bg-gold/10" : ""
                }`}
              >
                <span className="font-bold text-gold/90">#{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {row.name ?? t("anonymous")}
                  {isMe ? ` (${t("you")})` : ""}
                </span>
                <span className="text-xs text-white/55">{Math.round(row.score)}</span>
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </div>
  );
}
