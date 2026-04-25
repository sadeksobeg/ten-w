import { DealStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { effectiveCommissionBaseCents } from "@/lib/growth/commission-base";
import { evaluateAutoBadgesForUser, grantFastCloserIfEligible } from "@/lib/growth/badges";
import { logActivityEvent } from "@/lib/growth/activity";
import { resolveLevelForClosedDeals } from "@/lib/growth/levels";
import { applyMissionProgress } from "@/lib/growth/missions";

function splitAmount(baseCents: number, bps: number): number {
  return Math.floor((baseCents * bps) / 10_000);
}

export type CloseDealResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "not_found"
        | "forbidden"
        | "bad_state"
        | "already_closed"
        | "missing_partner_profile";
    };

export async function closeDealAsAdmin(params: {
  dealId: string;
  actorUserId: string;
}): Promise<CloseDealResult> {
  const actor = await prisma.user.findUnique({ where: { id: params.actorUserId } });
  if (!actor || actor.role !== UserRole.ADMIN) {
    return { ok: false, error: "forbidden" };
  }

  const existingLedger = await prisma.commissionLedger.findFirst({
    where: { dealId: params.dealId },
  });
  if (existingLedger) {
    return { ok: false, error: "already_closed" };
  }

  const deal = await prisma.deal.findUnique({
    where: { id: params.dealId },
    include: { product: true },
  });
  if (!deal) return { ok: false, error: "not_found" };
  if (deal.status !== DealStatus.PENDING) {
    return { ok: false, error: "bad_state" };
  }

  const closerProfile = await prisma.partnerProfile.findUnique({
    where: { userId: deal.partnerId },
    include: { parent: { include: { partnerProfile: true } } },
  });
  if (!closerProfile) {
    return { ok: false, error: "missing_partner_profile" };
  }

  const tierCfg =
    (await prisma.commissionTierConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    })) ?? (await prisma.commissionTierConfig.findUnique({ where: { id: "default" } }));

  if (!tierCfg) {
    throw new Error("Missing CommissionTierConfig seed");
  }

  const base = await effectiveCommissionBaseCents(deal.partnerId, deal.productId);
  const t1 = splitAmount(base, tierCfg.tier1Bps);
  const t2 = splitAmount(base, tierCfg.tier2Bps);
  const t3 = splitAmount(base, tierCfg.tier3Bps);

  const u1 = deal.partnerId;
  const u2 = closerProfile?.parentUserId ?? null;

  let u3: string | null = null;
  if (u2) {
    const parentProfile = await prisma.partnerProfile.findUnique({
      where: { userId: u2 },
      select: { parentUserId: true },
    });
    u3 = parentProfile?.parentUserId ?? null;
  }

  const now = new Date();
  const ruleSnapshot = {
    tier1Bps: tierCfg.tier1Bps,
    tier2Bps: tierCfg.tier2Bps,
    tier3Bps: tierCfg.tier3Bps,
    baseCents: base,
  };

  await prisma.$transaction(async (tx) => {
    await tx.deal.update({
      where: { id: deal.id },
      data: { status: DealStatus.CLOSED, closedAt: now },
    });

    await tx.commissionLedger.create({
      data: {
        dealId: deal.id,
        userId: u1,
        tier: 1,
        amountCents: t1,
        ruleSnapshot,
      },
    });

    if (u2 && t2 > 0) {
      await tx.commissionLedger.create({
        data: {
          dealId: deal.id,
          userId: u2,
          tier: 2,
          amountCents: t2,
          ruleSnapshot,
        },
      });
    }

    if (u3 && t3 > 0) {
      await tx.commissionLedger.create({
        data: {
          dealId: deal.id,
          userId: u3,
          tier: 3,
          amountCents: t3,
          ruleSnapshot,
        },
      });
    }

    const xpAmount = 150;
    await tx.xpEvent.create({
      data: {
        userId: u1,
        amount: xpAmount,
        reason: "deal_closed",
        dealId: deal.id,
      },
    });

    await tx.partnerProfile.update({
      where: { userId: u1 },
      data: { totalXp: { increment: xpAmount } },
    });

    const closedCount = await tx.deal.count({
      where: { partnerId: u1, status: DealStatus.CLOSED },
    });
    const nextLevel = await tx.levelDefinition.findFirst({
      where: { minClosedDeals: { lte: closedCount } },
      orderBy: { order: "desc" },
    });
    if (nextLevel) {
      await tx.partnerProfile.update({
        where: { userId: u1 },
        data: { currentLevelId: nextLevel.id },
      });
    }
  });

  await grantFastCloserIfEligible(prisma, u1, deal.createdAt, now);
  await evaluateAutoBadgesForUser(prisma, u1);
  if (u2) await evaluateAutoBadgesForUser(prisma, u2);
  if (u3) await evaluateAutoBadgesForUser(prisma, u3);

  // Ensure level matches closed count after all writes
  const closedCount = await prisma.deal.count({
    where: { partnerId: u1, status: DealStatus.CLOSED },
  });
  const lvl = await resolveLevelForClosedDeals(prisma, closedCount);
  if (lvl) {
    await prisma.partnerProfile.update({
      where: { userId: u1 },
      data: { currentLevelId: lvl.id },
    });
  }

  await applyMissionProgress(prisma, u1, "close_deal", 1);

  const closerUser = await prisma.user.findUnique({
    where: { id: u1 },
    select: { name: true, email: true },
  });
  const label = closerUser?.name?.trim() || closerUser?.email || "Partner";
  await logActivityEvent(prisma, {
    kind: "deal_closed",
    actorUserId: u1,
    headline: `${label} closed a deal`,
    amountCents: t1,
    metadata: { dealId: deal.id },
  });

  return { ok: true };
}

export async function sumEarningsCents(userId: string): Promise<number> {
  const agg = await prisma.commissionLedger.aggregate({
    where: { userId },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}
