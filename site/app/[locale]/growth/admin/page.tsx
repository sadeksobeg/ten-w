import { DealStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GrowthAdminHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Growth");
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";

  const session = await auth();
  const [users, partners, closed, pending, ledgerSum, activeEvents, eventParticipants, unreadAdmin] =
    await Promise.all([
      prisma.user.count(),
      prisma.partnerProfile.count(),
      prisma.deal.count({ where: { status: DealStatus.CLOSED } }),
      prisma.deal.count({ where: { status: DealStatus.PENDING } }),
      prisma.commissionLedger.aggregate({ _sum: { amountCents: true } }),
      prisma.growthEvent.count({ where: { status: "ACTIVE" } }),
      prisma.eventParticipant.count(),
      session?.user?.id
        ? prisma.notification.count({
            where: { userId: session.user.id, isRead: false },
          })
        : Promise.resolve(0),
    ]);

  const stats = [
    { label: t("admin.users"), value: users },
    { label: t("admin.partnerProfiles"), value: partners },
    { label: t("admin.dealsClosed"), value: closed },
    { label: t("admin.pendingDeals"), value: pending },
    {
      label: t("admin.ledgerSum"),
      value: new Intl.NumberFormat(nfLocale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format((ledgerSum._sum.amountCents ?? 0) / 100),
    },
    { label: t("admin.activeEvents"), value: activeEvents },
    { label: t("admin.eventParticipants"), value: eventParticipants },
    { label: t("admin.unreadNotifications"), value: unreadAdmin },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.overviewTitle")}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-4 sm:p-6">
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {s.label}
            </div>
            <div className="mt-3 text-3xl font-bold text-gold/90">{s.value}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
