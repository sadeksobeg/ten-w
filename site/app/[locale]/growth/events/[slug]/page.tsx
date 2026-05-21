import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { renderMarkdownLite } from "@/lib/growth/markdown-lite";
import { JoinEventModal } from "@/components/growth/JoinEventModal";
import { EventMilestoneTimeline } from "@/components/growth/events/EventMilestoneTimeline";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function GrowthEventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }

  const t = await getTranslations("Growth.events");
  const event = await prisma.growthEvent.findUnique({
    where: { slug },
    include: {
      milestones: { orderBy: { order: "asc" } },
      _count: { select: { participants: true } },
      participants: {
        where: { status: "ACCEPTED" },
        take: 5,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
  if (!event) notFound();

  const myPart = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: { eventId: event.id, userId: session.user.id },
    },
  });

  const rulesHtml = renderMarkdownLite(event.rules);
  const canJoin =
    !myPart &&
    (event.status === EventStatus.PUBLISHED || event.status === EventStatus.ACTIVE) &&
    (event.maxParticipants == null || event._count.participants < event.maxParticipants);

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/growth/events`} className="text-xs text-gold hover:underline">
        ← {t("back")}
      </Link>

      <GlassCard className="p-6">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{event.title}</h1>
        <p className="mt-3 text-sm text-white/70">{event.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/45">
          <span>{t(`status.${event.status}` as "status.PUBLISHED")}</span>
          <span>{new Date(event.startAt).toLocaleString()}</span>
          {event.endAt ? <span>→ {new Date(event.endAt).toLocaleString()}</span> : null}
          <span>
            {event._count.participants}
            {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} {t("participants")}
          </span>
        </div>

        {myPart ? (
          <div className="mt-6">
            <div className="text-sm font-semibold text-gold">{t("eventProgress")}: {myPart.progress}%</div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gold transition-all" style={{ width: `${myPart.progress}%` }} />
            </div>
          </div>
        ) : canJoin ? (
          <div className="mt-6">
            <JoinEventModal eventId={event.id} rulesHtml={rulesHtml} />
          </div>
        ) : null}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-lg font-bold">{t("milestones")}</h2>
        <div className="mt-4">
          <EventMilestoneTimeline
            locale={locale}
            currentProgress={myPart?.progress ?? 0}
            milestones={event.milestones.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              requiredProgress: m.requiredProgress,
              xpReward: m.xpReward,
              reached: (myPart?.progress ?? 0) >= m.requiredProgress,
            }))}
          />
        </div>
      </GlassCard>

      {event.participants.length > 0 ? (
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold">{t("participantsPreview")}</h2>
          <div className="mt-3 flex -space-x-2">
            {event.participants.map((p) => (
              <div
                key={p.id}
                className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-gold/20 text-xs font-bold"
                title={p.user.name ?? ""}
              >
                {(p.user.name ?? "?")[0]}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="p-6">
        <h2 className="text-lg font-bold">{t("rulesTitle")}</h2>
        <div
          className="mt-4 text-sm text-white/75"
          dangerouslySetInnerHTML={{ __html: rulesHtml }}
        />
      </GlassCard>
    </div>
  );
}
