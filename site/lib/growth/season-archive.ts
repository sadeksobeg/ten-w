import { prisma } from "@/lib/prisma";
import { compositeLeaderboard } from "@/lib/growth/leaderboard";
import { grantAdminBadge } from "@/lib/growth/badges";
import { logAdminAudit } from "@/lib/growth/audit-log";

export async function listEndedSeasons() {
  return prisma.leaderboardSeason.findMany({
    where: { active: false, endsAt: { not: null } },
    orderBy: { endsAt: "desc" },
    take: 24,
  });
}

export async function closeLeaderboardSeason(
  seasonId: string,
  actorUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const season = await prisma.leaderboardSeason.findUnique({ where: { id: seasonId } });
  if (!season || !season.active) return { ok: false, error: "season_not_active" };

  const board = await compositeLeaderboard(
    Number(season.windowMs),
    {
      weightDeals: season.weightDeals,
      weightXp: season.weightXp,
      weightStreak: season.weightStreak,
    },
    1,
  );

  await prisma.leaderboardSeason.update({
    where: { id: seasonId },
    data: { active: false, endsAt: new Date() },
  });

  const winner = board[0];
  if (winner) {
    await grantAdminBadge(prisma, winner.userId, "top_performer", actorUserId);
  }

  await logAdminAudit(actorUserId, "close_season", "LeaderboardSeason", seasonId, {
    winnerId: winner?.userId ?? null,
  });

  return { ok: true };
}
