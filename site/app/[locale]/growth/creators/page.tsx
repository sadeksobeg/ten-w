import { redirect } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { auth } from "@/auth";
import { ContentCreatorHub } from "@/components/growth/creators/ContentCreatorHub";
import {
  canAccessCreatorLounge,
  userHasContentCreatorBadge,
  userIsCreatorRoomMember,
} from "@/lib/growth/creator-program";
import {
  countActiveCreatorBattles,
  creatorCupLeaderboard,
  getCreatorChallengeForUser,
  getCreatorBattleCandidates,
  getCreatorPulse,
  getFeaturedCreator,
  getViewerCreatorProfile,
  listCreatorBattleHistory,
  listRecentCreatorSubmissions,
  listCreatorStatusCards,
} from "@/lib/growth/creator-arena";
import { resolveChatSenderName, VIEWER_CHAT_PROFILE_SELECT } from "@/lib/growth/chat-display";
import {
  computeCreatorCommissionBoost,
  formatCommissionPercent,
} from "@/lib/growth/creator-commission-boost";
import { ensureClientDiscountCode } from "@/lib/growth/ensure-partner-profile";
import { getPublicProducts } from "@/lib/growth/public-products";
import { prisma } from "@/lib/prisma";

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

  const [
    isRoomMember,
    events,
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
  ] = await Promise.all([
    userIsCreatorRoomMember(userId),
    prisma.growthEvent.findMany({
      where: {
        status: { in: [EventStatus.PUBLISHED, EventStatus.ACTIVE] },
      },
      orderBy: { startAt: "asc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        status: true,
        startAt: true,
        _count: { select: { participants: true } },
      },
    }),
    getCreatorPulse(),
    listCreatorStatusCards(),
    creatorCupLeaderboard(10),
    getCreatorChallengeForUser(userId, locale),
    getCreatorBattleCandidates(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { ...VIEWER_CHAT_PROFILE_SELECT, publicSlug: true },
    }),
    listRecentCreatorSubmissions(3),
    getFeaturedCreator(),
    getViewerCreatorProfile(userId),
    countActiveCreatorBattles(userId),
    listCreatorBattleHistory(userId, 5),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { key: true, name: true, description: true } } },
    }),
    getPublicProducts(locale),
    computeCreatorCommissionBoost(userId),
    ensureClientDiscountCode(userId),
  ]);

  const viewerRank = cupRows.find((r) => r.userId === userId)?.rank ?? null;

  const badgeItems = badges.map((b) => ({
    key: b.badge.key,
    name: b.badge.name,
    description: b.badge.description ?? undefined,
    earned: true,
  }));

  return (
    <div className="space-y-6 growth-page-enter">
      <ContentCreatorHub
        locale={locale}
        hasBadge={hasBadge}
        isRoomMember={isRoomMember}
        events={events.map((ev) => ({
          slug: ev.slug,
          title: ev.title,
          status: ev.status,
          startAt: ev.startAt.toISOString(),
          participantCount: ev._count.participants,
        }))}
        pulse={pulse}
        statusCards={statusCards}
        cupRows={cupRows}
        challenge={challenge}
        battleCandidates={battleCandidates}
        publicSlug={user?.publicSlug ?? null}
        recentSubmissions={recentSubmissions}
        featuredCreator={featuredCreator}
        viewerProfile={viewerProfile}
        viewerRank={viewerRank}
        activeBattles={activeBattles}
        battleHistory={battleHistory}
        badges={badgeItems}
        viewer={{
          userId,
          email: user?.email ?? session.user.email ?? "",
          name: user?.name ?? session.user.name ?? null,
          displayName: user ? resolveChatSenderName(user) : undefined,
          avatarUrl: user?.avatarUrl,
          avatarPreset: user?.avatarPreset,
        }}
        clientDiscountCode={clientDiscountCode}
        commissionPercent={formatCommissionPercent(commissionBoost.effectiveBps)}
        salesProducts={salesProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          priceCents: p.priceCents,
        }))}
      />
    </div>
  );
}
