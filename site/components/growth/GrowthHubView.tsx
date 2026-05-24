import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { DashboardHero } from "@/components/growth/dashboard/DashboardHero";
import { DailyCheckIn } from "@/components/growth/dashboard/DailyCheckIn";
import { SeasonPassCard } from "@/components/growth/seasons/SeasonPassCard";
import { DashboardStatsGrid } from "@/components/growth/dashboard/DashboardStatsGrid";
import { DashboardMissions } from "@/components/growth/dashboard/DashboardMissions";
import { DashboardBadgesSection } from "@/components/growth/dashboard/DashboardBadgesSection";
import { DashboardLeaderboardPreview } from "@/components/growth/dashboard/DashboardLeaderboardPreview";
import { ActivityHeatmap } from "@/components/growth/dashboard/ActivityHeatmap";
import { GrowthMotivationBar } from "@/components/growth/GrowthMotivationBar";
import { PartnerInsightCarousel } from "@/components/growth/PartnerInsightCarousel";
import { GrowthCollapsibleSection } from "@/components/growth/ui/GrowthCollapsibleSection";
import { PartnerOnboardingChecklist } from "@/components/growth/PartnerOnboardingChecklist";
import { HubSupportCard } from "@/components/growth/HubSupportCard";
import { LevelPerksCard } from "@/components/growth/LevelPerksCard";
import { GrowthHubDeferred } from "@/components/growth/dashboard/GrowthHubDeferred";
import { SkeletonStatGrid } from "@/components/growth/ui/GrowthSkeleton";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";
import { DnaCard } from "@/components/growth/dna/DnaCard";
import { RivalCard } from "@/components/growth/rivals/RivalCard";
import { OracleCard } from "@/components/growth/oracle/OracleCard";

type Props = {
  locale: string;
  data: DashboardData;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
};

export async function GrowthHubView({
  locale,
  data,
  userId,
  userName,
  userEmail,
  avatarUrl,
}: Props) {
  const t = await getTranslations("Growth");
  const powerLabel = getXpBrandLabel(locale);

  return (
    <div className="space-y-8">
      <DashboardHero
        locale={locale}
        name={userName}
        email={userEmail}
        avatarUrl={avatarUrl}
        levelName={data.profile.levelName}
        levelCode={data.profile.levelCode}
        levelOrder={data.profile.levelOrder}
        totalXp={data.profile.totalXp}
        currentLevelMinXp={data.currentLevelMinXp}
        nextLevelName={data.nextLevel?.name ?? null}
        nextLevelMinXp={data.nextLevel?.minXp ?? null}
      />

      <DnaCard
        partnerName={userName || userEmail}
        referralCode={data.profile.referralCode}
        dna={data.dnaProfile}
      />

      <DailyCheckIn available={data.checkIn.available} totalCheckIns={data.checkIn.totalCheckIns} />

      <OracleCard oracle={data.oracle} />

      <SeasonPassCard
        seasonName={data.leaderboardSeason.name}
        weightDeals={data.leaderboardSeason.weightDeals}
        weightXp={data.leaderboardSeason.weightXp}
        weightStreak={data.leaderboardSeason.weightStreak}
        weeklyRank={data.compete.weeklyRank}
      />

      <div className="-mx-1 overflow-x-auto px-1 pb-1 md:overflow-visible">
        <DashboardStatsGrid data={data} />
      </div>

      <GrowthHubDeferred fallback={<SkeletonStatGrid count={4} />}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <PartnerOnboardingChecklist locale={locale} data={data} userId={userId} />
          <DashboardMissions missions={data.missions} />
          {data.insights.length > 0 ? <PartnerInsightCarousel slides={data.insights} /> : null}
          <GrowthCollapsibleSection title={t("activity.title")} defaultOpen={false}>
            <ActivityHeatmap days={data.activityDays} memberDays={data.memberDays} />
          </GrowthCollapsibleSection>
        </div>

        <div className="space-y-6">
          {data.rivalData ? <RivalCard rivalData={data.rivalData} /> : null}
          <LevelPerksCard current={data.currentLevelDetail} next={data.nextLevelDetail} />
          <GrowthMotivationBar
            primary={data.compete.motivationPrimary}
            secondary={data.compete.motivationSecondary}
          />
          <GrowthCollapsibleSection title={t("badges.title")} defaultOpen>
            {await DashboardBadgesSection({ locale, badges: data.badges, userId, compact: true })}
          </GrowthCollapsibleSection>
          <GrowthCollapsibleSection title={t("leaderboard.title")}>
            <DashboardLeaderboardPreview
              weekly={data.leaderboard}
              monthly={data.monthlyLeaderboard}
              season={data.leaderboardSeason}
              currentUserId={userId}
            />
          </GrowthCollapsibleSection>
        </div>
      </div>
      </GrowthHubDeferred>

      <HubSupportCard />

      {!data.inHallOfLegends ? (
        <Link
          href="/growth/legends"
          className="block rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/10 to-transparent px-4 py-3 text-center text-sm font-semibold text-gold hover:bg-gold/15"
        >
          {t("legends.motivational")}
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/growth/deals"
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20 focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("hub.quickDeals")}
        </Link>
        <Link
          href="/growth/earnings"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("hub.quickEarnings")}
        </Link>
        <Link
          href="/growth/network"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("hub.quickNetwork")}
        </Link>
        <Link
          href="/growth/kit"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("hub.quickKit")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-white/70">
        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 font-semibold text-purple-100">
          {t("powerPointsLine", { n: data.profile.totalXp, label: powerLabel })}
        </span>
        {data.nextLevel ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/70">
            {t("nextLevel", { name: data.nextLevel.name, n: data.nextLevel.minClosedDeals })}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/70">
            {t("maxLevel")}
          </span>
        )}
      </div>
    </div>
  );
}
