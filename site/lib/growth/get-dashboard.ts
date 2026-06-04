import { DealStatus, PayoutStatus } from "@prisma/client";
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
import { getActivityDays, isDailyCheckInAvailable } from "@/lib/growth/streak";
import { GrowthRewardStatus } from "@prisma/client";
import { missionTargetFromCriteria, utcDayKey } from "@/lib/growth/missions";
import {
  fetchActivityEventsSafe,
  fetchMissionDefinitionsSafe,
  fetchUserMissionDaySafe,
} from "@/lib/growth/prisma-optional";
import { buildDealJourney, type DealJourneyStep } from "@/lib/growth/deal-journey";
import { buildPartnerInsightSlides, type PartnerInsightSlide } from "@/lib/growth/partner-insights";
import type { DnaProfile } from "@/lib/growth/dna-score";
import type { RivalData } from "@/lib/growth/rival";
import type { OraclePrediction } from "@/lib/growth/oracle";
import { getTimeCapsuleForUser, daysUntilCapsuleOpen } from "@/lib/growth/time-capsule";
import { getLatestWeeklyChronicle } from "@/lib/growth/weekly-chronicle";
import type { WeeklyChroniclePayload } from "@/lib/growth/weekly-chronicle";
import { getGhostData } from "@/lib/growth/ghost";
import { calculateDnaProfile } from "@/lib/growth/dna-score";
import { getPartnerRival } from "@/lib/growth/rival";
import { calculateOraclePrediction } from "@/lib/growth/oracle";
import { isPartnerInHall } from "@/lib/growth/hall-of-legends";
import { ensurePartnerProfile } from "@/lib/growth/ensure-partner-profile";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { resolveMissionTitle } from "@/lib/growth/mission-i18n";
import { resolveLevelName } from "@/lib/growth/level-i18n";
import { parseLevelPerks } from "@/lib/growth/parse-level-perks";
import {
  buildLast6MonthEarnings,
  computePartnerWallet,
  type MonthEarningsPoint,
  type PartnerWallet,
} from "@/lib/growth/wallet";

export type DashboardDeal = {
  id: string;
  status: DealStatus;
  productId: string;
  clientLabel: string | null;
  productName: string;
  saleAmountCents: number;
  notes: string | null;
  commissionCents: number | null;
  hasSupportChat: boolean;
  createdAt: Date;
  closedAt: Date | null;
  lostAt: Date | null;
  journey: { steps: DealJourneyStep[] };
};

export type DashboardPayoutRequest = {
  id: string;
  amountCents: number;
  status: PayoutStatus;
  method: string | null;
  createdAt: string;
};

export type DashboardLevelInfo = {
  name: string;
  salaryUsd: number | null;
  perks: string[];
};

export type { PartnerWallet, MonthEarningsPoint };

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
  rewardStatus: "none" | "pending" | "approved" | "rejected";
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
    levelCode: string;
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
  wallet: PartnerWallet;
  payoutRequests: DashboardPayoutRequest[];
  earningsByMonth: MonthEarningsPoint[];
  currentLevelDetail: DashboardLevelInfo;
  nextLevelDetail: DashboardLevelInfo | null;
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
  checkIn: { available: boolean; totalCheckIns: number };
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
  dnaProfile: DnaProfile;
  rivalData: RivalData | null;
  oracle: OraclePrediction;
  inHallOfLegends: boolean;
  engagement: {
    hasOath: boolean;
    showOathModal: boolean;
    timeCapsuleDaysLeft: number | null;
    showCapsulePrompt: boolean;
    weeklyChronicle: WeeklyChroniclePayload | null;
    ghostXpPercent: number | null;
    ghostLegendName: string | null;
  };
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
    payoutRequests,
    ledgerForMonths,
  ] = await Promise.all([
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.CLOSED } }),
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.PENDING } }),
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.LOST } }),
      prisma.deal.findMany({
        where: { partnerId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          productId: true,
          clientLabel: true,
          saleAmountCents: true,
          notes: true,
          createdAt: true,
          closedAt: true,
          lostAt: true,
          product: { select: { name: true } },
          _count: { select: { ledger: true } },
        },
      }),
      prisma.partnerProfile.findMany({
        where: { parentUserId: userId },
        take: 50,
        orderBy: { createdAt: "desc" },
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
      prisma.payoutRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.commissionLedger.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth() - 5,
                1,
              ),
            ),
          },
        },
        select: { createdAt: true, amountCents: true },
      }),
    ]);

  const earningsCents = await sumEarningsCents(userId);
  const wallet = await computePartnerWallet(userId);
  const earningsByMonth = buildLast6MonthEarnings(ledgerForMonths, locale);

  const dealIds = deals.map((d) => d.id);
  const [commissionByDeal, linkedDeals] = await Promise.all([
    dealIds.length > 0
      ? prisma.commissionLedger.groupBy({
          by: ["dealId"],
          where: { userId, dealId: { in: dealIds }, tier: { gt: 0 } },
          _sum: { amountCents: true },
        })
      : Promise.resolve([]),
    dealIds.length > 0
      ? prisma.chatConversation.findMany({
          where: { partnerUserId: userId, linkedDealId: { in: dealIds } },
          select: { linkedDealId: true },
        })
      : Promise.resolve([]),
  ]);
  const commissionMap = new Map(
    commissionByDeal
      .filter((r) => r.dealId)
      .map((r) => [r.dealId!, r._sum.amountCents ?? 0]),
  );
  const linkedDealSet = new Set(
    linkedDeals.map((c) => c.linkedDealId).filter(Boolean) as string[],
  );
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

  const [dnaProfile, rivalData, inHallOfLegends] = await Promise.all([
    calculateDnaProfile(userId),
    getPartnerRival(userId),
    isPartnerInHall(userId),
  ]);

  const oracle = await calculateOraclePrediction({
    userId,
    closedDeals,
    totalXp: profile.totalXp,
    memberDays,
    streakCurrent,
    nextLevel: nextLevel
      ? { minClosedDeals: nextLevel.minClosedDeals, name: resolveLevelName(nextLevel.name, locale) }
      : null,
    weeklyClosed: weeklyCompete.closedInWindow,
    weeklyRank: compositeRank.rank ?? weeklyCompete.rank,
    rivalData,
    dnaProfile,
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
  const missionsData: DashboardMission[] = missionDefs.map((m) => {
    const row = progMap.get(m.key);
    const rs = row?.rewardStatus ?? GrowthRewardStatus.NONE;
    const rewardStatus =
      rs === GrowthRewardStatus.PENDING
        ? "pending"
        : rs === GrowthRewardStatus.APPROVED
          ? "approved"
          : rs === GrowthRewardStatus.REJECTED
            ? "rejected"
            : "none";
    return {
      key: m.key,
      title: resolveMissionTitle(m.key, locale, m.title),
      target: missionTargetFromCriteria(m.criteria),
      progress: row?.progress ?? 0,
      xpReward: m.xpReward,
      completed: !!row?.completedAt,
      rewardStatus,
    };
  });

  const earnedMap = new Map(
    userBadges.map((b) => [
      b.badge.key,
      { grantedAt: b.grantedAt.toISOString(), description: b.badge.description },
    ]),
  );
  const badgesData: DashboardBadge[] = allBadgeDefs.map((def) => {
    const earned = earnedMap.get(def.key);
    const copy = resolveBadgeCopy(
      def.key,
      locale,
      { name: def.name, description: def.description },
      { earned: !!earned, hidden: def.hidden },
    );
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
      levelCode: profile.currentLevel.code,
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
    wallet,
    payoutRequests: payoutRequests.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      status: p.status,
      method: p.method,
      createdAt: p.createdAt.toISOString(),
    })),
    earningsByMonth,
    currentLevelDetail: {
      name: resolveLevelName(profile.currentLevel.name, locale),
      salaryUsd: profile.currentLevel.salaryUsd,
      perks: parseLevelPerks(profile.currentLevel.perksJson),
    },
    nextLevelDetail: nextLevel
      ? {
          name: resolveLevelName(nextLevel.name, locale),
          salaryUsd: nextLevel.salaryUsd,
          perks: parseLevelPerks(nextLevel.perksJson),
        }
      : null,
    deals: deals.map((d) => ({
      id: d.id,
      status: d.status,
      productId: d.productId,
      clientLabel: d.clientLabel,
      productName: d.product.name,
      saleAmountCents: d.saleAmountCents,
      notes: d.notes,
      commissionCents:
        d.status === DealStatus.CLOSED ? (commissionMap.get(d.id) ?? 0) : null,
      hasSupportChat: linkedDealSet.has(d.id),
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
    checkIn: {
      available: isDailyCheckInAvailable(
        (streak as { lastCheckInDate?: Date | null } | null)?.lastCheckInDate ?? null,
      ),
      totalCheckIns: await prisma.xpEvent.count({
        where: { userId, reason: "daily_check_in" },
      }),
    },
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
    dnaProfile,
    rivalData,
    oracle,
    inHallOfLegends,
    engagement: await buildEngagementExtras(userId, locale, {
      closedDeals,
      hasDeals: deals.length > 0,
      onboardingSteps:
        profile.onboardingSteps && typeof profile.onboardingSteps === "object"
          ? (profile.onboardingSteps as Record<string, boolean>)
          : null,
      totalXp: profile.totalXp,
      currentLevelMinXp: profile.currentLevel.minXp,
      nextLevelMinXp: nextLevel?.minXp ?? null,
    }),
  };
}

async function buildEngagementExtras(
  userId: string,
  locale: string,
  ctx: {
    closedDeals: number;
    hasDeals: boolean;
    onboardingSteps: Record<string, boolean> | null;
    totalXp: number;
    currentLevelMinXp: number;
    nextLevelMinXp: number | null;
  },
): Promise<DashboardData["engagement"]> {
  const [capsule, weekly, ghost, fullProfile] = await Promise.all([
    getTimeCapsuleForUser(userId).catch(() => null),
    getLatestWeeklyChronicle(userId).catch(() => null),
    getGhostData(userId, locale).catch(() => null),
    prisma.partnerProfile.findUnique({
      where: { userId },
      select: { oath: true, onboardingSteps: true },
    }),
  ]);

  const daysLeft = await daysUntilCapsuleOpen(userId).catch(() => null);
  const hasOath = Boolean(fullProfile?.oath);
  const showOathModal =
    !hasOath &&
    Boolean(ctx.onboardingSteps?.profile || ctx.closedDeals > 0 || ctx.hasDeals);

  let ghostXpPercent: number | null = null;
  if (ghost && ctx.nextLevelMinXp) {
    const span = Math.max(1, ctx.nextLevelMinXp - ctx.currentLevelMinXp);
    ghostXpPercent = Math.min(
      100,
      Math.max(0, Math.round(((ghost.ghostXp - ctx.currentLevelMinXp) / span) * 100)),
    );
  }

  return {
    hasOath,
    showOathModal,
    timeCapsuleDaysLeft: capsule && !capsule.wasDelivered ? daysLeft : null,
    showCapsulePrompt: ctx.hasDeals && !capsule,
    weeklyChronicle: weekly,
    ghostXpPercent,
    ghostLegendName: ghost?.legendName ?? null,
  };
}
