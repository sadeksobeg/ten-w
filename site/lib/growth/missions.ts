import { GrowthRewardStatus, type Prisma, type PrismaClient } from "@prisma/client";
import { growthPrismaModelsAvailable } from "@/lib/growth/prisma-optional";
import { tryQueueChainBonus } from "@/lib/growth/mission-rewards";

export type MissionCriterionType = "close_deal" | "add_lead" | "referral" | "join_event";

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function criterionType(criteria: unknown): MissionCriterionType | null {
  if (typeof criteria !== "object" || criteria === null || !("type" in criteria)) {
    return null;
  }
  const t = String((criteria as { type: string }).type);
  if (t === "close_deal" || t === "add_lead" || t === "referral" || t === "join_event") {
    return t;
  }
  return null;
}

export function missionTargetFromCriteria(criteria: unknown): number {
  if (typeof criteria !== "object" || criteria === null || !("count" in criteria)) {
    return 1;
  }
  const n = Number((criteria as { count: number }).count);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function applyMissionProgress(
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  eventType: MissionCriterionType,
  delta = 1,
): Promise<void> {
  if (!growthPrismaModelsAvailable(db as PrismaClient)) {
    return;
  }
  const day = utcDayKey();
  const missions = (await (
    db as unknown as {
      missionDefinition: {
        findMany: (a: object) => Promise<
          { key: string; xpReward: number; criteria: unknown; chainGroup?: string | null }[]
        >;
      };
    }
  ).missionDefinition.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })) as { key: string; xpReward: number; criteria: unknown; chainGroup: string | null }[];

  const completedChains = new Set<string>();

  for (const m of missions) {
    const ct = criterionType(m.criteria);
    if (ct !== eventType) continue;
    const target = missionTargetFromCriteria(m.criteria);

    const row = await db.userMissionDay.upsert({
      where: {
        userId_missionKey_day: { userId, missionKey: m.key, day },
      },
      create: {
        userId,
        missionKey: m.key,
        day,
        progress: 0,
      },
      update: {},
    });

    if (row.completedAt) continue;

    const next = Math.min(target, row.progress + delta);
    await db.userMissionDay.update({
      where: { id: row.id },
      data: { progress: next },
    });

    if (next < target) continue;

    const xp = m.xpReward;
    await db.userMissionDay.update({
      where: { id: row.id },
      data: {
        completedAt: new Date(),
        progress: target,
        rewardStatus: xp > 0 ? GrowthRewardStatus.PENDING : GrowthRewardStatus.APPROVED,
        rewardXp: xp > 0 ? xp : null,
      },
    });

    if (m.chainGroup) completedChains.add(m.chainGroup);
  }

  if (completedChains.size > 0) {
    for (const g of completedChains) {
      await tryQueueChainBonus(userId, g);
    }
  }
}
