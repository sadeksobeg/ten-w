import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventStatus, ParticipantStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { renderMarkdownLite } from "@/lib/growth/markdown-lite";
import { JoinEventModal } from "@/components/growth/JoinEventModal";
import { EventMilestoneTimeline } from "@/components/growth/events/EventMilestoneTimeline";
import { EventChatPanel } from "@/components/growth/events/EventChatPanel";
import { EventMemberTabs } from "@/components/growth/events/EventMemberTabs";
import { EventMemberFeed } from "@/components/growth/events/EventMemberFeed";
import { EventCoverImage } from "@/components/growth/events/EventCoverImage";
import { IconChevronRight } from "@/components/growth/icons/GrowthIcons";
import { listEventPostsForMember } from "@/lib/growth/event-posts";
import { listEventContactLeads } from "@/lib/growth/event-contact-assistant";
import { resolveChatSenderName, VIEWER_CHAT_PROFILE_SELECT } from "@/lib/growth/chat-display";
import { findGrowthEventByRouteSlug } from "@/lib/growth/resolve-event";
import { normalizeEventRouteSlug } from "@/lib/growth/event-slug";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function GrowthEventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }

  const t = await getTranslations("Growth.events");
  const event = await findGrowthEventByRouteSlug(slug);
  if (!event) notFound();

  const canonicalSlug = normalizeEventRouteSlug(event.slug);
  const requestedSlug = normalizeEventRouteSlug(slug);
  if (canonicalSlug !== requestedSlug) {
    redirect(`/${locale}/growth/events/${encodeURIComponent(event.slug)}`);
  }

  const myPart = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: { eventId: event.id, userId: session.user.id },
    },
  });

  const rulesHtml = renderMarkdownLite(event.rules);
  const isMember = myPart?.status === ParticipantStatus.ACCEPTED;
  const memberPosts = isMember
    ? await listEventPostsForMember(event.id, session.user.id)
    : null;
  const contactLeads = isMember ? await listEventContactLeads(event.id) : [];
  const viewerProfile = isMember
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: VIEWER_CHAT_PROFILE_SELECT,
      })
    : null;
  const canJoin =
    !myPart &&
    (event.status === EventStatus.PUBLISHED || event.status === EventStatus.ACTIVE) &&
    (event.maxParticipants == null || event._count.participants < event.maxParticipants);

  return (
    <div className="growth-event-detail max-w-full space-y-6 overflow-x-hidden">
      <Link
        href={`/${locale}/growth/events`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
      >
        <IconChevronRight
          size={14}
          className={locale === "ar" ? "rotate-180" : ""}
          aria-hidden
        />
        {t("back")}
      </Link>

      <GlassCard className="overflow-hidden p-0">
        <div className="relative aspect-[21/9] w-full bg-black/40">
          <EventCoverImage coverImage={event.coverImage} slug={event.slug} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-black/30 to-transparent" />
        </div>
        <div className="p-6">
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

        {isMember ? (
          <div className="mt-6">
            <div className="text-sm font-semibold text-gold">{t("eventProgress")}: {myPart!.progress}%</div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gold transition-all" style={{ width: `${myPart!.progress}%` }} />
            </div>
          </div>
        ) : myPart ? (
          <p className="mt-4 text-sm text-white/55">{t("joinedLocked")}</p>
        ) : canJoin ? (
          <div className="mt-6">
            <JoinEventModal eventId={event.id} rulesHtml={rulesHtml} />
          </div>
        ) : null}
        </div>
      </GlassCard>

      {isMember ? (
        <EventMemberTabs
          chat={
            <EventChatPanel
              locale={locale}
              eventSlug={event.slug}
              viewerUserId={session.user.id}
              viewerEmail={viewerProfile?.email ?? session.user.email ?? ""}
              viewerName={viewerProfile?.name ?? session.user.name ?? null}
              viewerDisplayName={
                viewerProfile
                  ? resolveChatSenderName(viewerProfile)
                  : (session.user.email ?? "")
              }
              viewerAvatarUrl={viewerProfile?.avatarUrl ?? null}
              viewerAvatarPreset={viewerProfile?.avatarPreset ?? null}
            />
          }
          progress={
            <>
              <div className="text-sm font-semibold text-gold">
                {t("eventProgress")}: {myPart!.progress}%
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gold transition-all" style={{ width: `${myPart!.progress}%` }} />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-bold">{t("milestones")}</h3>
                <EventMilestoneTimeline
                  locale={locale}
                  currentProgress={myPart!.progress}
                  milestones={event.milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    requiredProgress: m.requiredProgress,
                    xpReward: m.xpReward,
                    reached: myPart!.progress >= m.requiredProgress,
                  }))}
                />
              </div>
            </>
          }
          posts={
            <EventMemberFeed
              eventId={event.id}
              posts={memberPosts ?? []}
              currentUserId={session.user.id}
              contactLeads={contactLeads}
            />
          }
        />
      ) : null}

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
        {isMember ? (
          <div
            className="mt-4 text-sm text-white/75"
            dangerouslySetInnerHTML={{ __html: rulesHtml }}
          />
        ) : (
          <p className="mt-3 text-sm text-white/50">{t("joinedLocked")}</p>
        )}
      </GlassCard>
    </div>
  );
}
