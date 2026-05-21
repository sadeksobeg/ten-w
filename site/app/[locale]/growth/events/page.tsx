import Link from "next/link";
import { redirect } from "next/navigation";
import { EventStatus, ParticipantStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/ui/GlassCard";
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

  const [events, participations] = await Promise.all([
    prisma.growthEvent.findMany({
      where: { status: { in: [EventStatus.PUBLISHED, EventStatus.ACTIVE, EventStatus.COMPLETED] } },
      orderBy: { startAt: "desc" },
      include: { _count: { select: { participants: true } } },
    }),
    prisma.eventParticipant.findMany({
      where: { userId: session.user.id },
      select: { eventId: true, status: true, progress: true },
    }),
  ]);

  const partMap = new Map(participations.map((p) => [p.eventId, p]));

  const invited = events.filter((ev) => {
    const joined = partMap.has(ev.id);
    if (joined) return false;
    return ev.status === EventStatus.PUBLISHED || ev.status === EventStatus.ACTIVE;
  });

  const joined = events.filter((ev) => {
    const p = partMap.get(ev.id);
    return p && p.status !== ParticipantStatus.COMPLETED;
  });

  const completed = events.filter((ev) => {
    const p = partMap.get(ev.id);
    return p?.status === ParticipantStatus.COMPLETED || ev.status === EventStatus.COMPLETED;
  });

  function EventCard({ ev, progress }: { ev: (typeof events)[0]; progress?: number }) {
    return (
      <GlassCard className="p-4">
        <div className="text-sm font-bold">{ev.title}</div>
        <p className="mt-2 line-clamp-2 text-xs text-white/55">{ev.description}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/40">
          <span>{ev.status}</span>
          <span>
            {ev._count.participants}
            {ev.maxParticipants ? ` / ${ev.maxParticipants}` : ""} {t("participants")}
          </span>
        </div>
        {progress != null ? (
          <div className="mt-3">
            <div className="text-xs text-white/50">{t("eventProgress")}: {progress}%</div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}
        <Link
          href={`/${locale}/growth/events/${ev.slug}`}
          className="mt-4 inline-flex text-xs font-semibold text-gold hover:underline"
        >
          {t("viewDetails")}
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>

      {invited.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold text-gold/90">{t("invited")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {invited.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      ) : null}

      {joined.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold text-white/80">{t("joined")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {joined.map((ev) => (
              <EventCard key={ev.id} ev={ev} progress={partMap.get(ev.id)?.progress} />
            ))}
          </div>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold text-white/55">{t("completed")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((ev) => (
              <EventCard key={ev.id} ev={ev} progress={partMap.get(ev.id)?.progress ?? 100} />
            ))}
          </div>
        </section>
      ) : null}

      {events.length === 0 ? <p className="text-sm text-white/55">{t("empty")}</p> : null}
    </div>
  );
}
