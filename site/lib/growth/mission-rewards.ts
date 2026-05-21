import { GrowthRewardStatus, type Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/growth/audit-log";
import { createNotification } from "@/lib/growth/notify";
import { NotificationType } from "@prisma/client";
import { utcDayKey } from "@/lib/growth/missions";

const CHAIN_BONUS_XP = 50;

type Db = PrismaClient | Prisma.TransactionClient;

export async function grantXpReward(
  db: Db,
  userId: string,
  xp: number,
  reason: string,
): Promise<void> {
  if (xp <= 0) return;
  const existing = await db.xpEvent.findFirst({ where: { userId, reason } });
  if (existing) return;

  await db.xpEvent.create({
    data: { userId, amount: xp, reason },
  });
  await db.partnerProfile.update({
    where: { userId },
    data: { totalXp: { increment: xp } },
  });
}

/** Queue chain bonus when every mission in the group is completed today (XP granted only after admin approval). */
export async function tryQueueChainBonus(userId: string, chainGroup: string) {
  const day = utcDayKey();
  const missions = await prisma.missionDefinition.findMany({
    where: { active: true, chainGroup },
    select: { key: true },
  });
  if (missions.length < 2) return;

  const rows = await prisma.userMissionDay.findMany({
    where: {
      userId,
      day,
      missionKey: { in: missions.map((m) => m.key) },
      completedAt: { not: null },
    },
  });
  if (rows.length < missions.length) return;

  const existing = await prisma.pendingChainReward.findUnique({
    where: { userId_chainGroup_day: { userId, chainGroup, day } },
  });
  if (existing && existing.rewardStatus !== GrowthRewardStatus.REJECTED) return;

  await prisma.pendingChainReward.upsert({
    where: { userId_chainGroup_day: { userId, chainGroup, day } },
    create: {
      userId,
      chainGroup,
      day,
      xpAmount: CHAIN_BONUS_XP,
      rewardStatus: GrowthRewardStatus.PENDING,
    },
    update: {
      xpAmount: CHAIN_BONUS_XP,
      rewardStatus: GrowthRewardStatus.PENDING,
      reviewedAt: null,
      reviewedById: null,
    },
  });
}

export type PendingMissionRewardRow = {
  id: string;
  kind: "mission" | "chain";
  userId: string;
  partnerName: string;
  partnerEmail: string;
  label: string;
  missionKey: string | null;
  chainGroup: string | null;
  day: string;
  xpAmount: number;
  completedAt: string;
};

export async function listPendingMissionRewards(): Promise<PendingMissionRewardRow[]> {
  const [missions, chains] = await Promise.all([
    prisma.userMissionDay.findMany({
      where: { rewardStatus: GrowthRewardStatus.PENDING },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 100,
    }),
    prisma.pendingChainReward.findMany({
      where: { rewardStatus: GrowthRewardStatus.PENDING },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const missionKeys = [...new Set(missions.map((m) => m.missionKey))];
  const defs =
    missionKeys.length > 0
      ? await prisma.missionDefinition.findMany({
          where: { key: { in: missionKeys } },
          select: { key: true, title: true },
        })
      : [];
  const titleByKey = new Map(defs.map((d) => [d.key, d.title]));

  const missionRows: PendingMissionRewardRow[] = missions.map((m) => ({
    id: m.id,
    kind: "mission",
    userId: m.userId,
    partnerName: m.user.name?.trim() || m.user.email,
    partnerEmail: m.user.email,
    label: titleByKey.get(m.missionKey) ?? m.missionKey,
    missionKey: m.missionKey,
    chainGroup: null,
    day: m.day,
    xpAmount: m.rewardXp ?? 0,
    completedAt: (m.completedAt ?? new Date()).toISOString(),
  }));

  const chainRows: PendingMissionRewardRow[] = chains.map((c) => ({
    id: c.id,
    kind: "chain",
    userId: c.userId,
    partnerName: c.user.name?.trim() || c.user.email,
    partnerEmail: c.user.email,
    label: `Chain: ${c.chainGroup}`,
    missionKey: null,
    chainGroup: c.chainGroup,
    day: c.day,
    xpAmount: c.xpAmount,
    completedAt: c.createdAt.toISOString(),
  }));

  return [...missionRows, ...chainRows].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export async function adminApproveMissionReward(
  actorId: string,
  kind: "mission" | "chain",
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();

  if (kind === "mission") {
    const row = await prisma.userMissionDay.findUnique({ where: { id } });
    if (!row || row.rewardStatus !== GrowthRewardStatus.PENDING) {
      return { ok: false, error: "not_found" };
    }
    const xp = row.rewardXp ?? 0;
    const reason = `mission:${row.missionKey}:${row.day}`;

    await prisma.$transaction(async (tx) => {
      await grantXpReward(tx, row.userId, xp, reason);
      await tx.userMissionDay.update({
        where: { id },
        data: {
          rewardStatus: GrowthRewardStatus.APPROVED,
          reviewedAt: now,
          reviewedById: actorId,
        },
      });
    });

    const def = await prisma.missionDefinition.findFirst({
      where: { key: row.missionKey },
      select: { chainGroup: true, title: true },
    });
    if (def?.chainGroup) {
      await tryQueueChainBonus(row.userId, def.chainGroup);
    }

    await logAdminAudit(actorId, "approve_mission_reward", "UserMissionDay", id, {
      userId: row.userId,
      missionKey: row.missionKey,
      xp,
    });

    if (xp > 0) {
      await createNotification(prisma, {
        userId: row.userId,
        type: NotificationType.XP_BOOST,
        title: "مكافأة مهمة",
        body: `تمت الموافقة — +${xp} نقطة قوة (${def?.title ?? row.missionKey})`,
        link: "/growth",
      });
    }

    return { ok: true };
  }

  const chain = await prisma.pendingChainReward.findUnique({ where: { id } });
  if (!chain || chain.rewardStatus !== GrowthRewardStatus.PENDING) {
    return { ok: false, error: "not_found" };
  }
  const reason = `chain:${chain.chainGroup}:${chain.day}`;

  await prisma.$transaction(async (tx) => {
    await grantXpReward(tx, chain.userId, chain.xpAmount, reason);
    await tx.pendingChainReward.update({
      where: { id },
      data: {
        rewardStatus: GrowthRewardStatus.APPROVED,
        reviewedAt: now,
        reviewedById: actorId,
      },
    });
  });

  await logAdminAudit(actorId, "approve_chain_reward", "PendingChainReward", id, {
    userId: chain.userId,
    chainGroup: chain.chainGroup,
    xp: chain.xpAmount,
  });

  if (chain.xpAmount > 0) {
    await createNotification(prisma, {
      userId: chain.userId,
      type: NotificationType.XP_BOOST,
      title: "مكافأة سلسلة مهام",
      body: `تمت الموافقة — +${chain.xpAmount} نقطة قوة`,
      link: "/growth",
    });
  }

  return { ok: true };
}

export async function adminRejectMissionReward(
  actorId: string,
  kind: "mission" | "chain",
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();

  if (kind === "mission") {
    const row = await prisma.userMissionDay.findUnique({ where: { id } });
    if (!row || row.rewardStatus !== GrowthRewardStatus.PENDING) {
      return { ok: false, error: "not_found" };
    }
    await prisma.userMissionDay.update({
      where: { id },
      data: {
        rewardStatus: GrowthRewardStatus.REJECTED,
        reviewedAt: now,
        reviewedById: actorId,
      },
    });
    await logAdminAudit(actorId, "reject_mission_reward", "UserMissionDay", id, {
      userId: row.userId,
      missionKey: row.missionKey,
    });
    return { ok: true };
  }

  const chain = await prisma.pendingChainReward.findUnique({ where: { id } });
  if (!chain || chain.rewardStatus !== GrowthRewardStatus.PENDING) {
    return { ok: false, error: "not_found" };
  }
  await prisma.pendingChainReward.update({
    where: { id },
    data: {
      rewardStatus: GrowthRewardStatus.REJECTED,
      reviewedAt: now,
      reviewedById: actorId,
    },
  });
  await logAdminAudit(actorId, "reject_chain_reward", "PendingChainReward", id, {
    userId: chain.userId,
    chainGroup: chain.chainGroup,
  });
  return { ok: true };
}
