import { getTranslations } from "next-intl/server";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { LeaderboardPodium } from "@/components/growth/leaderboard/LeaderboardPodium";
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
            className={`rounded-full border px-5 py-2.5 text-xs font-bold transition ${
              tab === key
                ? "border-gold/50 bg-gradient-to-r from-gold/25 to-gold/10 text-gold shadow-[0_0_24px_-8px_rgba(228,184,77,0.6)]"
                : "border-white/10 text-white/60 hover:border-gold/30 hover:text-white"
            }`}
          >
            {t(`tabs.${key}`)}
          </a>
        ))}
      </div>
      <LeaderboardPodium locale={locale} rows={rows} viewerUserId={userId} />
    </div>
  );
}
