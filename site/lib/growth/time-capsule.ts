import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CapsuleGoals = {
  deals?: number;
  level?: string;
  earningsCents?: number;
};

export type CapsuleComparison = {
  goals: CapsuleGoals;
  actual: { deals: number; levelCode: string; earningsCents: number };
  exceeded: boolean;
};

const CAPSULE_DAYS = 180;

export function capsuleOpenDate(createdAt: Date): Date {
  const d = new Date(createdAt);
  d.setUTCDate(d.getUTCDate() + CAPSULE_DAYS);
  return d;
}

export async function getTimeCapsuleForUser(userId: string) {
  return prisma.timeCapsule.findUnique({ where: { userId } });
}

export async function getCapsuleComparison(userId: string): Promise<CapsuleComparison | null> {
  const capsule = await getTimeCapsuleForUser(userId);
  if (!capsule?.goals || typeof capsule.goals !== "object") return null;
  const goals = capsule.goals as CapsuleGoals;

  const [deals, profile, ledger] = await Promise.all([
    prisma.deal.count({ where: { partnerId: userId, status: DealStatus.CLOSED } }),
    prisma.partnerProfile.findUnique({
      where: { userId },
      select: { currentLevel: { select: { code: true } } },
    }),
    prisma.commissionLedger.aggregate({
      where: { userId },
      _sum: { amountCents: true },
    }),
  ]);

  const actual = {
    deals,
    levelCode: profile?.currentLevel.code ?? "starter",
    earningsCents: ledger._sum.amountCents ?? 0,
  };

  let exceeded = false;
  if (goals.deals != null && actual.deals >= goals.deals) exceeded = true;
  if (goals.earningsCents != null && actual.earningsCents >= goals.earningsCents) exceeded = true;
  if (goals.level) {
    const order = ["starter", "hunter", "closer", "pro", "elite", "titan", "legend"];
    if (order.indexOf(actual.levelCode) >= order.indexOf(goals.level)) exceeded = true;
  }

  return { goals, actual, exceeded };
}

export async function daysUntilCapsuleOpen(userId: string): Promise<number | null> {
  const cap = await getTimeCapsuleForUser(userId);
  if (!cap || cap.wasDelivered) return null;
  const ms = cap.openAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
