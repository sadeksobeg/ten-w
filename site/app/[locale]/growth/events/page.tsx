import { redirect } from "next/navigation";
import { EventStatus, ParticipantStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { EventsHubTabs } from "@/components/growth/events/EventsHubTabs";
import { type EventCardData } from "@/components/growth/events/EventCard";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthEventsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin/events`);
  }

  const t = await getTranslations("Growth.events");

  const [events, participations, eventNotifs] = await Promise.all([
    prisma.growthEvent.findMany({
      where: { status: { in: [EventStatus.PUBLISHED, EventStatus.ACTIVE, EventStatus.COMPLETED] } },
      orderBy: { startAt: "desc" },
      include: {
        _count: { select: { participants: true, milestones: true } },
        milestones: { select: { xpReward: true } },
      },
    }),
    prisma.eventParticipant.findMany({
      where: { userId: session.user.id },
      select: { eventId: true, status: true, progress: true },
    }),
    prisma.eventNotification.findMany({
      where: { notification: { userId: session.user.id } },
      select: { eventId: true },
    }),
  ]);

  const partMap = new Map(participations.map((p) => [p.eventId, p]));

  function toCard(ev: (typeof events)[0]): EventCardData {
    const p = partMap.get(ev.id);
    return {
      slug: ev.slug,
      title: ev.title,
      description: ev.description,
      coverImage: ev.coverImage,
      status: ev.status,
      statusLabel: t(`status.${ev.status}` as "status.PUBLISHED"),
      startAt: ev.startAt.toISOString(),
      endAt: ev.endAt?.toISOString() ?? null,
      participantCount: ev._count.participants,
      milestoneCount: ev._count.milestones,
      totalXp: ev.milestones.reduce((s, m) => s + m.xpReward, 0),
      progress: p?.progress,
      joined: !!p,
      completed: p?.status === ParticipantStatus.COMPLETED,
      locale,
    };
  }

  const allCards = events.map(toCard);
  const invitedSlugs = events
    .filter((ev) => {
      const hasNotif = eventNotifs.some((n) => n.eventId === ev.id);
      const part = partMap.get(ev.id);
      return hasNotif && !part;
    })
    .map((ev) => ev.slug);

  const joinedSlugs = participations
    .filter(
      (p) =>
        p.status === ParticipantStatus.ACCEPTED &&
        (p.progress == null || p.progress < 100),
    )
    .map((p) => events.find((e) => e.id === p.eventId)?.slug)
    .filter((s): s is string => !!s);

  const completedSlugs = participations
    .filter((p) => p.status === ParticipantStatus.COMPLETED)
    .map((p) => events.find((e) => e.id === p.eventId)?.slug)
    .filter((s): s is string => !!s);

  if (allCards.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title={t("title")} />
        <EmptyState illustration="calendar" message={t("empty")} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader title={t("title")} />
      <EventsHubTabs
        all={allCards}
        invitedSlugs={invitedSlugs}
        joinedSlugs={joinedSlugs}
        completedSlugs={completedSlugs}
        labels={{
          join: t("joinEvent"),
          progress: t("eventProgress"),
          view: t("viewDetails"),
        }}
      />
    </div>
  );
}
