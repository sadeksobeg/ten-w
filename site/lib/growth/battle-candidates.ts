import { DealStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { getPartnerRival } from "@/lib/growth/rival";
import { WEEK_MS, rollingSinceWindow } from "@/lib/growth/leaderboard";
import { TERRITORY_KEYS, type TerritoryKey } from "@/lib/growth/territories";

export type BattleCandidateReason = "rival" | "territory" | "network" | "leaderboard";

export type BattleCandidate = {
  userId: string;
  name: string;
  levelCode: string;
  territoryKey: TerritoryKey | null;
  reason: BattleCandidateReason;
  initials: string;
  closedDealsThisWeek?: number;
  rank?: number;
};

export type BattleCandidateGroup = {
  reason: BattleCandidateReason;
  candidates: BattleCandidate[];
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

async function weeklyBoard(): Promise<
  { userId: string; closedDeals: number; totalXp: number; levelCode: string; name: string }[]
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
    where: { id: { in: userIds }, role: UserRole.PARTNER, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
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
      return {
        userId: g.partnerId,
        closedDeals: g._count.id,
        totalXp: u.partnerProfile.totalXp,
        levelCode: u.partnerProfile.currentLevel.code,
        name: resolveChatSenderName(u),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.closedDeals - a.closedDeals || b.totalXp - a.totalXp);
}

async function profileSnippet(userId: string): Promise<{
  levelCode: string;
  territoryKey: TerritoryKey | null;
} | null> {
  const row = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: {
      territory: true,
      currentLevel: { select: { code: true } },
      user: { select: { isActive: true, role: true } },
    },
  });
  if (!row?.user.isActive || row.user.role !== UserRole.PARTNER) return null;
  const territoryKey =
    row.territory && TERRITORY_KEYS.includes(row.territory as TerritoryKey)
      ? (row.territory as TerritoryKey)
      : null;
  return { levelCode: row.currentLevel.code, territoryKey };
}

/** Curated challenge targets — never exposes the full partner directory. */
export async function getBattleChallengeCandidates(userId: string): Promise<{
  groups: BattleCandidateGroup[];
  candidateIds: string[];
}> {
  const seen = new Set<string>();
  const groups: BattleCandidateGroup[] = [];

  const pushGroup = (reason: BattleCandidateReason, list: BattleCandidate[]) => {
    const fresh = list.filter((c) => c.userId !== userId && !seen.has(c.userId));
    if (fresh.length === 0) return;
    for (const c of fresh) seen.add(c.userId);
    groups.push({ reason, candidates: fresh.slice(0, 6) });
  };

  const rivalData = await getPartnerRival(userId);
  if (rivalData) {
    const meta = await profileSnippet(rivalData.rival.userId);
    pushGroup("rival", [
      {
        userId: rivalData.rival.userId,
        name: rivalData.rival.name,
        levelCode: rivalData.rival.levelCode,
        territoryKey: meta?.territoryKey ?? null,
        reason: "rival",
        initials: rivalData.rival.initials,
        closedDealsThisWeek: rivalData.rival.closedDealsThisWeek,
        rank: rivalData.rivalRank,
      },
    ]);
  }

  const myProfile = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: { territory: true, parentUserId: true },
  });

  if (myProfile?.territory && TERRITORY_KEYS.includes(myProfile.territory as TerritoryKey)) {
    const territoryKey = myProfile.territory as TerritoryKey;
    const peers = await prisma.partnerProfile.findMany({
      where: {
        territory: territoryKey,
        userId: { not: userId },
        user: { role: UserRole.PARTNER, isActive: true },
      },
      orderBy: { totalXp: "desc" },
      take: 8,
      select: {
        userId: true,
        territory: true,
        currentLevel: { select: { code: true } },
        user: {
          select: {
            name: true,
            email: true,
            isVerifiedOfficial: true,
            officialDisplayName: true,
          },
        },
      },
    });
    pushGroup(
      "territory",
      peers.map((p) => ({
        userId: p.userId,
        name: resolveChatSenderName(p.user),
        levelCode: p.currentLevel.code,
        territoryKey,
        reason: "territory" as const,
        initials: initials(resolveChatSenderName(p.user)),
      })),
    );
  }

  const networkIds: string[] = [];
  if (myProfile?.parentUserId && myProfile.parentUserId !== userId) {
    networkIds.push(myProfile.parentUserId);
  }
  const downlines = await prisma.partnerProfile.findMany({
    where: { parentUserId: userId, user: { role: UserRole.PARTNER, isActive: true } },
    take: 6,
    select: { userId: true },
  });
  for (const d of downlines) networkIds.push(d.userId);

  if (networkIds.length > 0) {
    const networkUsers = await prisma.user.findMany({
      where: { id: { in: networkIds }, role: UserRole.PARTNER, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        isVerifiedOfficial: true,
        officialDisplayName: true,
        partnerProfile: {
          select: { territory: true, currentLevel: { select: { code: true } } },
        },
      },
    });
    pushGroup(
      "network",
      networkUsers
        .filter((u) => u.partnerProfile)
        .map((u) => {
          const name = resolveChatSenderName(u);
          const tKey = u.partnerProfile!.territory;
          return {
            userId: u.id,
            name,
            levelCode: u.partnerProfile!.currentLevel.code,
            territoryKey:
              tKey && TERRITORY_KEYS.includes(tKey as TerritoryKey)
                ? (tKey as TerritoryKey)
                : null,
            reason: "network" as const,
            initials: initials(name),
          };
        }),
    );
  }

  const board = await weeklyBoard();
  const myIdx = board.findIndex((r) => r.userId === userId);
  if (board.length > 0) {
    const nearbyIdxs = new Set<number>();
    if (myIdx >= 0) {
      for (let i = Math.max(0, myIdx - 2); i <= Math.min(board.length - 1, myIdx + 2); i += 1) {
        if (i !== myIdx) nearbyIdxs.add(i);
      }
    } else if (board.length >= 1) {
      nearbyIdxs.add(board.length - 1);
    }

    const leaderboardCandidates: BattleCandidate[] = [];
    for (const idx of nearbyIdxs) {
      const row = board[idx]!;
      const meta = await profileSnippet(row.userId);
      if (!meta) continue;
      leaderboardCandidates.push({
        userId: row.userId,
        name: row.name,
        levelCode: row.levelCode,
        territoryKey: meta.territoryKey,
        reason: "leaderboard",
        initials: initials(row.name),
        closedDealsThisWeek: row.closedDeals,
        rank: idx + 1,
      });
    }
    pushGroup("leaderboard", leaderboardCandidates);
  }

  return { groups, candidateIds: [...seen] };
}

export async function isAllowedBattleTarget(
  challengerId: string,
  challengedId: string,
): Promise<boolean> {
  if (challengerId === challengedId) return false;
  const { candidateIds } = await getBattleChallengeCandidates(challengerId);
  return candidateIds.includes(challengedId);
}
