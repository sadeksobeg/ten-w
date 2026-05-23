import { DealStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  MONTH_MS,
  compositeLeaderboard,
  getActiveLeaderboardSeason,
} from "@/lib/growth/leaderboard";
import { grantAdminBadge } from "@/lib/growth/badges";
import { logAdminAudit } from "@/lib/growth/audit-log";
import { logActivityEvent } from "@/lib/growth/activity";
import { leaderboardRewardModelsAvailable } from "@/lib/growth/prisma-optional";
import { revalidatePartnerSurfaces } from "@/lib/growth/revalidate-partner";

function periodKeyMonthly(d = new Date()): string {
  return `m-${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Grant configured cash bonuses for top ranks in the rolling 30-day window (idempotent per user+period). */
export async function applyMonthlyLeaderboardBonuses(
  actorUserId: string,
): Promise<{ ok: true; granted: number } | { ok: false; error: string }> {
  const actor = await prisma.user.findUnique({ where: { id: actorUserId } });
  if (!actor || actor.role !== UserRole.ADMIN) {
    return { ok: false, error: "forbidden" };
  }

  if (!leaderboardRewardModelsAvailable(prisma)) {
    return { ok: false, error: "missing_prisma_client" };
  }

  const rules = await prisma.leaderboardRewardRule.findMany({
    where: { active: true, windowMs: BigInt(MONTH_MS) },
  });
  if (rules.length === 0) return { ok: true, granted: 0 };

  const season = await getActiveLeaderboardSeason();
  const board = await compositeLeaderboard(
    MONTH_MS,
    {
      weightDeals: season.weightDeals,
      weightXp: season.weightXp,
      weightStreak: season.weightStreak,
    },
    50,
  );
  if (board.length === 0) return { ok: true, granted: 0 };

  const pk = periodKeyMonthly();
  let granted = 0;
  const revalidateSlugs = new Set<string>();

  await logAdminAudit(actorUserId, "apply_monthly_bonuses", "leaderboard", pk, {
    seasonId: season.id,
    ruleCount: rules.length,
  });

  for (let i = 0; i < board.length; i += 1) {
    const rank = i + 1;
    const row = board[i]!;
    const rule = rules.find((r) => rank >= r.rankMin && rank <= r.rankMax);
    if (!rule) continue;
    const hasBonus = rule.bonusCents > 0;
    if (!hasBonus && !rule.badgeKey) continue;

    const existing = await prisma.leaderboardGrantLog.findFirst({
      where: { userId: row.userId, periodKey: pk },
    });
    if (existing) continue;

    await prisma.$transaction(async (tx) => {
      await tx.leaderboardGrantLog.create({
        data: {
          userId: row.userId,
          periodKey: pk,
          rank,
          ruleId: rule.id,
          bonusCents: rule.bonusCents,
        },
      });
      if (hasBonus) {
        await tx.commissionLedger.create({
          data: {
            dealId: null,
            userId: row.userId,
            tier: 0,
            amountCents: rule.bonusCents,
            ruleSnapshot: { kind: "leaderboard_monthly_composite", rank, ruleId: rule.id, periodKey: pk },
          },
        });
      }
    });

    if (rule.badgeKey) {
      await grantAdminBadge(prisma, row.userId, rule.badgeKey, actorUserId);
    }

    if (hasBonus) {
      await logActivityEvent(prisma, {
        kind: "leaderboard_bonus",
        actorUserId: row.userId,
        headline: `Monthly rank #${rank} bonus credited`,
        amountCents: rule.bonusCents,
        metadata: { periodKey: pk, compositeScore: row.score },
      });
    }

    const slugRow = await prisma.user.findUnique({
      where: { id: row.userId },
      select: { publicSlug: true },
    });
    if (slugRow?.publicSlug) revalidateSlugs.add(slugRow.publicSlug);

    granted += 1;
  }

  for (const slug of revalidateSlugs) {
    revalidatePartnerSurfaces({ publicSlug: slug });
  }

  return { ok: true, granted };
}

export async function inactivePartnersSummary(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const partners = await prisma.user.findMany({
    where: { role: UserRole.PARTNER },
    select: { id: true, email: true, name: true },
  });
  const inactive: { id: string; email: string; name: string | null }[] = [];
  for (const p of partners) {
    const lastClosed = await prisma.deal.findFirst({
      where: { partnerId: p.id, status: DealStatus.CLOSED },
      orderBy: { closedAt: "desc" },
      select: { closedAt: true },
    });
    if (!lastClosed?.closedAt || lastClosed.closedAt < since) {
      inactive.push({ id: p.id, email: p.email, name: p.name });
    }
  }
  return inactive;
}

export async function dealConversionRates() {
  const [pending, closed, lost] = await Promise.all([
    prisma.deal.count({ where: { status: DealStatus.PENDING } }),
    prisma.deal.count({ where: { status: DealStatus.CLOSED } }),
    prisma.deal.count({ where: { status: DealStatus.LOST } }),
  ]);
  const decided = closed + lost;
  const rate = decided > 0 ? Math.round((closed / decided) * 1000) / 10 : 0;
  return { pending, closed, lost, winRatePct: rate };
}
