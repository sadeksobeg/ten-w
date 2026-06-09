import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContentCreatorHub } from "@/components/growth/creators/ContentCreatorHub";
import type { CreatorHubProps } from "@/components/growth/creators/CreatorHubTypes";
import {
  canAccessCreatorLounge,
  ensureCreatorChannels,
  userHasContentCreatorBadge,
  userIsCreatorRoomMember,
} from "@/lib/growth/creator-program";
import {
  countActiveCreatorBattles,
  creatorCupLeaderboard,
  currentWeekKey,
  getActiveCreatorBattle,
  getCreatorChallengeForUser,
  getCreatorBattleCandidates,
  getCreatorDashboardMetrics,
  getCreatorPulse,
  getCreatorAnalyticsSeries,
  getCreatorAnalyticsBenchmarks,
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
} from "@/lib/growth/creator-arena";
import { listCreatorChatRooms } from "@/lib/growth/creator-chat";
import { resolveChatSenderName, VIEWER_CHAT_PROFILE_SELECT } from "@/lib/growth/chat-display";
import {
  computeCreatorCommissionBoost,
  formatCommissionPercent,
} from "@/lib/growth/creator-commission-boost";
import { ensureClientDiscountCode } from "@/lib/growth/ensure-partner-profile";
import { getPublicProducts } from "@/lib/growth/public-products";
import { prisma } from "@/lib/prisma";
import { CREATOR_CONSENT_VERSION, needsCreatorConsent } from "@/lib/growth/creator-consent";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function ContentCreatorsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { preview } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN" && preview !== "lounge") {
    redirect(`/${locale}/growth/admin/creators`);
  }

  const userId = session.user.id;
  const [hasAccess, hasBadge] = await Promise.all([
    canAccessCreatorLounge(userId),
    userHasContentCreatorBadge(userId),
  ]);
  if (!hasAccess) {
    redirect(`/${locale}/growth`);
  }

  await ensureCreatorChannels();

  const weekKey = currentWeekKey();

  const [
    isRoomMember,
    pulse,
    statusCards,
    cupRows,
    challenge,
    battleCandidates,
    user,
    recentSubmissions,
    featuredCreator,
    viewerProfile,
    activeBattles,
    battleHistory,
    badges,
    salesProducts,
    commissionBoost,
    clientDiscountCode,
    metrics,
    chatRooms,
    directory,
    analyticsSeries,
    weekSubmissions,
    activeBattle,
    pendingInvites,
    arenaProfile,
    weekStreak,
    utmStats,
    utmWeeklySeries,
    referralProof,
    analyticsBenchmarks,
    challengeSubmitCount,
  ] = await Promise.all([
    userIsCreatorRoomMember(userId),
    getCreatorPulse(),
    listCreatorStatusCards(),
    creatorCupLeaderboard(20),
    getCreatorChallengeForUser(userId, locale),
    getCreatorBattleCandidates(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...VIEWER_CHAT_PROFILE_SELECT,
        publicSlug: true,
        partnerProfile: { select: { currentLevel: { select: { code: true } } } },
      },
    }),
    listRecentCreatorSubmissions(5),
    getFeaturedCreator(),
    getViewerCreatorProfile(userId),
    countActiveCreatorBattles(userId),
    listCreatorBattleHistory(userId, 8),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { key: true, name: true, description: true } } },
    }),
    getPublicProducts(locale),
    computeCreatorCommissionBoost(userId),
    ensureClientDiscountCode(userId),
    getCreatorDashboardMetrics(userId),
    listCreatorChatRooms(userId),
    listCreatorDirectory(),
    getCreatorAnalyticsSeries(userId),
    listWeekSubmissions(weekKey),
    getActiveCreatorBattle(userId),
    listPendingBattleInvites(userId),
    prisma.creatorArenaProfile.findUnique({ where: { userId } }),
    getCreatorWeekStreak(userId),
    getCreatorUtmStats(userId),
    getCreatorUtmWeeklySeries(userId),
    getCreatorReferralProof(userId),
    getCreatorAnalyticsBenchmarks(),
    getChallengeSubmissionCount(weekKey),
  ]);

  const viewerRank = cupRows.find((r) => r.userId === userId)?.rank ?? null;
  const approvedCount = await prisma.creatorSubmission.count({
    where: { userId, status: { in: ["approved", "featured"] } },
  });
  const totalCount = await prisma.creatorSubmission.count({ where: { userId } });
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const contentIdeas = Array.isArray(arenaProfile?.contentIdeas)
    ? (arenaProfile!.contentIdeas as CreatorHubProps["contentIdeas"])
    : [];

  const needsConsent = needsCreatorConsent(
    arenaProfile
      ? {
          consentGiven: arenaProfile.consentGiven,
          consentVersion: arenaProfile.consentVersion,
        }
      : null,
  );
  const consentVersionMismatch = Boolean(
    arenaProfile?.consentGiven &&
      arenaProfile.consentVersion !== CREATOR_CONSENT_VERSION,
  );

  const badgeItems = badges.map((b) => ({
    key: b.badge.key,
    name: b.badge.name,
    description: b.badge.description ?? undefined,
    earned: true,
  }));

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

  return (
    <div className="growth-creator-hub-page growth-page-enter">
      <ContentCreatorHub
        locale={locale}
        hasBadge={hasBadge}
        isRoomMember={isRoomMember}
        pulse={pulse}
        metrics={metrics}
        statusCards={statusCards}
        cupRows={cupRows}
        challenge={challenge}
        battleCandidates={battleCandidates}
        publicSlug={user?.publicSlug ?? null}
        recentSubmissions={recentSubmissions}
        weekSubmissions={weekSubmissions}
        featuredCreator={featuredCreator}
        viewerRank={viewerRank}
        activeBattles={activeBattles}
        battleHistory={battleHistory}
        badges={badgeItems}
        milestones={arenaProfile?.milestones ?? []}
        viewer={{
          userId,
          email: user?.email ?? session.user.email ?? "",
          name: user?.name ?? session.user.name ?? null,
          displayName: user ? resolveChatSenderName(user) : undefined,
          avatarUrl: user?.avatarUrl,
          avatarPreset: user?.avatarPreset,
          levelCode: user?.partnerProfile?.currentLevel.code ?? "STARTER",
          status: viewerProfile?.status ?? arenaProfile?.status ?? "JOINED",
        }}
        clientDiscountCode={clientDiscountCode}
        commissionPercent={formatCommissionPercent(commissionBoost.effectiveBps)}
        salesProducts={salesProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          priceCents: p.priceCents,
        }))}
        chatRooms={chatRooms}
        directory={directory}
        analyticsSeries={analyticsSeries}
        utmStats={utmStats}
        utmWeeklySeries={utmWeeklySeries}
        referralProof={referralProof}
        analyticsBenchmarks={analyticsBenchmarks}
        weekStreak={weekStreak}
        challengeSubmitCount={challengeSubmitCount}
        challengeParticipantCount={Math.max(directory.length, 1)}
        contentIdeas={contentIdeas}
        onboarding={{
          profile: Boolean(user?.publicSlug),
          introduce: isRoomMember,
          challenge: Boolean(challenge?.hasSubmitted),
          firstShare: Boolean(challenge?.submissionUrl),
        }}
        bio={arenaProfile?.bio ?? null}
        specialty={arenaProfile?.specialty ?? []}
        activeBattle={battleMapped}
        pendingInvites={pendingInvites}
        approvalRate={approvalRate}
        needsConsent={needsConsent}
        consentVersionMismatch={consentVersionMismatch}
        consentGiven={!needsConsent}
        platformReviewPending={!arenaProfile?.platformReviewSubmittedAt}
      />
    </div>
  );
}
