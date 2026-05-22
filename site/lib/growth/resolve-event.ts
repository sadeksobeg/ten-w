import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeEventRouteSlug } from "@/lib/growth/event-slug";

const EVENT_DETAIL_INCLUDE = {
  milestones: { orderBy: { order: "asc" as const } },
  _count: { select: { participants: true } },
  participants: {
    where: { status: "ACCEPTED" as const },
    take: 5,
    include: { user: { select: { name: true, image: true } } },
  },
} satisfies Prisma.GrowthEventInclude;

export type GrowthEventDetail = Prisma.GrowthEventGetPayload<{
  include: typeof EVENT_DETAIL_INCLUDE;
}>;

export async function findGrowthEventByRouteSlug(
  slugParam: string,
): Promise<GrowthEventDetail | null> {
  const slug = normalizeEventRouteSlug(slugParam);

  const exact = await prisma.growthEvent.findUnique({
    where: { slug },
    include: EVENT_DETAIL_INCLUDE,
  });
  if (exact) return exact;

  const nfd = slug.normalize("NFD");
  if (nfd !== slug) {
    const nfdHit = await prisma.growthEvent.findUnique({
      where: { slug: nfd },
      include: EVENT_DETAIL_INCLUDE,
    });
    if (nfdHit) return nfdHit;
  }

  const prefixHits = await prisma.growthEvent.findMany({
    where: { slug: { startsWith: slug } },
    take: 3,
    include: EVENT_DETAIL_INCLUDE,
  });
  if (prefixHits.length === 1) return prefixHits[0]!;

  const contained = await prisma.growthEvent.findMany({
    where: {
      OR: [{ slug: { contains: slug } }, ...(slug.length > 8 ? [{ slug: { endsWith: slug } }] : [])],
    },
    take: 3,
    include: EVENT_DETAIL_INCLUDE,
  });
  if (contained.length === 1) return contained[0]!;

  return null;
}
