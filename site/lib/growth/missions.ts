import type { Prisma, PrismaClient } from "@prisma/client";
import { growthPrismaModelsAvailable } from "@/lib/growth/prisma-optional";

export type MissionCriterionType = "close_deal" | "add_lead" | "referral";

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function criterionType(criteria: unknown): MissionCriterionType | null {
  if (typeof criteria !== "object" || criteria === null || !("type" in criteria)) {
    return null;
  }
  const t = String((criteria as { type: string }).type);
  if (t === "close_deal" || t === "add_lead" || t === "referral") return t;
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
  const missions = await (
    db as unknown as { missionDefinition: { findMany: (a: object) => Promise<{ key: string; xpReward: number; criteria: unknown }[]> } }
  ).missionDefinition.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

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

    await db.userMissionDay.update({
      where: { id: row.id },
      data: { completedAt: new Date(), progress: target },
    });

    const xp = m.xpReward;
    if (xp <= 0) continue;

    await db.xpEvent.create({
      data: {
        userId,
        amount: xp,
        reason: `mission:${m.key}`,
      },
    });
    await db.partnerProfile.update({
      where: { userId },
      data: { totalXp: { increment: xp } },
    });
  }
}
