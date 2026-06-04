import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBadgeDisplay } from "@/lib/growth/badge-display";
import { resolveLevelName } from "@/lib/growth/level-i18n";
import { calculateDnaProfile, type DnaProfile } from "@/lib/growth/dna-score";
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
  userId: string;
  name: string;
  displayTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarPreset: string | null;
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
  showcasedBadges: string[];
  earnedBadgeKeys: string[];
  publicActivity: { headline: string; createdAt: string }[];
  cardNumber: number | null;
  dnaProfile: DnaProfile;
  oath: string | null;
  oathDate: string | null;
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

  const publicKinds = ["level_up", "deal_closed", "badge_earned", "manual_bonus"] as const;

  const [closedDeals, pendingDeals, allBadgeDefs, nextLevel, activityCount, publicActivityRows] =
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
      prisma.activityEvent
        .findMany({
          where: { actorUserId: user.id, kind: { in: [...publicKinds] } },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { headline: true, createdAt: true },
        })
        .catch(() => []),
    ]);

  const earnedMap = new Map(
    user.userBadges.map((b) => [b.badge.key, b.grantedAt.toISOString()]),
  );

  const mapBadge = (key: string, name: string, desc: string | null, hidden: boolean, earned: boolean) => {
    const display = getBadgeDisplay(key, locale, {
      earned,
      hidden,
      dbFallback: { name, description: desc },
    });
    return {
      key,
      name: display.secret ? name : display.name,
      description: display.secret ? "" : display.description,
      howTo: display.howTo,
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

  let networkTree: NetworkNode[] = [];
  let networkStats: NetworkStats = { directCount: 0, totalCount: 0, maxDepth: 0 };
  try {
    const net = await getPartnerNetworkTree(user.id, { locale, maxDepth: 3 });
    networkTree = net.tree;
    networkStats = net.stats;
  } catch (err) {
    console.error("[getPublicProfile] network tree", err);
  }

  const dnaProfile = await calculateDnaProfile(user.id);

  return {
    userId: user.id,
    name: user.name ?? "Partner",
    displayTitle: user.partnerProfile.displayTitle,
    bio: user.bio,
    avatarUrl: user.avatarUrl ?? user.image,
    avatarPreset: user.avatarPreset ?? null,
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
    showcasedBadges: user.partnerProfile.showcasedBadges ?? [],
    earnedBadgeKeys: user.userBadges.map((b) => b.badge.key),
    publicActivity: publicActivityRows.map((e) => ({
      headline: e.headline,
      createdAt: e.createdAt.toISOString(),
    })),
    cardNumber: user.partnerProfile.cardNumber,
    dnaProfile,
    oath: user.partnerProfile.oath,
    oathDate: user.partnerProfile.oathDate?.toISOString() ?? null,
  };
}
