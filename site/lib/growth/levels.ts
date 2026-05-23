import { NotificationType, type PrismaClient } from "@prisma/client";
import { createNotification } from "@/lib/growth/notify";
import { logActivityEvent } from "@/lib/growth/activity";

type Db = PrismaClient;

type PartnerProfileWithLevel = {
  currentLevel: { id: string; name: string; code: string; order: number };
} | null;

export type SyncPartnerLevelResult = {
  profile: PartnerProfileWithLevel;
  levelChanged: boolean;
  previousLevelName: string | null;
  newLevelName: string | null;
};

export async function countClosedDeals(db: Db, userId: string): Promise<number> {
  return db.deal.count({
    where: { partnerId: userId, status: "CLOSED" },
  });
}

/** Highest level where closed-deals OR total XP threshold is met. */
export async function resolveLevelForPartner(
  db: Db,
  closedCount: number,
  totalXp: number,
) {
  return db.levelDefinition.findFirst({
    where: {
      OR: [{ minClosedDeals: { lte: closedCount } }, { minXp: { lte: totalXp } }],
    },
    orderBy: { order: "desc" },
  });
}

/** @deprecated Use resolveLevelForPartner — kept for callers that only have deal count. */
export async function resolveLevelForClosedDeals(db: Db, closedCount: number) {
  return db.levelDefinition.findFirst({
    where: { minClosedDeals: { lte: closedCount } },
    orderBy: { order: "desc" },
  });
}

export async function syncPartnerLevel(
  db: Db,
  userId: string,
  opts?: { notifyLevelUp?: boolean },
): Promise<SyncPartnerLevelResult> {
  const notify = opts?.notifyLevelUp !== false;

  const profile = await db.partnerProfile.findUnique({
    where: { userId },
    include: { currentLevel: true },
  });
  if (!profile) {
    return {
      profile: null,
      levelChanged: false,
      previousLevelName: null,
      newLevelName: null,
    };
  }

  const closed = await countClosedDeals(db, userId);
  const next = await resolveLevelForPartner(db, closed, profile.totalXp);
  if (!next) {
    return {
      profile,
      levelChanged: false,
      previousLevelName: profile.currentLevel.name,
      newLevelName: profile.currentLevel.name,
    };
  }

  const previousLevelName = profile.currentLevel.name;
  const levelChanged = next.id !== profile.currentLevelId;

  if (levelChanged) {
    await db.partnerProfile.update({
      where: { userId },
      data: { currentLevelId: next.id },
    });

    if (notify) {
      await createNotification(db, {
        userId,
        type: NotificationType.LEVEL_UP,
        title: "ترقية مستوى",
        body: `مستواك الآن: ${next.name}`,
        link: "/growth",
        metadata: { levelId: next.id, levelName: next.name, previousLevelName },
      });

      await logActivityEvent(db, {
        kind: "level_up",
        actorUserId: userId,
        headline: `Level up: ${previousLevelName} → ${next.name}`,
        metadata: { previousLevelName, newLevelName: next.name },
      });
    }
  }

  const updated = await db.partnerProfile.findUnique({
    where: { userId },
    include: { currentLevel: true },
  });

  return {
    profile: updated,
    levelChanged,
    previousLevelName,
    newLevelName: next.name,
  };
}
