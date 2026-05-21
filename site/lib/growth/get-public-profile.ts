import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicProfileData = {
  name: string;
  displayTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  referralCode: string;
  levelName: string;
  levelOrder: number;
  currentLevelMinXp: number;
  nextLevel: { name: string; minXp: number } | null;
  totalXp: number;
  closedDeals: number;
  badgeCount: number;
  earnedBadges: { key: string; name: string; hidden: boolean }[];
  allBadges: { key: string; name: string; hidden: boolean; earned: boolean }[];
  socialLinks: Record<string, string> | null;
  profileViews: number;
};

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfileData | null> {
  const user = await prisma.user.findFirst({
    where: {
      publicSlug: slug,
      isActive: true,
      role: "PARTNER",
      partnerProfile: { isNot: null },
    },
    include: {
      partnerProfile: { include: { currentLevel: true } },
      userBadges: { include: { badge: { select: { key: true, name: true, hidden: true } } } },
    },
  });
  if (!user?.partnerProfile) return null;

  const [closedDeals, allBadgeDefs, nextLevel] = await Promise.all([
    prisma.deal.count({
      where: { partnerId: user.id, status: DealStatus.CLOSED },
    }),
    prisma.badgeDefinition.findMany({
      where: { hidden: false },
      orderBy: { key: "asc" },
      select: { key: true, name: true, hidden: true },
    }),
    prisma.levelDefinition.findFirst({
      where: { minXp: { gt: user.partnerProfile.currentLevel.minXp } },
      orderBy: { minXp: "asc" },
    }),
  ]);

  const earnedKeys = new Set(user.userBadges.map((b) => b.badge.key));
  const earnedBadges = user.userBadges.map((b) => ({
    key: b.badge.key,
    name: b.badge.name,
    hidden: b.badge.hidden,
  }));

  let socialLinks: Record<string, string> | null = null;
  const raw = user.partnerProfile.socialLinks;
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    socialLinks = raw as Record<string, string>;
  }

  return {
    name: user.name ?? "Partner",
    displayTitle: user.partnerProfile.displayTitle,
    bio: user.bio,
    avatarUrl: user.avatarUrl ?? user.image,
    referralCode: user.partnerProfile.referralCode,
    levelName: user.partnerProfile.currentLevel.name,
    levelOrder: user.partnerProfile.currentLevel.order,
    currentLevelMinXp: user.partnerProfile.currentLevel.minXp,
    nextLevel: nextLevel ? { name: nextLevel.name, minXp: nextLevel.minXp } : null,
    totalXp: user.partnerProfile.totalXp,
    closedDeals,
    badgeCount: earnedBadges.length,
    earnedBadges,
    allBadges: allBadgeDefs.map((b) => ({
      key: b.key,
      name: b.name,
      hidden: b.hidden,
      earned: earnedKeys.has(b.key),
    })),
    socialLinks,
    profileViews: user.partnerProfile.profileViews,
  };
}
