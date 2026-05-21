import type { PrismaClient } from "@prisma/client";

/** True when `npx prisma generate` has been run after Growth schema extensions. */
export function growthNotificationModelsAvailable(client: PrismaClient): boolean {
  const c = client as unknown as { notification?: { count?: unknown; findMany?: unknown } };
  return (
    typeof c.notification?.count === "function" &&
    typeof c.notification?.findMany === "function"
  );
}

export async function countNotificationsSafe(
  client: PrismaClient,
  where: Record<string, unknown>,
): Promise<number> {
  if (!growthNotificationModelsAvailable(client)) return 0;
  const c = client as unknown as {
    notification: { count: (a: { where: Record<string, unknown> }) => Promise<number> };
  };
  try {
    return await c.notification.count({ where });
  } catch {
    return 0;
  }
}

export function growthPrismaModelsAvailable(client: PrismaClient): boolean {
  const c = client as unknown as {
    missionDefinition?: { findMany?: unknown };
    userMissionDay?: { findMany?: unknown };
    activityEvent?: { findMany?: unknown; create?: unknown };
  };
  return (
    typeof c.missionDefinition?.findMany === "function" &&
    typeof c.userMissionDay?.findMany === "function" &&
    typeof c.activityEvent?.findMany === "function"
  );
}

export function leaderboardRewardModelsAvailable(client: PrismaClient): boolean {
  const c = client as unknown as {
    leaderboardRewardRule?: { findMany?: unknown };
    leaderboardGrantLog?: { findFirst?: unknown; create?: unknown };
  };
  return (
    typeof c.leaderboardRewardRule?.findMany === "function" &&
    typeof c.leaderboardGrantLog?.findFirst === "function"
  );
}

export function partnerOverrideModelsAvailable(client: PrismaClient): boolean {
  const c = client as unknown as {
    partnerCommissionOverride?: { findFirst?: unknown; deleteMany?: unknown; create?: unknown };
  };
  return typeof c.partnerCommissionOverride?.findFirst === "function";
}

type MissionDefRow = {
  key: string;
  title: string;
  xpReward: number;
  criteria: unknown;
  sortOrder: number;
};

type MissionDayRow = {
  missionKey: string;
  progress: number;
  completedAt: Date | null;
};

type ActivityRow = {
  id: string;
  headline: string;
  amountCents: number | null;
  createdAt: Date;
};

export async function fetchMissionDefinitionsSafe(client: PrismaClient): Promise<MissionDefRow[]> {
  if (!growthPrismaModelsAvailable(client)) return [];
  const c = client as unknown as {
    missionDefinition: { findMany: (a: object) => Promise<MissionDefRow[]> };
  };
  return c.missionDefinition.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function fetchUserMissionDaySafe(
  client: PrismaClient,
  userId: string,
  day: string,
): Promise<MissionDayRow[]> {
  if (!growthPrismaModelsAvailable(client)) return [];
  const c = client as unknown as {
    userMissionDay: { findMany: (a: object) => Promise<MissionDayRow[]> };
  };
  return c.userMissionDay.findMany({ where: { userId, day } });
}

export async function fetchActivityEventsSafe(client: PrismaClient, take: number): Promise<ActivityRow[]> {
  if (!growthPrismaModelsAvailable(client)) return [];
  const c = client as unknown as {
    activityEvent: { findMany: (a: object) => Promise<ActivityRow[]> };
  };
  return c.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}
