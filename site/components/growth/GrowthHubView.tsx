import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { DashboardHero } from "@/components/growth/dashboard/DashboardHero";
import { DashboardStatsGrid } from "@/components/growth/dashboard/DashboardStatsGrid";
import { DashboardMissions } from "@/components/growth/dashboard/DashboardMissions";
import { DashboardBadgesSection } from "@/components/growth/dashboard/DashboardBadgesSection";
import { DashboardLeaderboardPreview } from "@/components/growth/dashboard/DashboardLeaderboardPreview";
import { ActivityHeatmap } from "@/components/growth/dashboard/ActivityHeatmap";
import { GrowthMotivationBar } from "@/components/growth/GrowthMotivationBar";
import { PartnerInsightCarousel } from "@/components/growth/PartnerInsightCarousel";
import { GrowthCollapsibleSection } from "@/components/growth/ui/GrowthCollapsibleSection";
import { PartnerOnboardingChecklist } from "@/components/growth/PartnerOnboardingChecklist";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";

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
        levelOrder={data.profile.levelOrder}
        totalXp={data.profile.totalXp}
        currentLevelMinXp={data.currentLevelMinXp}
        nextLevelName={data.nextLevel?.name ?? null}
        nextLevelMinXp={data.nextLevel?.minXp ?? null}
      />

      <GrowthMotivationBar
        primary={data.compete.motivationPrimary}
        secondary={data.compete.motivationSecondary}
      />

      {data.insights.length > 0 ? <PartnerInsightCarousel slides={data.insights} /> : null}

      <PartnerOnboardingChecklist locale={locale} data={data} userId={userId} />

      <DashboardStatsGrid data={data} />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/growth/deals"
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
        >
          {t("hub.quickDeals")}
        </Link>
        <Link
          href="/growth/earnings"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 hover:border-gold/30"
        >
          {t("hub.quickEarnings")}
        </Link>
        <Link
          href="/growth/network"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 hover:border-gold/30"
        >
          {t("hub.quickNetwork")}
        </Link>
        <Link
          href="/growth/kit"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 hover:border-gold/30"
        >
          {t("hub.quickKit")}
        </Link>
      </div>

      <DashboardMissions missions={data.missions} />

      <GrowthCollapsibleSection title={t("badges.title")} defaultOpen>
        {await DashboardBadgesSection({ locale, badges: data.badges, userId, compact: true })}
      </GrowthCollapsibleSection>

      <ActivityHeatmap days={data.activityDays} memberDays={data.memberDays} />

      <GrowthCollapsibleSection title={t("leaderboard.title")}>
        <DashboardLeaderboardPreview
          weekly={data.leaderboard}
          monthly={data.monthlyLeaderboard}
          season={data.leaderboardSeason}
          currentUserId={userId}
        />
      </GrowthCollapsibleSection>

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
