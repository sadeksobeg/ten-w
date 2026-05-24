import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumEarningsCents } from "@/lib/growth/commission";
import { dnaSnapshotJson, parseDnaSnapshot } from "@/lib/growth/partner-card-number";

export interface DnaDimensions {
  sales: number;
  network: number;
  content: number;
  speed: number;
}

export type DnaArchetype =
  | "social_hunter"
  | "silent_analyst"
  | "content_king"
  | "network_weaver"
  | "speed_dealer"
  | "rising_star"
  | "steady_builder";

export interface DnaProfile {
  dimensions: DnaDimensions;
  archetype: DnaArchetype;
  rivalArchetype: DnaArchetype;
  weeklyChange: Partial<DnaDimensions>;
}

const RIVAL_MAP: Record<DnaArchetype, DnaArchetype> = {
  social_hunter: "silent_analyst",
  silent_analyst: "social_hunter",
  content_king: "speed_dealer",
  network_weaver: "speed_dealer",
  speed_dealer: "content_king",
  rising_star: "steady_builder",
  steady_builder: "rising_star",
};

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function topTwoKeys(d: DnaDimensions): [keyof DnaDimensions, keyof DnaDimensions] {
  const entries = (Object.entries(d) as [keyof DnaDimensions, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  return [entries[0]![0], entries[1]![0]];
}

export function resolveArchetype(
  d: DnaDimensions,
  weeklyChange: Partial<DnaDimensions>,
): DnaArchetype {
  const growing =
    (weeklyChange.sales ?? 0) +
    (weeklyChange.network ?? 0) +
    (weeklyChange.content ?? 0) +
    (weeklyChange.speed ?? 0);
  if (growing >= 15) return "rising_star";

  const avg = (d.sales + d.network + d.content + d.speed) / 4;
  const spread =
    Math.max(d.sales, d.network, d.content, d.speed) -
    Math.min(d.sales, d.network, d.content, d.speed);
  if (spread < 18 && avg >= 40) return "steady_builder";

  const [a, b] = topTwoKeys(d);
  if ((a === "network" || b === "network") && (a === "sales" || b === "sales")) {
    return "social_hunter";
  }
  if ((a === "speed" || b === "speed") && d.content < 45) return "silent_analyst";
  if ((a === "content" || b === "content") && d.content >= 55) return "content_king";
  if (d.network >= 70) return "network_weaver";
  if (d.speed >= 70) return "speed_dealer";
  if (d.content >= 55) return "content_king";
  return "steady_builder";
}

async function computeDimensions(userId: string): Promise<DnaDimensions> {
  const downlineIds = await prisma.partnerProfile.findMany({
    where: { parentUserId: userId },
    select: { userId: true },
  });
  const networkDepth =
    downlineIds.length > 0
      ? await prisma.partnerProfile.count({
          where: { parentUserId: { in: downlineIds.map((d) => d.userId) } },
        })
      : 0;

  const [closedDeals, earningsCents, directReferrals, user, profile] = await Promise.all([
      prisma.deal.count({ where: { partnerId: userId, status: DealStatus.CLOSED } }),
      sumEarningsCents(userId),
      prisma.partnerProfile.count({ where: { parentUserId: userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { marketingKitHits: true },
      }),
      prisma.partnerProfile.findUnique({
        where: { userId },
        select: { profileViews: true },
      }),
    ]);

  const closedWithDates = await prisma.deal.findMany({
    where: { partnerId: userId, status: DealStatus.CLOSED, closedAt: { not: null } },
    select: { createdAt: true, closedAt: true },
    take: 50,
    orderBy: { closedAt: "desc" },
  });

  let avgCloseDays = 0;
  if (closedWithDates.length > 0) {
    const totalDays = closedWithDates.reduce((sum, deal) => {
      const days =
        (deal.closedAt!.getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, days);
    }, 0);
    avgCloseDays = totalDays / closedWithDates.length;
  }

  const sales = clamp(closedDeals * 10 + earningsCents / 100000);
  const network = clamp(directReferrals * 15 + networkDepth * 5);
  const content = clamp(
    (user?.marketingKitHits ?? 0) * 20 + (profile?.profileViews ?? 0) / 2,
  );
  const speed =
    avgCloseDays === 0 ? 50 : clamp(Math.max(0, 100 - avgCloseDays * 3));

  return { sales, network, content, speed };
}

const SNAPSHOT_MS = 7 * 24 * 60 * 60 * 1000;

export async function calculateDnaProfile(userId: string): Promise<DnaProfile> {
  const dimensions = await computeDimensions(userId);
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: { dnaSnapshot: true, dnaSnapshotAt: true },
  });

  let weeklyChange: Partial<DnaDimensions> = {};
  const now = Date.now();
  const snapshotAt = profile?.dnaSnapshotAt?.getTime() ?? 0;
  const prev = parseDnaSnapshot(profile?.dnaSnapshot);

  if (prev && snapshotAt > 0 && now - snapshotAt >= SNAPSHOT_MS) {
    weeklyChange = {
      sales: dimensions.sales - prev.sales,
      network: dimensions.network - prev.network,
      content: dimensions.content - prev.content,
      speed: dimensions.speed - prev.speed,
    };
    await prisma.partnerProfile.update({
      where: { userId },
      data: {
        dnaSnapshot: dnaSnapshotJson(dimensions),
        dnaSnapshotAt: new Date(),
      },
    });
  } else if (!prev || snapshotAt === 0) {
    await prisma.partnerProfile.update({
      where: { userId },
      data: {
        dnaSnapshot: dnaSnapshotJson(dimensions),
        dnaSnapshotAt: new Date(),
      },
    });
  } else if (prev) {
    weeklyChange = {
      sales: dimensions.sales - prev.sales,
      network: dimensions.network - prev.network,
      content: dimensions.content - prev.content,
      speed: dimensions.speed - prev.speed,
    };
  }

  const archetype = resolveArchetype(dimensions, weeklyChange);
  return {
    dimensions,
    archetype,
    rivalArchetype: RIVAL_MAP[archetype],
    weeklyChange,
  };
}
