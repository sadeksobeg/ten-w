import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumEarningsCents } from "@/lib/growth/commission";
import {
  MONTH_MS,
  WEEK_MS,
  compositeLeaderboard,
  getActiveLeaderboardSeason,
  monthlyLeaderboard,
  partnerCompositeRank,
  partnerLifetimePercentileBetter,
  partnerRankDelta,
  partnerRankInWindow,
  type CompositeLeaderboardRow,
} from "@/lib/growth/leaderboard";
import { getActivityDays } from "@/lib/growth/streak";
import { missionTargetFromCriteria, utcDayKey } from "@/lib/growth/missions";
import {
  fetchActivityEventsSafe,
  fetchMissionDefinitionsSafe,
  fetchUserMissionDaySafe,
} from "@/lib/growth/prisma-optional";
import { buildDealJourney, type DealJourneyStep } from "@/lib/growth/deal-journey";
import { buildPartnerInsightSlides, type PartnerInsightSlide } from "@/lib/growth/partner-insights";
import { ensurePartnerProfile } from "@/lib/growth/ensure-partner-profile";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { resolveMissionTitle } from "@/lib/growth/mission-i18n";
import { resolveLevelName } from "@/lib/growth/level-i18n";

export type DashboardDeal = {
  id: string;
  status: DealStatus;
  clientLabel: string | null;
  productName: string;
  createdAt: Date;
  closedAt: Date | null;
  lostAt: Date | null;
  journey: { steps: DealJourneyStep[] };
};

export type DashboardNetworkRow = {
  userId: string;
  name: string | null;
  email: string;
  referralCode: string;
};

export type DashboardLedgerRow = {
  id: string;
  amountCents: number;
  tier: number;
  createdAt: Date;
  dealId: string | null;
};

export type DashboardBadge = {
  key: string;
  name: string;
  category: string;
  hidden: boolean;
  description?: string | null;
  howTo?: string;
  earned: boolean;
  grantedAt?: string | null;
};

export type DashboardMission = {
  key: string;
  title: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
};

export type DashboardActivity = {
  id: string;
  headline: string;
  amountCents: number | null;
  createdAt: string;
};

export type DashboardProductKit = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  commissionBaseCents: number;
  marketingKit: unknown;
};

export type MotivationLine = {
  key: string;
  params?: Record<string, number | string>;
};

export type DashboardData = {
  profile: {
    referralCode: string;
    totalXp: number;
    levelName: string;
    levelOrder: number;
    onboardingSteps?: Record<string, boolean> | null;
  };
  closedDeals: number;
  pendingDeals: number;
  lostDeals: number;
  nextLevel: { name: string; minClosedDeals: number; minXp: number } | null;
  currentLevelMinXp: number;
  progress: { current: number; target: number };
  earningsCents: number;
  earningsThisMonthCents: number;
  rankDelta: number;
  deals: DashboardDeal[];
  network: DashboardNetworkRow[];
  ledger: DashboardLedgerRow[];
  products: DashboardProductKit[];
  badges: DashboardBadge[];
  missions: DashboardMission[];
  activityFeed: DashboardActivity[];
  leaderboard: CompositeLeaderboardRow[];
  monthlyLeaderboard: CompositeLeaderboardRow[];
  leaderboardSeason: { name: string; weightDeals: number; weightXp: number; weightStreak: number };
  activityDays: string[];
  memberDays: number;
  monthlyRank: { closedInWindow: number; rank: number | null; fieldSize: number };
  streak: { current: number; longest: number } | null;
  compete: {
    weeklyRank: number | null;
    weeklyClosed: number;
    weeklyFieldSize: number;
    compositeScore: number;
    percentileBetter: number;
    motivationPrimary: MotivationLine;
    motivationSecondary: MotivationLine | null;
  };
  insights: PartnerInsightSlide[];
};

export async function getPartnerDashboard(
  userId: string,
  locale = "ar",
): Promise<DashboardData> {
  const profile = await ensurePartnerProfile(userId);
  if (!profile) {
    throw new Error("not_a_partner");
  }

  const day = utcDayKey();

  const [
    closedDeals,
    pendingDeals,
    lostDeals,
    deals,
    networkProfiles,
    ledger,
    products,
    userBadges,
    allBadgeDefs,
    streak,
    userCreated,
    missionDefs,
    missionDays,
    activityRows,
    monthEarnings,
  ] = await Promise.all([
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.CLOSED } }),
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.PENDING } }),
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.LOST } }),
      prisma.deal.findMany({
        where: { partnerId: userId },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          product: { select: { name: true } },
          _count: { select: { ledger: true } },
        },
      }),
      prisma.partnerProfile.findMany({
        where: { parentUserId: userId },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.commissionLedger.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.product.findMany({
        where: { active: true },
        orderBy: { slug: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          priceCents: true,
          commissionBaseCents: true,
          marketingKit: true,
        },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: {
            select: {
              key: true,
              name: true,
              category: true,
              hidden: true,
              description: true,
            },
          },
        },
      }),
      prisma.badgeDefinition.findMany({
        where: { hidden: false },
        orderBy: { key: "asc" },
        select: { key: true, name: true, description: true, hidden: true, category: true },
      }),
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
      fetchMissionDefinitionsSafe(prisma),
      fetchUserMissionDaySafe(prisma, userId, day),
      fetchActivityEventsSafe(prisma, 20),
      (() => {
        const start = new Date();
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        return prisma.commissionLedger.aggregate({
          where: { userId, createdAt: { gte: start } },
          _sum: { amountCents: true },
        });
      })(),
    ]);

  const earningsCents = await sumEarningsCents(userId);
  const earningsThisMonthCents = monthEarnings._sum.amountCents ?? 0;

  const season = await getActiveLeaderboardSeason();
  const weights = {
    weightDeals: season.weightDeals,
    weightXp: season.weightXp,
    weightStreak: season.weightStreak,
  };

  const [
    weeklyCompete,
    monthlyCompete,
    percentileBetter,
    lb,
    monthlyLb,
    rankDelta,
    compositeRank,
    activityDays,
  ] = await Promise.all([
    partnerRankInWindow(userId, season.windowMs),
    partnerRankInWindow(userId, MONTH_MS),
    partnerLifetimePercentileBetter(userId, closedDeals),
    compositeLeaderboard(season.windowMs, weights, 8),
    compositeLeaderboard(MONTH_MS, weights, 12),
    partnerRankDelta(userId, season.windowMs),
    partnerCompositeRank(userId, season.windowMs, weights),
    getActivityDays(userId, 30),
  ]);

  const memberDays = userCreated
    ? Math.max(
        1,
        Math.floor((Date.now() - userCreated.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
      )
    : 1;

  const nextLevel = await prisma.levelDefinition.findFirst({
    where: { order: { gt: profile.currentLevel.order } },
    orderBy: { order: "asc" },
  });

  const progressTarget = nextLevel?.minClosedDeals ?? Math.max(closedDeals, 1);

  const dealsToNext =
    nextLevel !== null ? Math.max(0, nextLevel.minClosedDeals - closedDeals) : 0;
  const streakCurrent = streak?.currentStreak ?? 0;

  const insights = buildPartnerInsightSlides({
    pendingDeals,
    closedDeals,
    streakCurrent,
    weeklyRank: weeklyCompete.rank ?? 0,
    weeklyFieldSize: weeklyCompete.fieldSize,
    weeklyClosed: weeklyCompete.closedInWindow,
  });

  let motivationPrimary: MotivationLine = { key: "defaultPrimary" };
  if (dealsToNext > 0) {
    motivationPrimary = { key: "dealsToNextLevel", params: { n: dealsToNext } };
  } else if (
    weeklyCompete.closedInWindow > 0 &&
    weeklyCompete.rank !== null &&
    weeklyCompete.rank <= 5
  ) {
    motivationPrimary = { key: "topWeekly", params: { rank: weeklyCompete.rank } };
  } else if (streakCurrent >= 3) {
    motivationPrimary = { key: "streakHot", params: { n: streakCurrent } };
  } else if (percentileBetter >= 50) {
    motivationPrimary = { key: "percentileStrong", params: { p: percentileBetter } };
  }

  let motivationSecondary: MotivationLine | null = null;
  if (percentileBetter >= 35 && motivationPrimary.key !== "percentileStrong") {
    motivationSecondary = { key: "percentileLine", params: { p: percentileBetter } };
  } else if (weeklyCompete.closedInWindow > 0 && motivationPrimary.key !== "topWeekly") {
    motivationSecondary = {
      key: "weeklyRankLine",
      params: {
        rank: weeklyCompete.rank ?? 0,
        total: weeklyCompete.fieldSize,
        closed: weeklyCompete.closedInWindow,
      },
    };
  }

  const progMap = new Map(missionDays.map((m) => [m.missionKey, m]));
  const missionsData: DashboardMission[] = missionDefs.map((m) => ({
    key: m.key,
    title: resolveMissionTitle(m.key, locale, m.title),
    target: missionTargetFromCriteria(m.criteria),
    progress: progMap.get(m.key)?.progress ?? 0,
    xpReward: m.xpReward,
    completed: !!progMap.get(m.key)?.completedAt,
  }));

  const earnedMap = new Map(
    userBadges.map((b) => [
      b.badge.key,
      { grantedAt: b.grantedAt.toISOString(), description: b.badge.description },
    ]),
  );
  const badgesData: DashboardBadge[] = allBadgeDefs.map((def) => {
    const earned = earnedMap.get(def.key);
    const copy = resolveBadgeCopy(def.key, locale, {
      name: def.name,
      description: def.description,
    });
    return {
      key: def.key,
      name: copy.name,
      category: def.category,
      hidden: def.hidden,
      description: copy.description,
      howTo: copy.howTo,
      earned: !!earned,
      grantedAt: earned?.grantedAt ?? null,
    };
  });

  const activityData: DashboardActivity[] = activityRows.map((a) => ({
    id: a.id,
    headline: a.headline,
    amountCents: a.amountCents,
    createdAt: a.createdAt.toISOString(),
  }));

  return {
    profile: {
      referralCode: profile.referralCode,
      totalXp: profile.totalXp,
      levelName: resolveLevelName(profile.currentLevel.name, locale),
      levelOrder: profile.currentLevel.order,
      onboardingSteps:
        profile.onboardingSteps && typeof profile.onboardingSteps === "object"
          ? (profile.onboardingSteps as Record<string, boolean>)
          : null,
    },
    closedDeals,
    pendingDeals,
    lostDeals,
    currentLevelMinXp: profile.currentLevel.minXp,
    nextLevel: nextLevel
      ? {
          name: resolveLevelName(nextLevel.name, locale),
          minClosedDeals: nextLevel.minClosedDeals,
          minXp: nextLevel.minXp,
        }
      : null,
    progress: { current: closedDeals, target: progressTarget },
    earningsCents,
    earningsThisMonthCents,
    rankDelta,
    deals: deals.map((d) => ({
      id: d.id,
      status: d.status,
      clientLabel: d.clientLabel,
      productName: d.product.name,
      createdAt: d.createdAt,
      closedAt: d.closedAt,
      lostAt: d.lostAt,
      journey: buildDealJourney({
        status: d.status,
        createdAt: d.createdAt,
        closedAt: d.closedAt,
        lostAt: d.lostAt,
        ledgerCount: d._count.ledger,
      }),
    })),
    network: networkProfiles.map((p) => ({
      userId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      referralCode: p.referralCode,
    })),
    ledger: ledger.map((l) => ({
      id: l.id,
      amountCents: l.amountCents,
      tier: l.tier,
      createdAt: l.createdAt,
      dealId: l.dealId ?? null,
    })),
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      commissionBaseCents: p.commissionBaseCents,
      marketingKit: p.marketingKit,
    })),
    badges: badgesData,
    missions: missionsData,
    activityFeed: activityData,
    monthlyRank: {
      closedInWindow: monthlyCompete.closedInWindow,
      rank: monthlyCompete.rank,
      fieldSize: monthlyCompete.fieldSize,
    },
    streak: streak
      ? { current: streak.currentStreak, longest: streak.longestStreak }
      : null,
    leaderboard: lb,
    monthlyLeaderboard: monthlyLb,
    leaderboardSeason: {
      name: season.name,
      weightDeals: season.weightDeals,
      weightXp: season.weightXp,
      weightStreak: season.weightStreak,
    },
    activityDays,
    memberDays,
    compete: {
      weeklyRank: compositeRank.rank ?? weeklyCompete.rank,
      weeklyClosed: weeklyCompete.closedInWindow,
      weeklyFieldSize: weeklyCompete.fieldSize,
      compositeScore: compositeRank.score,
      percentileBetter,
      motivationPrimary,
      motivationSecondary,
    },
    insights,
  };
}
