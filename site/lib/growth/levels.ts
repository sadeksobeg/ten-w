import type { PrismaClient } from "@prisma/client";

type Db = PrismaClient;

export async function countClosedDeals(db: Db, userId: string): Promise<number> {
  return db.deal.count({
    where: { partnerId: userId, status: "CLOSED" },
  });
}

export async function resolveLevelForClosedDeals(
  db: Db,
  closedCount: number,
) {
  return db.levelDefinition.findFirst({
    where: { minClosedDeals: { lte: closedCount } },
    orderBy: { order: "desc" },
  });
}

export async function syncPartnerLevel(db: Db, userId: string) {
  const profile = await db.partnerProfile.findUnique({
    where: { userId },
    include: { currentLevel: true },
  });
  if (!profile) return null;

  const closed = await countClosedDeals(db, userId);
  const next = await resolveLevelForClosedDeals(db, closed);
  if (!next) return profile;

  if (next.id !== profile.currentLevelId) {
    await db.partnerProfile.update({
      where: { userId },
      data: { currentLevelId: next.id },
    });
  }

  return db.partnerProfile.findUnique({
    where: { userId },
    include: { currentLevel: true },
  });
}
