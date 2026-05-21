import { prisma } from "@/lib/prisma";

const CHAIN_BONUS_XP = 50;

/** When all missions in a chainGroup are completed today, grant bonus XP once. */
export async function tryCompleteQuestChain(userId: string, chainGroup: string) {
  const missions = await prisma.missionDefinition.findMany({
    where: { active: true, chainGroup },
    select: { key: true },
  });
  if (missions.length < 2) return;

  const day = new Date().toISOString().slice(0, 10);
  const done = await prisma.userMissionDay.findMany({
    where: {
      userId,
      day,
      missionKey: { in: missions.map((m) => m.key) },
      completedAt: { not: null },
    },
  });
  if (done.length < missions.length) return;

  const marker = `chain:${chainGroup}:${day}`;
  const existing = await prisma.xpEvent.findFirst({
    where: { userId, reason: marker },
  });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.xpEvent.create({
      data: { userId, amount: CHAIN_BONUS_XP, reason: marker },
    });
    await tx.partnerProfile.update({
      where: { userId },
      data: { totalXp: { increment: CHAIN_BONUS_XP } },
    });
  });
}
