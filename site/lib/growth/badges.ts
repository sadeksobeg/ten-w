import type { PrismaClient } from "@prisma/client";

type Db = PrismaClient;

async function grantIfMissing(
  db: Db,
  userId: string,
  badgeKey: string,
  grantedById?: string | null,
) {
  const badge = await db.badgeDefinition.findUnique({ where: { key: badgeKey } });
  if (!badge) return;

  await db.userBadge.upsert({
    where: {
      userId_badgeId: { userId, badgeId: badge.id },
    },
    create: {
      userId,
      badgeId: badge.id,
      grantedById: grantedById ?? null,
    },
    update: {},
  });
}

export async function evaluateAutoBadgesForUser(db: Db, userId: string) {
  const closed = await db.deal.count({
    where: { partnerId: userId, status: "CLOSED" },
  });

  const downlines = await db.partnerProfile.count({
    where: { parentUserId: userId },
  });

  const user = await db.user.findUnique({ where: { id: userId } });
  const kitHits = user?.marketingKitHits ?? 0;

  if (closed >= 1) await grantIfMissing(db, userId, "first_deal");
  if (closed >= 5) await grantIfMissing(db, userId, "deals_5");
  if (closed >= 10) await grantIfMissing(db, userId, "deals_10");
  if (downlines >= 1) await grantIfMissing(db, userId, "first_referral");
  if (downlines >= 3) await grantIfMissing(db, userId, "network_builder");
  if (kitHits >= 3) await grantIfMissing(db, userId, "ai_seller");
}

export async function grantFastCloserIfEligible(
  db: Db,
  userId: string,
  createdAt: Date,
  closedAt: Date,
) {
  const ms = closedAt.getTime() - createdAt.getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours <= 24) {
    await grantIfMissing(db, userId, "fast_closer");
  }
}

export async function grantAdminBadge(
  db: Db,
  userId: string,
  badgeKey: string,
  granterId: string,
) {
  await grantIfMissing(db, userId, badgeKey, granterId);
}
