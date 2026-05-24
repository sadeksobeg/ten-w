import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listEventContactLeads } from "@/lib/growth/event-contact-assistant";
import { AdminEventContactsClient } from "@/components/growth/admin/AdminEventContactsClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ eventId?: string }>;
};

export default async function AdminEventContactsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { eventId: eventIdParam } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/growth/sign-in`);
  if (session.user.role !== "ADMIN") redirect(`/${locale}/growth`);

  const events = await prisma.growthEvent.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true },
  });

  const eventId = eventIdParam && events.some((e) => e.id === eventIdParam)
    ? eventIdParam
    : events[0]?.id;

  const [leads, t] = await Promise.all([
    eventId ? listEventContactLeads(eventId) : Promise.resolve([]),
    getTranslations("Growth.admin.eventContacts"),
  ]);

  if (events.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("pageTitle")}</h1>
        <p className="text-sm text-white/55">{t("noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-sm text-white/55">{t("hint")}</p>
      </div>
      <AdminEventContactsClient events={events} eventId={eventId!} leads={leads} />
    </div>
  );
}
