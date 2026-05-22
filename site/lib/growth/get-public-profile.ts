import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { resolveLevelName } from "@/lib/growth/level-i18n";
import {
  getPartnerNetworkTree,
  type NetworkNode,
  type NetworkStats,
} from "@/lib/growth/partner-network";

export type PublicProfileBadge = {
  key: string;
  name: string;
  description: string;
  howTo: string;
  hidden: boolean;
  earned: boolean;
  grantedAt?: string | null;
};

export type PublicProfileData = {
  name: string;
  displayTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  publicSlug: string;
  referralCode: string;
  levelName: string;
  levelCode: string;
  levelOrder: number;
  currentLevelMinXp: number;
  nextLevel: { name: string; minXp: number } | null;
  totalXp: number;
  closedDeals: number;
  pendingDeals: number;
  badgeCount: number;
  earnedBadges: PublicProfileBadge[];
  allBadges: PublicProfileBadge[];
  socialLinks: Record<string, string> | null;
  profileViews: number;
  streakCurrent: number;
  streakLongest: number;
  memberDays: number;
  activityDaysCount: number;
  networkTree: NetworkNode[];
  networkStats: NetworkStats;
};

export async function getPublicProfileBySlug(
  slug: string,
  locale = "ar",
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
      streak: true,
      userBadges: {
        include: {
          badge: {
            select: { key: true, name: true, hidden: true, description: true },
          },
        },
      },
    },
  });
  if (!user?.partnerProfile || !user.publicSlug) return null;

  const [closedDeals, pendingDeals, allBadgeDefs, nextLevel, activityCount] =
    await Promise.all([
      prisma.deal.count({
        where: { partnerId: user.id, status: DealStatus.CLOSED },
      }),
      prisma.deal.count({
        where: { partnerId: user.id, status: DealStatus.PENDING },
      }),
      prisma.badgeDefinition.findMany({
        where: { hidden: false },
        orderBy: { key: "asc" },
        select: { key: true, name: true, hidden: true, description: true },
      }),
      prisma.levelDefinition.findFirst({
        where: { order: { gt: user.partnerProfile.currentLevel.order } },
        orderBy: { order: "asc" },
      }),
      prisma.userActivityDay.count({ where: { userId: user.id } }).catch(() => 0),
    ]);

  const earnedMap = new Map(
    user.userBadges.map((b) => [b.badge.key, b.grantedAt.toISOString()]),
  );

  const mapBadge = (key: string, name: string, desc: string | null, hidden: boolean, earned: boolean) => {
    const copy = resolveBadgeCopy(key, locale, { name, description: desc });
    return {
      key,
      name: copy.name,
      description: copy.description,
      howTo: copy.howTo,
      hidden,
      earned,
      grantedAt: earnedMap.get(key) ?? null,
    };
  };

  const earnedBadges = user.userBadges.map((b) =>
    mapBadge(b.badge.key, b.badge.name, b.badge.description, b.badge.hidden, true),
  );

  let socialLinks: Record<string, string> | null = null;
  const raw = user.partnerProfile.socialLinks;
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    socialLinks = raw as Record<string, string>;
  }

  const memberDays = Math.max(
    1,
    Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
  );

  const { tree: networkTree, stats: networkStats } = await getPartnerNetworkTree(user.id, {
    locale,
    maxDepth: 3,
  });

  return {
    name: user.name ?? "Partner",
    displayTitle: user.partnerProfile.displayTitle,
    bio: user.bio,
    avatarUrl: user.avatarUrl ?? user.image,
    publicSlug: user.publicSlug,
    referralCode: user.partnerProfile.referralCode,
    levelName: resolveLevelName(user.partnerProfile.currentLevel.name, locale),
    levelCode: user.partnerProfile.currentLevel.code,
    levelOrder: user.partnerProfile.currentLevel.order,
    currentLevelMinXp: user.partnerProfile.currentLevel.minXp,
    nextLevel: nextLevel
      ? {
          name: resolveLevelName(nextLevel.name, locale),
          minXp: nextLevel.minXp,
        }
      : null,
    totalXp: user.partnerProfile.totalXp,
    closedDeals,
    pendingDeals,
    badgeCount: earnedBadges.length,
    earnedBadges,
    allBadges: allBadgeDefs.map((b) =>
      mapBadge(b.key, b.name, b.description, b.hidden, earnedMap.has(b.key)),
    ),
    socialLinks,
    profileViews: user.partnerProfile.profileViews,
    streakCurrent: user.streak?.currentStreak ?? 0,
    streakLongest: user.streak?.longestStreak ?? 0,
    memberDays,
    activityDaysCount: activityCount,
    networkTree,
    networkStats,
  };
}
