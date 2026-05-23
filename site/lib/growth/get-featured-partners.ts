import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type FeaturedPartner = {
  name: string;
  publicSlug: string;
  closedDeals: number;
  levelName: string;
};

export async function getFeaturedPartners(limit = 3): Promise<FeaturedPartner[]> {
  try {
  const rows = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED },
    _count: { _all: true },
    orderBy: { _count: { partnerId: "desc" } },
    take: limit * 3,
  });

  const partners: FeaturedPartner[] = [];
  for (const row of rows) {
    if (partners.length >= limit) break;
    const user = await prisma.user.findFirst({
      where: {
        id: row.partnerId,
        publicSlug: { not: null },
        isActive: true,
        role: "PARTNER",
      },
      include: { partnerProfile: { include: { currentLevel: true } } },
    });
    if (!user?.publicSlug || !user.partnerProfile) continue;
    partners.push({
      name: user.name ?? user.email.split("@")[0] ?? "Partner",
      publicSlug: user.publicSlug,
      closedDeals: row._count._all,
      levelName: user.partnerProfile.currentLevel.name,
    });
  }
  return partners;
  } catch {
    return [];
  }
}
