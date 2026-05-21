import { DealStatus, type PrismaClient } from "@prisma/client";

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
  kind: string;
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
  try {
    return await c.activityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch {
    return [];
  }
}

export function growthEventModelsAvailable(client: PrismaClient): boolean {
  const c = client as unknown as {
    growthEvent?: { count?: unknown };
    eventParticipant?: { count?: unknown };
  };
  return (
    typeof c.growthEvent?.count === "function" &&
    typeof c.eventParticipant?.count === "function"
  );
}

export async function countGrowthEventsSafe(
  client: PrismaClient,
  where?: Record<string, unknown>,
): Promise<number> {
  if (!growthEventModelsAvailable(client)) return 0;
  const c = client as unknown as {
    growthEvent: { count: (a: { where?: Record<string, unknown> }) => Promise<number> };
  };
  try {
    return await c.growthEvent.count({ where });
  } catch {
    return 0;
  }
}

export async function countEventParticipantsSafe(
  client: PrismaClient,
  where?: Record<string, unknown>,
): Promise<number> {
  if (!growthEventModelsAvailable(client)) return 0;
  const c = client as unknown as {
    eventParticipant: { count: (a: { where?: Record<string, unknown> }) => Promise<number> };
  };
  try {
    return await c.eventParticipant.count({ where });
  } catch {
    return 0;
  }
}

export type AdminOverviewStats = {
  users: number;
  partners: number;
  closed: number;
  pending: number;
  ledgerCents: number;
  activeEvents: number;
  eventParticipants: number;
  unreadAdmin: number;
  closedThisWeek: number;
  closedPrevWeek: number;
  activityRows: ActivityRow[];
};

const EMPTY_ADMIN_OVERVIEW: AdminOverviewStats = {
  users: 0,
  partners: 0,
  closed: 0,
  pending: 0,
  ledgerCents: 0,
  activeEvents: 0,
  eventParticipants: 0,
  unreadAdmin: 0,
  closedThisWeek: 0,
  closedPrevWeek: 0,
  activityRows: [],
};

/** Admin home KPIs — never throws (logs and returns zeros on DB drift). */
export async function fetchAdminOverviewStatsSafe(
  client: PrismaClient,
  sessionUserId: string | undefined,
): Promise<AdminOverviewStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  try {
    const [
      users,
      partners,
      closed,
      pending,
      ledgerSum,
      activeEvents,
      eventParticipants,
      unreadAdmin,
      closedThisWeek,
      closedPrevWeek,
      activityRows,
    ] = await Promise.all([
      client.user.count(),
      client.partnerProfile.count(),
      client.deal.count({ where: { status: DealStatus.CLOSED } }),
      client.deal.count({ where: { status: DealStatus.PENDING } }),
      client.commissionLedger.aggregate({ _sum: { amountCents: true } }),
      countGrowthEventsSafe(client, { status: "ACTIVE" }),
      countEventParticipantsSafe(client),
      sessionUserId
        ? countNotificationsSafe(client, {
            userId: sessionUserId,
            isRead: false,
          })
        : Promise.resolve(0),
      client.deal.count({
        where: { status: DealStatus.CLOSED, closedAt: { gte: weekAgo } },
      }),
      client.deal.count({
        where: {
          status: DealStatus.CLOSED,
          closedAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
      }),
      fetchActivityEventsSafe(client, 10),
    ]);

    return {
      users,
      partners,
      closed,
      pending,
      ledgerCents: ledgerSum._sum.amountCents ?? 0,
      activeEvents,
      eventParticipants,
      unreadAdmin,
      closedThisWeek,
      closedPrevWeek,
      activityRows,
    };
  } catch (err) {
    console.error("[growth/admin] overview stats failed:", err);
    return EMPTY_ADMIN_OVERVIEW;
  }
}
