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

/** Competition rank among all partners by closed deals in the rolling window (1 = best). */
export async function partnerRankInWindow(
  userId: string,
  windowMs: number,
): Promise<{ closedInWindow: number; rank: number; fieldSize: number }> {
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
