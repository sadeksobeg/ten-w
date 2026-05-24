import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumEarningsCents } from "@/lib/growth/commission";
import type { RivalData } from "@/lib/growth/rival";
import type { DnaProfile } from "@/lib/growth/dna-score";

export type OracleMomentum = "rising" | "steady" | "slowing" | "new";

export interface OracleInsight {
  titleKey: string;
  bodyKey: string;
  titleParams?: Record<string, number | string>;
  bodyParams?: Record<string, number | string>;
  urgency: "high" | "medium" | "low";
}

export interface OraclePrediction {
  daysToNextLevel: number | null;
  estimatedMonthlyEarnings: number;
  top3Probability: number;
  dealsPrediction30d: number;
  momentum: OracleMomentum;
  insight: OracleInsight;
  weeklyTarget: { deals: number; xp: number };
  weeklyProgress: { deals: number; xp: number };
  computedAt: string;
}

type OracleInput = {
  userId: string;
  closedDeals: number;
  totalXp: number;
  memberDays: number;
  streakCurrent: number;
  nextLevel: { minClosedDeals: number; name: string } | null;
  weeklyClosed: number;
  weeklyRank: number | null;
  rivalData: RivalData | null;
  dnaProfile: DnaProfile;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function dealsInRange(userId: string, from: Date, to: Date): Promise<number> {
  return prisma.deal.count({
    where: {
      partnerId: userId,
      status: DealStatus.CLOSED,
      closedAt: { gte: from, lt: to },
    },
  });
}

function pickInsight(
  input: OracleInput & { weeklyClosed: number; momentum: OracleMomentum },
): OracleInsight {
  const dealsToLevel =
    input.nextLevel && input.nextLevel.minClosedDeals > input.closedDeals
      ? input.nextLevel.minClosedDeals - input.closedDeals
      : null;

  if (dealsToLevel !== null && dealsToLevel <= 5) {
    return {
      titleKey: "levelCloseTitle",
      bodyKey: "levelCloseBody",
      titleParams: { n: dealsToLevel, level: input.nextLevel!.name },
      bodyParams: { n: dealsToLevel },
      urgency: "high",
    };
  }

  if (input.rivalData && !input.rivalData.iAmAhead && input.rivalData.gap <= 2) {
    return {
      titleKey: "rivalCloseTitle",
      bodyKey: "rivalCloseBody",
      titleParams: { name: input.rivalData.rival.name, gap: input.rivalData.gap },
      bodyParams: { gap: input.rivalData.gap },
      urgency: "high",
    };
  }

  if (input.streakCurrent >= 5) {
    return {
      titleKey: "streakTitle",
      bodyKey: "streakBody",
      titleParams: { n: input.streakCurrent },
      bodyParams: { n: input.streakCurrent },
      urgency: "medium",
    };
  }

  if (input.momentum === "rising") {
    return {
      titleKey: "risingTitle",
      bodyKey: "risingBody",
      urgency: "medium",
    };
  }

  if (input.weeklyClosed === 0 && input.memberDays > 14) {
    return {
      titleKey: "reengageTitle",
      bodyKey: "reengageBody",
      urgency: "high",
    };
  }

  return {
    titleKey: "steadyTitle",
    bodyKey: "steadyBody",
    urgency: "low",
  };
}

export async function calculateOraclePrediction(input: OracleInput): Promise<OraclePrediction> {
  const now = new Date();
  const last7Start = daysAgo(7);
  const prev7Start = daysAgo(14);

  const [last7, prev7, earningsCents, xpThisWeek] = await Promise.all([
    dealsInRange(input.userId, last7Start, now),
    dealsInRange(input.userId, prev7Start, last7Start),
    sumEarningsCents(input.userId),
    prisma.xpEvent.aggregate({
      where: { userId: input.userId, createdAt: { gte: last7Start } },
      _sum: { amount: true },
    }),
  ]);

  let momentum: OracleMomentum = "steady";
  if (input.memberDays < 14) momentum = "new";
  else if (prev7 === 0 && last7 > 0) momentum = "rising";
  else if (prev7 > 0) {
    const change = (last7 - prev7) / prev7;
    if (change >= 0.2) momentum = "rising";
    else if (change <= -0.2) momentum = "slowing";
  } else if (last7 === 0) momentum = "slowing";

  const avgDealsPerDay = input.memberDays > 0 ? input.closedDeals / Math.max(input.memberDays, 1) : 0.1;
  const dealsNeeded =
    input.nextLevel && input.nextLevel.minClosedDeals > input.closedDeals
      ? input.nextLevel.minClosedDeals - input.closedDeals
      : null;
  const daysToNextLevel =
    dealsNeeded !== null ? Math.ceil(dealsNeeded / Math.max(avgDealsPerDay, 0.1)) : null;

  const avgCommission =
    input.closedDeals > 0 ? earningsCents / input.closedDeals : 0;
  const projectedMonthlyDeals = Math.max(last7 / 7, avgDealsPerDay) * 30;
  const estimatedMonthlyEarnings = Math.round(projectedMonthlyDeals * avgCommission);
  const dealsPrediction30d = Math.round(projectedMonthlyDeals);

  const rank = input.weeklyRank ?? 99;
  let top3Probability = 5;
  if (rank <= 3) top3Probability = 90;
  else if (rank <= 10) top3Probability = Math.max(20, 70 - (rank - 3) * 8);
  else top3Probability = Math.max(5, 20 - rank);

  const weeklyTarget = {
    deals: Math.max(1, Math.ceil(Math.max(last7 / 7, avgDealsPerDay) * 7 * 1.2)),
    xp: 200,
  };

  const insight = pickInsight({ ...input, weeklyClosed: last7, momentum });

  return {
    daysToNextLevel,
    estimatedMonthlyEarnings,
    top3Probability,
    dealsPrediction30d,
    momentum,
    insight,
    weeklyTarget,
    weeklyProgress: { deals: last7, xp: xpThisWeek._sum.amount ?? 0 },
    computedAt: new Date().toISOString(),
  };
}
