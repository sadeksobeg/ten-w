import { DealStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

const BATTLE_DAYS = 7;
const ACTIVE_STATUSES = ["PENDING", "ACTIVE"] as const;

export type BattleView = {
  id: string;
  status: string;
  metric: string;
  target: number;
  stakesXp: number;
  startedAt: Date | null;
  endsAt: Date | null;
  challengerProgress: number;
  challengedProgress: number;
  challenger: { id: string; name: string; slug: string | null };
  challenged: { id: string; name: string; slug: string | null };
  winnerId: string | null;
  isChallenger: boolean;
};

async function userLabel(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, publicSlug: true, isVerifiedOfficial: true, officialDisplayName: true },
  });
  if (!u) return { id: userId, name: "Partner", slug: null };
  return { id: userId, name: resolveChatSenderName(u), slug: u.publicSlug };
}

export async function hasActiveBattle(userId: string): Promise<boolean> {
  const n = await prisma.partnerBattle.count({
    where: {
      status: { in: [...ACTIVE_STATUSES] },
      OR: [{ challengerId: userId }, { challengedId: userId }],
    },
  });
  return n > 0;
}

export async function getPartnerBattles(userId: string): Promise<BattleView[]> {
  const rows = await prisma.partnerBattle.findMany({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      status: { notIn: ["DECLINED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const out: BattleView[] = [];
  for (const b of rows) {
    const [challenger, challenged] = await Promise.all([
      userLabel(b.challengerId),
      userLabel(b.challengedId),
    ]);
    out.push({
      id: b.id,
      status: b.status,
      metric: b.metric,
      target: b.target,
      stakesXp: b.stakesXp,
      startedAt: b.startedAt,
      endsAt: b.endsAt,
      challengerProgress: b.challengerProgress,
      challengedProgress: b.challengedProgress,
      challenger,
      challenged,
      winnerId: b.winnerId,
      isChallenger: b.challengerId === userId,
    });
  }
  return out;
}

async function progressSince(
  userId: string,
  metric: string,
  since: Date,
): Promise<number> {
  if (metric === "deals") {
    return prisma.deal.count({
      where: { partnerId: userId, status: DealStatus.CLOSED, closedAt: { gte: since } },
    });
  }
  if (metric === "xp") {
    const agg = await prisma.xpEvent.aggregate({
      where: { userId, createdAt: { gte: since }, amount: { gt: 0 } },
      _sum: { amount: true },
    });
    return agg._sum.amount ?? 0;
  }
  if (metric === "streak") {
    const streak = await prisma.userStreak.findUnique({ where: { userId } });
    return streak?.currentStreak ?? 0;
  }
  if (metric === "creator_posts") {
    const { countCreatorPostsSince } = await import("@/lib/growth/creator-arena");
    return countCreatorPostsSince(userId, since);
  }
  return 0;
}

async function deductStake(userId: string, amount: number): Promise<void> {
  const profile = await prisma.partnerProfile.findUnique({ where: { userId } });
  if (!profile) return;
  const next = Math.max(0, profile.totalXp - amount);
  await prisma.$transaction([
    prisma.partnerProfile.update({ where: { userId }, data: { totalXp: next } }),
    prisma.xpEvent.create({
      data: { userId, amount: -amount, reason: "battle_stake", source: "battle" },
    }),
  ]);
}

async function awardBattleXp(userId: string, amount: number): Promise<void> {
  await prisma.$transaction([
    prisma.partnerProfile.update({ where: { userId }, data: { totalXp: { increment: amount } } }),
    prisma.xpEvent.create({
      data: { userId, amount, reason: "battle_win", source: "battle" },
    }),
  ]);
}

async function completeBattle(
  battleId: string,
  winnerId: string | null,
  tie: boolean,
  stakesXp: number,
  challengerId: string,
  challengedId: string,
  locale: string,
): Promise<void> {
  await prisma.partnerBattle.update({
    where: { id: battleId },
    data: { status: "COMPLETED", winnerId: tie ? null : winnerId },
  });

  if (tie) {
    await prisma.$transaction([
      prisma.partnerProfile.update({
        where: { userId: challengerId },
        data: { totalXp: { increment: stakesXp } },
      }),
      prisma.partnerProfile.update({
        where: { userId: challengedId },
        data: { totalXp: { increment: stakesXp } },
      }),
      prisma.xpEvent.create({
        data: { userId: challengerId, amount: stakesXp, reason: "battle_tie_refund", source: "battle" },
      }),
      prisma.xpEvent.create({
        data: { userId: challengedId, amount: stakesXp, reason: "battle_tie_refund", source: "battle" },
      }),
    ]);
    return;
  }

  if (winnerId) {
    await awardBattleXp(winnerId, stakesXp * 2);
    const loserId = winnerId === challengerId ? challengedId : challengerId;
    await createNotification(prisma, {
      userId: winnerId,
      type: NotificationType.SYSTEM,
      title: pickEngagementText(locale, { ar: "انتصرت في المعركة", en: "Battle won", fr: "Bataille gagnée" }),
      body: pickEngagementText(locale, {
        ar: `ربحت ${stakesXp * 2} نقطة`,
        en: `You earned ${stakesXp * 2} XP`,
      }),
      link: "/growth/battles",
      metadata: { kind: "battle_won" },
    });
    await createNotification(prisma, {
      userId: loserId,
      type: NotificationType.SYSTEM,
      title: pickEngagementText(locale, { ar: "خسرت المعركة", en: "Battle lost", fr: "Bataille perdue" }),
      body: pickEngagementText(locale, {
        ar: "استعد للمعركة القادمة",
        en: "Prepare for the next battle",
      }),
      link: "/growth/battles",
    });
  }
}

export async function updateActiveBattleProgress(userId: string, locale: string): Promise<void> {
  const battles = await prisma.partnerBattle.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ challengerId: userId }, { challengedId: userId }],
    },
  });

  for (const b of battles) {
    if (!b.startedAt) continue;
    const chProg = await progressSince(b.challengerId, b.metric, b.startedAt);
    const cdProg = await progressSince(b.challengedId, b.metric, b.startedAt);

    await prisma.partnerBattle.update({
      where: { id: b.id },
      data: { challengerProgress: chProg, challengedProgress: cdProg },
    });

    const ended = b.endsAt && b.endsAt.getTime() <= Date.now();
    const chWins = chProg >= b.target;
    const cdWins = cdProg >= b.target;

    if (chWins || cdWins) {
      const winnerId = chWins && !cdWins ? b.challengerId : cdWins && !chWins ? b.challengedId : chProg >= cdProg ? b.challengerId : b.challengedId;
      await completeBattle(b.id, winnerId, false, b.stakesXp, b.challengerId, b.challengedId, locale);
    } else if (ended) {
      const tie = chProg === cdProg;
      const winnerId = tie ? null : chProg > cdProg ? b.challengerId : b.challengedId;
      await completeBattle(b.id, winnerId, tie, b.stakesXp, b.challengerId, b.challengedId, locale);
    }
  }
}

export async function acceptBattleStakes(battleId: string): Promise<void> {
  const b = await prisma.partnerBattle.findUnique({ where: { id: battleId } });
  if (!b || b.stakesDeducted) return;
  await deductStake(b.challengerId, b.stakesXp);
  await deductStake(b.challengedId, b.stakesXp);
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + BATTLE_DAYS * 86400000);
  await prisma.partnerBattle.update({
    where: { id: battleId },
    data: {
      status: "ACTIVE",
      startedAt,
      endsAt,
      stakesDeducted: true,
    },
  });
}

export function battleDurationMs(endsAt: Date | null): number {
  if (!endsAt) return 0;
  return Math.max(0, endsAt.getTime() - Date.now());
}
