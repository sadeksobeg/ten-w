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
  creatorCupLeaderboard,
  getCreatorChallengeForUser,
  getCreatorBattleCandidates,
  getCreatorPulse,
  listCreatorStatusCards,
} from "@/lib/growth/creator-arena";
import { resolveChatSenderName, VIEWER_CHAT_PROFILE_SELECT } from "@/lib/growth/chat-display";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function ContentCreatorsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin/creators`);
  }

  const [hasAccess, hasBadge] = await Promise.all([
    canAccessCreatorLounge(session.user.id),
    userHasContentCreatorBadge(session.user.id),
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
  ] = await Promise.all([
    userIsCreatorRoomMember(session.user.id),
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
    getCreatorChallengeForUser(session.user.id, locale),
    getCreatorBattleCandidates(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ...VIEWER_CHAT_PROFILE_SELECT, publicSlug: true },
    }),
  ]);

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
        viewer={{
          userId: session.user.id,
          email: user?.email ?? session.user.email ?? "",
          name: user?.name ?? session.user.name ?? null,
          displayName: user ? resolveChatSenderName(user) : undefined,
          avatarUrl: user?.avatarUrl,
          avatarPreset: user?.avatarPreset,
        }}
      />
    </div>
  );
}
