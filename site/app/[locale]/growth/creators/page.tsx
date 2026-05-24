import { redirect } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { auth } from "@/auth";
import { ContentCreatorHub } from "@/components/growth/creators/ContentCreatorHub";
import {
  userHasContentCreatorBadge,
  userIsCreatorRoomMember,
} from "@/lib/growth/creator-program";
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

  const hasBadge = await userHasContentCreatorBadge(session.user.id);
  if (!hasBadge) {
    redirect(`/${locale}/growth`);
  }

  const [isRoomMember, events] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-6 growth-page-enter">
      <ContentCreatorHub
        locale={locale}
        isRoomMember={isRoomMember}
        events={events.map((ev) => ({
          slug: ev.slug,
          title: ev.title,
          status: ev.status,
          startAt: ev.startAt.toISOString(),
          participantCount: ev._count.participants,
        }))}
      />
    </div>
  );
}
