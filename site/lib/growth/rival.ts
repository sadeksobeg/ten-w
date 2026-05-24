import { DealStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { WEEK_MS, rollingSinceWindow } from "@/lib/growth/leaderboard";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export interface RivalData {
  rival: {
    userId: string;
    name: string;
    publicSlug: string | null;
    levelCode: string;
    closedDealsThisWeek: number;
    totalXp: number;
    initials: string;
  };
  myStats: {
    closedDealsThisWeek: number;
    totalXp: number;
    rank: number;
  };
  rivalRank: number;
  gap: number;
  iAmAhead: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function weekKey(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start.toISOString().slice(0, 10);
}

async function buildWeeklyBoard(): Promise<
  { userId: string; closedDeals: number; totalXp: number; levelCode: string; name: string; publicSlug: string | null }[]
> {
  const since = rollingSinceWindow(WEEK_MS);
  const grouped = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED, closedAt: { gte: since } },
    _count: { id: true },
  });

  if (grouped.length === 0) return [];

  const userIds = grouped.map((g) => g.partnerId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, role: "PARTNER", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      publicSlug: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
      partnerProfile: {
        select: { totalXp: true, currentLevel: { select: { code: true } } },
      },
    },
  });

  const byId = new Map(users.map((u) => [u.id, u]));

  return grouped
    .map((g) => {
      const u = byId.get(g.partnerId);
      if (!u?.partnerProfile) return null;
      const name = resolveChatSenderName(u);
      return {
        userId: g.partnerId,
        closedDeals: g._count.id,
        totalXp: u.partnerProfile.totalXp,
        levelCode: u.partnerProfile.currentLevel.code,
        name,
        publicSlug: u.publicSlug,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.closedDeals - a.closedDeals || b.totalXp - a.totalXp);
}

async function getPartnerRivalUncached(partnerUserId: string): Promise<RivalData | null> {
  const board = await buildWeeklyBoard();
  if (board.length === 0) return null;

  const myIdx = board.findIndex((r) => r.userId === partnerUserId);
  const myProfile = await prisma.partnerProfile.findUnique({
    where: { userId: partnerUserId },
    select: { totalXp: true },
  });
  if (!myProfile) return null;

  const myClosed = myIdx >= 0 ? board[myIdx]!.closedDeals : 0;
  const myRank = myIdx >= 0 ? myIdx + 1 : board.length + 1;

  let rivalIdx = -1;
  if (myIdx > 0) rivalIdx = myIdx - 1;
  else if (myIdx >= 0 && myIdx < board.length - 1) rivalIdx = myIdx + 1;
  else if (myIdx < 0 && board.length > 0) rivalIdx = board.length - 1;

  if (rivalIdx < 0) return null;

  const rival = board[rivalIdx]!;
  const gap = Math.abs(myClosed - rival.closedDeals);
  const iAmAhead = myClosed > rival.closedDeals;

  return {
    rival: {
      userId: rival.userId,
      name: rival.name,
      publicSlug: rival.publicSlug,
      levelCode: rival.levelCode,
      closedDealsThisWeek: rival.closedDeals,
      totalXp: rival.totalXp,
      initials: initials(rival.name),
    },
    myStats: {
      closedDealsThisWeek: myClosed,
      totalXp: myProfile.totalXp,
      rank: myRank,
    },
    rivalRank: rivalIdx + 1,
    gap,
    iAmAhead,
  };
}

export async function getPartnerRival(partnerUserId: string): Promise<RivalData | null> {
  const cached = unstable_cache(
    () => getPartnerRivalUncached(partnerUserId),
    [`rival-${partnerUserId}-${weekKey()}`],
    { revalidate: 3600, tags: [`rival-${partnerUserId}`] },
  );
  return cached();
}

export function rivalCacheTag(partnerUserId: string): string {
  return `rival-${partnerUserId}`;
}
