import { DealStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function rollingSinceWindow(ms: number): Date {
  return new Date(Date.now() - ms);
}

export type LeaderboardRow = {
  userId: string;
  name: string | null;
  closedDeals: number;
};

export type CompositeLeaderboardRow = {
  userId: string;
  name: string | null;
  score: number;
  closedDeals: number;
  totalXp: number;
  streak: number;
};

export type LeaderboardSeasonConfig = {
  id: string;
  name: string;
  windowMs: number;
  weightDeals: number;
  weightXp: number;
  weightStreak: number;
};

const DEFAULT_SEASON: LeaderboardSeasonConfig = {
  id: "default",
  name: "Weekly",
  windowMs: WEEK_MS,
  weightDeals: 40,
  weightXp: 40,
  weightStreak: 20,
};

export async function getActiveLeaderboardSeason(): Promise<LeaderboardSeasonConfig> {
  try {
    const row = await prisma.leaderboardSeason.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!row) return DEFAULT_SEASON;
    return {
      id: row.id,
      name: row.name,
      windowMs: Number(row.windowMs),
      weightDeals: row.weightDeals,
      weightXp: row.weightXp,
      weightStreak: row.weightStreak,
    };
  } catch {
    return DEFAULT_SEASON;
  }
}

function normalizeScores(values: number[]): Map<number, number> {
  const max = Math.max(...values, 1);
  const map = new Map<number, number>();
  values.forEach((v, i) => map.set(i, v / max));
  return map;
}

export async function compositeLeaderboard(
  windowMs: number,
  weights: { weightDeals: number; weightXp: number; weightStreak: number },
  limit = 10,
): Promise<CompositeLeaderboardRow[]> {
  const since = rollingSinceWindow(windowMs);
  const wSum = weights.weightDeals + weights.weightXp + weights.weightStreak || 1;
  const wD = weights.weightDeals / wSum;
  const wX = weights.weightXp / wSum;
  const wS = weights.weightStreak / wSum;

  const partners = await prisma.user.findMany({
    where: { role: UserRole.PARTNER, isActive: true },
    select: {
      id: true,
      name: true,
      partnerProfile: { select: { totalXp: true } },
      streak: { select: { currentStreak: true } },
    },
  });

  const grouped = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED, closedAt: { gte: since } },
    _count: { id: true },
  });
  const dealMap = new Map(grouped.map((g) => [g.partnerId, g._count.id]));

  const dealsArr = partners.map((p) => dealMap.get(p.id) ?? 0);
  const xpArr = partners.map((p) => p.partnerProfile?.totalXp ?? 0);
  const streakArr = partners.map((p) => p.streak?.currentStreak ?? 0);

  const normDeals = normalizeScores(dealsArr);
  const normXp = normalizeScores(xpArr);
  const normStreak = normalizeScores(streakArr);

  const scored = partners.map((p, i) => {
    const closedDeals = dealsArr[i]!;
    const totalXp = xpArr[i]!;
    const streak = streakArr[i]!;
    const score =
      100 *
      (wD * (normDeals.get(i) ?? 0) + wX * (normXp.get(i) ?? 0) + wS * (normStreak.get(i) ?? 0));
    return {
      userId: p.id,
      name: p.name,
      score: Math.round(score * 10) / 10,
      closedDeals,
      totalXp,
      streak,
    };
  });

  return scored
    .filter((r) => r.closedDeals > 0 || r.totalXp > 0 || r.streak > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function partnerCompositeRank(
  userId: string,
  windowMs: number,
  weights: { weightDeals: number; weightXp: number; weightStreak: number },
): Promise<{ rank: number | null; score: number; row: CompositeLeaderboardRow | null }> {
  const board = await compositeLeaderboard(windowMs, weights, 500);
  const idx = board.findIndex((r) => r.userId === userId);
  if (idx < 0) return { rank: null, score: 0, row: null };
  return { rank: idx + 1, score: board[idx]!.score, row: board[idx]! };
}

export async function weeklyLeaderboard(limit = 8): Promise<LeaderboardRow[]> {
  const since = rollingSinceWindow(WEEK_MS);

  const deals = await prisma.deal.findMany({
    where: {
      status: DealStatus.CLOSED,
      closedAt: { gte: since },
    },
    select: { partnerId: true },
  });

  const counts = new Map<string, number>();
  for (const d of deals) {
    counts.set(d.partnerId, (counts.get(d.partnerId) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

  const userIds = sorted.map(([id]) => id);
  if (userIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.name]));

  return sorted.map(([userId, closedDeals]) => ({
    userId,
    name: byId.get(userId) ?? null,
    closedDeals,
  }));
}

export type PartnerWindowRank = {
  closedInWindow: number;
  /** 1 = best among partners with ≥1 close in window; null if zero closes */
  rank: number | null;
  fieldSize: number;
};

/** Competition rank by closed deals in the rolling window (only partners with closes are ranked). */
export async function partnerRankInWindow(
  userId: string,
  windowMs: number,
): Promise<PartnerWindowRank> {
  const since = rollingSinceWindow(windowMs);
  const grouped = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: {
      status: DealStatus.CLOSED,
      closedAt: { gte: since },
    },
    _count: { id: true },
  });
  const partners = await prisma.user.findMany({
    where: { role: UserRole.PARTNER },
    select: { id: true },
  });
  const countMap = new Map<string, number>();
  for (const p of partners) countMap.set(p.id, 0);
  for (const g of grouped) countMap.set(g.partnerId, g._count.id);
  const myCount = countMap.get(userId) ?? 0;
  if (myCount === 0) {
    return { closedInWindow: 0, rank: null, fieldSize: partners.length };
  }
  let ahead = 0;
  for (const [, c] of countMap) {
    if (c > myCount) ahead++;
  }
  return {
    closedInWindow: myCount,
    rank: ahead + 1,
    fieldSize: partners.length,
  };
}

/** Positive = improved rank vs prior window of same length (e.g. climbed 2 places). */
export async function partnerRankDelta(
  userId: string,
  windowMs: number,
): Promise<number> {
  const now = Date.now();
  const currentSince = new Date(now - windowMs);
  const priorSince = new Date(now - windowMs * 2);
  const priorUntil = currentSince;

  async function rankInSlice(since: Date, until?: Date) {
    const grouped = await prisma.deal.groupBy({
      by: ["partnerId"],
      where: {
        status: DealStatus.CLOSED,
        closedAt: until ? { gte: since, lt: until } : { gte: since },
      },
      _count: { id: true },
    });
    const my = grouped.find((g) => g.partnerId === userId)?._count.id ?? 0;
    if (my === 0) return null;
    let ahead = 0;
    for (const g of grouped) {
      if (g._count.id > my) ahead++;
    }
    return ahead + 1;
  }

  const [current, prior] = await Promise.all([
    rankInSlice(currentSince),
    rankInSlice(priorSince, priorUntil),
  ]);
  if (current === null || prior === null) return 0;
  return prior - current;
}

export async function monthlyLeaderboard(limit = 12): Promise<LeaderboardRow[]> {
  const since = rollingSinceWindow(MONTH_MS);
  const deals = await prisma.deal.findMany({
    where: {
      status: DealStatus.CLOSED,
      closedAt: { gte: since },
    },
    select: { partnerId: true },
  });
  const counts = new Map<string, number>();
  for (const d of deals) {
    counts.set(d.partnerId, (counts.get(d.partnerId) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const userIds = sorted.map(([id]) => id);
  if (userIds.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.name]));
  return sorted.map(([uid, closedDeals]) => ({
    userId: uid,
    name: byId.get(uid) ?? null,
    closedDeals,
  }));
}

/** Approximate “better than X% of partners” from lifetime closed deal count (0–99). */
export async function partnerLifetimePercentileBetter(
  userId: string,
  myClosedLifetime: number,
): Promise<number> {
  const totalPartners = await prisma.user.count({
    where: { role: UserRole.PARTNER },
  });
  if (totalPartners <= 1) return 100;
  const grouped = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED },
    _count: { id: true },
  });
  let strictlyLess = 0;
  for (const g of grouped) {
    if (g.partnerId === userId) continue;
    if (g._count.id < myClosedLifetime) strictlyLess++;
  }
  if (myClosedLifetime > 0) {
    strictlyLess += totalPartners - grouped.length;
  }
  return Math.min(99, Math.round((strictlyLess / (totalPartners - 1)) * 100));
}
