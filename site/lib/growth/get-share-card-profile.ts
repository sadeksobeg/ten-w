import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { resolveLevelName } from "@/lib/growth/level-i18n";

export type ShareCardProfile = {
  name: string;
  publicSlug: string;
  referralCode: string;
  levelName: string;
  totalXp: number;
  closedDeals: number;
  badgeCount: number;
  topBadges: string[];
};

/** Lightweight profile load for OG share cards (no network tree). */
export async function getShareCardProfileBySlug(
  slug: string,
  locale = "ar",
): Promise<ShareCardProfile | null> {
  const user = await prisma.user.findFirst({
    where: {
      publicSlug: slug,
      isActive: true,
      role: "PARTNER",
      partnerProfile: { isNot: null },
    },
    include: {
      partnerProfile: { include: { currentLevel: true } },
      _count: { select: { userBadges: true } },
      userBadges: {
        take: 5,
        orderBy: { grantedAt: "desc" },
        include: { badge: { select: { key: true, name: true } } },
      },
    },
  });
  if (!user?.partnerProfile || !user.publicSlug) return null;

  const closedDeals = await prisma.deal.count({
    where: { partnerId: user.id, status: DealStatus.CLOSED },
  });

  const topBadges = user.userBadges.slice(0, 3).map((b) => {
    const copy = resolveBadgeCopy(b.badge.key, locale, { name: b.badge.name, description: null });
    return copy.name;
  });

  return {
    name: user.name ?? "Partner",
    publicSlug: user.publicSlug,
    referralCode: user.partnerProfile.referralCode,
    levelName: resolveLevelName(user.partnerProfile.currentLevel.name, locale),
    totalXp: user.partnerProfile.totalXp,
    closedDeals,
    badgeCount: user._count.userBadges,
    topBadges,
  };
}
