import { EventStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { CreateEventForm } from "@/components/growth/admin/EventAdminForms";
import {
  adminUpdateEventStatusFormAction,
  adminUpdateParticipantProgressFormAction,
} from "@/lib/growth/actions";

export default async function GrowthAdminEventsPage() {
  const t = await getTranslations("Growth.admin.events");

  const events = await prisma.growthEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true, milestones: true } },
      participants: {
        take: 8,
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("createTitle")}</h2>
        <div className="mt-5">
          <CreateEventForm />
        </div>
      </GlassCard>

      <div className="space-y-4">
        {events.map((ev) => (
          <GlassCard key={ev.id} className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold">{ev.title}</div>
                <div className="mt-1 text-xs text-white/45">
                  {ev.slug} · {ev.status} · {ev._count.participants} {t("participants")}
                </div>
                <div className="mt-1 text-xs text-white/45">
                  {new Date(ev.startAt).toLocaleString()}
                  {ev.endAt ? ` — ${new Date(ev.endAt).toLocaleString()}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    EventStatus.PUBLISHED,
                    EventStatus.ACTIVE,
                    EventStatus.COMPLETED,
                    EventStatus.CANCELLED,
                  ] as const
                ).map((st) => (
                  <form key={st} action={adminUpdateEventStatusFormAction}>
                    <input type="hidden" name="eventId" value={ev.id} />
                    <input type="hidden" name="status" value={st} />
                    <button
                      type="submit"
                      className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/70 hover:border-gold/30"
                    >
                      → {st}
                    </button>
                  </form>
                ))}
              </div>
            </div>
            {ev.participants.length > 0 ? (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {ev.participants.map((p) => (
                  <form
                    key={p.id}
                    action={adminUpdateParticipantProgressFormAction}
                    className="flex flex-wrap items-center gap-2 text-xs"
                  >
                    <input type="hidden" name="eventId" value={ev.id} />
                    <input type="hidden" name="userId" value={p.userId} />
                    <span className="text-white/70">{p.user.name ?? p.user.email}</span>
                    <span className="text-white/40">{p.progress}%</span>
                    <input
                      name="progress"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={p.progress}
                      className="w-16 rounded border border-white/10 bg-black/30 px-2 py-1 text-white"
                    />
                    <button type="submit" className="text-gold">
                      {t("updateProgress")}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
