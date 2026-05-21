import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Criteria = {
  kind?: string;
  value?: number;
};

export type BadgeProgress = {
  current: number;
  target: number;
  labelKey: "deals" | "downlines" | "kitHits" | "unknown";
};

export async function evaluateBadgeProgress(
  badgeKey: string,
  userId: string,
): Promise<BadgeProgress | null> {
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: badgeKey },
    select: { criteria: true },
  });
  if (!badge?.criteria) return null;

  const c = badge.criteria as Criteria;
  const target = typeof c.value === "number" ? c.value : 1;

  switch (c.kind) {
    case "min_closed_deals": {
      const current = await prisma.deal.count({
        where: { partnerId: userId, status: "CLOSED" },
      });
      return { current, target, labelKey: "deals" };
    }
    case "min_downlines": {
      const current = await prisma.partnerProfile.count({
        where: { parentUserId: userId },
      });
      return { current, target, labelKey: "downlines" };
    }
    case "marketing_kit_hits": {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { marketingKitHits: true },
      });
      return { current: user?.marketingKitHits ?? 0, target, labelKey: "kitHits" };
    }
    default:
      return null;
  }
}

export async function evaluateBadgeProgressMap(
  keys: string[],
  userId: string,
): Promise<Record<string, BadgeProgress | null>> {
  const out: Record<string, BadgeProgress | null> = {};
  await Promise.all(
    keys.map(async (key) => {
      out[key] = await evaluateBadgeProgress(key, userId);
    }),
  );
  return out;
}
