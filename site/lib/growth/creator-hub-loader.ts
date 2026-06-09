import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName, VIEWER_CHAT_PROFILE_SELECT } from "@/lib/growth/chat-display";
import {
  computeCreatorCommissionBoost,
  formatCommissionPercent,
} from "@/lib/growth/creator-commission-boost";
import { CREATOR_CONSENT_VERSION, needsCreatorConsent } from "@/lib/growth/creator-consent";
import { ensureClientDiscountCode } from "@/lib/growth/ensure-partner-profile";
import { getPublicProducts } from "@/lib/growth/public-products";
import {
  canAccessCreatorLounge,
  userHasContentCreatorBadge,
  userIsCreatorRoomMember,
} from "@/lib/growth/creator-program";
import {
  countActiveCreatorBattles,
  creatorCupLeaderboard,
  currentWeekKey,
  getActiveCreatorBattle,
  getCreatorAnalyticsBenchmarks,
  getCreatorAnalyticsSeries,
  getCreatorBattleCandidates,
  getCreatorChallengeForUser,
  getCreatorDashboardMetrics,
  getCreatorPulse,
  getCreatorReferralProof,
  getCreatorUtmStats,
  getCreatorUtmWeeklySeries,
  getCreatorWeekStreak,
  getChallengeSubmissionCount,
  getFeaturedCreator,
  getViewerCreatorProfile,
  listCreatorBattleHistory,
  listCreatorDirectory,
  listCreatorStatusCards,
  listPendingBattleInvites,
  listRecentCreatorSubmissions,
  listWeekSubmissions,
  type CreatorCupRow,
} from "@/lib/growth/creator-arena";
import { listCreatorChatRooms } from "@/lib/growth/creator-chat";
import type { CreatorHubProps } from "@/components/growth/creators/CreatorHubTypes";

const EMPTY_STREAK: CreatorHubProps["weekStreak"] = {
  consecutiveWeeks: 0,
  weekSlots: [false, false, false, false, false, false, false],
};

export type CreatorHubEssentials = Pick<
  CreatorHubProps,
  | "locale"
  | "hasBadge"
  | "isRoomMember"
  | "viewer"
  | "publicSlug"
  | "pulse"
  | "metrics"
  | "statusCards"
  | "cupRows"
  | "challenge"
  | "recentSubmissions"
  | "featuredCreator"
  | "viewerRank"
  | "badges"
  | "milestones"
  | "onboarding"
  | "bio"
  | "specialty"
  | "approvalRate"
  | "needsConsent"
  | "consentVersionMismatch"
  | "consentGiven"
  | "platformReviewPending"
>;

export type CreatorHubDeferredPayload = Omit<CreatorHubProps, keyof CreatorHubEssentials>;

export const CREATOR_HUB_DEFERRED_DEFAULTS: CreatorHubDeferredPayload = {
  battleCandidates: [],
  weekSubmissions: [],
  activeBattles: 0,
  battleHistory: [],
  clientDiscountCode: null,
  commissionPercent: "10%",
  salesProducts: [],
  chatRooms: [],
  directory: [],
  analyticsSeries: [],
  utmStats: [],
  utmWeeklySeries: [],
  referralProof: { rows: [], totalCents: 0 },
  analyticsBenchmarks: { avgSubmissions: 0, avgClicks: 0 },
  weekStreak: EMPTY_STREAK,
  challengeSubmitCount: 0,
  challengeParticipantCount: 1,
  contentIdeas: [],
  activeBattle: null,
  pendingInvites: [],
};

async function approvalRateFor(userId: string): Promise<number> {
  const [approvedCount, totalCount] = await Promise.all([
    prisma.creatorSubmission.count({
      where: { userId, status: { in: ["approved", "featured"] } },
    }),
    prisma.creatorSubmission.count({ where: { userId } }),
  ]);
  return totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
}

export async function loadCreatorHubEssentials(
  userId: string,
  locale: string,
  sessionEmail: string,
  sessionName: string | null | undefined,
  cupRows?: CreatorCupRow[],
): Promise<CreatorHubEssentials> {
  const resolvedCup = cupRows ?? (await creatorCupLeaderboard(20));

  const [
    hasBadge,
    isRoomMember,
    challenge,
    user,
    arenaProfile,
    viewerProfile,
    pulse,
    statusCards,
    featuredCreator,
    recentSubmissions,
    badges,
    metrics,
    approvalRate,
  ] = await Promise.all([
    userHasContentCreatorBadge(userId),
    userIsCreatorRoomMember(userId),
    getCreatorChallengeForUser(userId, locale),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...VIEWER_CHAT_PROFILE_SELECT,
        publicSlug: true,
        partnerProfile: { select: { currentLevel: { select: { code: true } } } },
      },
    }),
    prisma.creatorArenaProfile.findUnique({ where: { userId } }),
    getViewerCreatorProfile(userId),
    getCreatorPulse(),
    listCreatorStatusCards(),
    getFeaturedCreator(),
    listRecentCreatorSubmissions(5),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { key: true, name: true, description: true } } },
    }),
    getCreatorDashboardMetrics(userId, resolvedCup),
    approvalRateFor(userId),
  ]);

  const needsConsent = needsCreatorConsent(
    arenaProfile
      ? {
          consentGiven: arenaProfile.consentGiven,
          consentVersion: arenaProfile.consentVersion,
        }
      : null,
  );

  return {
    locale,
    hasBadge,
    isRoomMember,
    publicSlug: user?.publicSlug ?? null,
    pulse,
    metrics,
    statusCards,
    cupRows: resolvedCup,
    challenge,
    featuredCreator,
    recentSubmissions,
    viewerRank: resolvedCup.find((r) => r.userId === userId)?.rank ?? null,
    badges: badges.map((b) => ({
      key: b.badge.key,
      name: b.badge.name,
      description: b.badge.description ?? undefined,
      earned: true,
    })),
    milestones: arenaProfile?.milestones ?? [],
    viewer: {
      userId,
      email: user?.email ?? sessionEmail,
      name: user?.name ?? sessionName ?? null,
      displayName: user ? resolveChatSenderName(user) : undefined,
      avatarUrl: user?.avatarUrl,
      avatarPreset: user?.avatarPreset,
      levelCode: user?.partnerProfile?.currentLevel.code ?? "STARTER",
      status: viewerProfile?.status ?? arenaProfile?.status ?? "JOINED",
    },
    onboarding: {
      profile: Boolean(user?.publicSlug),
      introduce: isRoomMember,
      challenge: Boolean(challenge?.hasSubmitted),
      firstShare: Boolean(challenge?.submissionUrl),
    },
    bio: arenaProfile?.bio ?? null,
    specialty: arenaProfile?.specialty ?? [],
    approvalRate,
    needsConsent,
    consentVersionMismatch: Boolean(
      arenaProfile?.consentGiven &&
        arenaProfile.consentVersion !== CREATOR_CONSENT_VERSION,
    ),
    consentGiven: !needsConsent,
    platformReviewPending: !arenaProfile?.platformReviewSubmittedAt,
  };
}

export async function loadCreatorHubDeferred(
  userId: string,
  locale: string,
  cupRows?: CreatorCupRow[],
): Promise<CreatorHubDeferredPayload> {
  const weekKey = currentWeekKey();
  const resolvedCup = cupRows ?? (await creatorCupLeaderboard(20));

  const [
    battleCandidates,
    weekSubmissions,
    activeBattles,
    battleHistory,
    salesProducts,
    commissionBoost,
    clientDiscountCode,
    chatRooms,
    directory,
    analyticsSeries,
    activeBattle,
    pendingInvites,
    weekStreak,
    utmStats,
    utmWeeklySeries,
    referralProof,
    analyticsBenchmarks,
    challengeSubmitCount,
    arenaProfile,
  ] = await Promise.all([
    getCreatorBattleCandidates(userId),
    listWeekSubmissions(weekKey),
    countActiveCreatorBattles(userId),
    listCreatorBattleHistory(userId, 8),
    getPublicProducts(locale),
    computeCreatorCommissionBoost(userId),
    ensureClientDiscountCode(userId),
    listCreatorChatRooms(userId),
    listCreatorDirectory(resolvedCup),
    getCreatorAnalyticsSeries(userId),
    getActiveCreatorBattle(userId),
    listPendingBattleInvites(userId),
    getCreatorWeekStreak(userId),
    getCreatorUtmStats(userId),
    getCreatorUtmWeeklySeries(userId),
    getCreatorReferralProof(userId),
    getCreatorAnalyticsBenchmarks(),
    getChallengeSubmissionCount(weekKey),
    prisma.creatorArenaProfile.findUnique({
      where: { userId },
      select: { contentIdeas: true },
    }),
  ]);

  const contentIdeas = Array.isArray(arenaProfile?.contentIdeas)
    ? (arenaProfile.contentIdeas as CreatorHubProps["contentIdeas"])
    : [];

  const battleMapped = activeBattle
    ? {
        id: activeBattle.id,
        challengerId: activeBattle.challengerId,
        challengedId: activeBattle.challengedId,
        status: activeBattle.status,
        challengerProgress: activeBattle.challengerProgress,
        challengedProgress: activeBattle.challengedProgress,
        target: activeBattle.target,
        stakesXp: activeBattle.stakesXp,
        endsAt: activeBattle.endsAt?.toISOString() ?? null,
        challengerName: resolveChatSenderName(activeBattle.challenger),
        challengedName: resolveChatSenderName(activeBattle.challenged),
      }
    : null;

  return {
    battleCandidates,
    weekSubmissions,
    activeBattles,
    battleHistory,
    clientDiscountCode,
    commissionPercent: formatCommissionPercent(commissionBoost.effectiveBps),
    salesProducts: salesProducts.map((p) => ({
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
    })),
    chatRooms,
    directory,
    analyticsSeries,
    utmStats,
    utmWeeklySeries,
    referralProof,
    analyticsBenchmarks,
    weekStreak,
    challengeSubmitCount,
    challengeParticipantCount: Math.max(directory.length, 1),
    contentIdeas,
    activeBattle: battleMapped,
    pendingInvites,
  };
}

export async function requireCreatorHubSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, reason: "unauthorized" as const };
  const hasAccess = await canAccessCreatorLounge(session.user.id);
  if (!hasAccess) return { ok: false as const, reason: "forbidden" as const };
  return {
    ok: true as const,
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name,
  };
}
