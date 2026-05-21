import { DealStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { AdminOverviewClient } from "@/components/growth/admin/AdminOverviewClient";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { StatCard } from "@/components/growth/ui/StatCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { countNotificationsSafe } from "@/lib/growth/prisma-optional";
import { fetchActivityEventsSafe } from "@/lib/growth/prisma-optional";

type Props = {
  params: Promise<{ locale: string }>;
};

function activityIcon(kind: string): string {
  if (kind.includes("deal") || kind.includes("DEAL")) return "🤝";
  if (kind.includes("badge") || kind.includes("BADGE")) return "🏆";
  if (kind.includes("payout") || kind.includes("PAYOUT")) return "💰";
  return "📌";
}

export default async function GrowthAdminHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Growth");
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";

  const session = await auth();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    users,
    partners,
    closed,
    pending,
    ledgerSum,
    activeEvents,
    eventParticipants,
    unreadAdmin,
    closedThisWeek,
    closedPrevWeek,
    activityRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.partnerProfile.count(),
    prisma.deal.count({ where: { status: DealStatus.CLOSED } }),
    prisma.deal.count({ where: { status: DealStatus.PENDING } }),
    prisma.commissionLedger.aggregate({ _sum: { amountCents: true } }),
    prisma.growthEvent.count({ where: { status: "ACTIVE" } }),
    prisma.eventParticipant.count(),
    session?.user?.id
      ? countNotificationsSafe(prisma, {
          userId: session.user.id,
          isRead: false,
        })
      : Promise.resolve(0),
    prisma.deal.count({
      where: { status: DealStatus.CLOSED, closedAt: { gte: weekAgo } },
    }),
    prisma.deal.count({
      where: {
        status: DealStatus.CLOSED,
        closedAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    fetchActivityEventsSafe(prisma, 10),
  ]);

  const dealTrend = closedThisWeek - closedPrevWeek;
  const money = (cents: number) =>
    new Intl.NumberFormat(nfLocale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <div className="space-y-8">
      <SectionHeader title={t("admin.overviewTitle")} />

      <AdminOverviewClient />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard label={t("admin.users")} value={users} />
          <StatCard label={t("admin.partnerProfiles")} value={partners} />
          <StatCard
            label={t("admin.dealsClosed")}
            value={closed}
            trend={{ delta: dealTrend, label: t("admin.trendWeek") }}
          />
          <StatCard label={t("admin.pendingDeals")} value={pending} />
          <StatCard
            label={t("admin.ledgerSum")}
            value={money(ledgerSum._sum.amountCents ?? 0)}
            animateValue={false}
          />
          <StatCard label={t("admin.activeEvents")} value={activeEvents} />
          <StatCard label={t("admin.eventParticipants")} value={eventParticipants} />
          <StatCard label={t("admin.unreadNotifications")} value={unreadAdmin} />
        </div>

        <GlassCard className="h-fit lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--growth-text-sub)]">
            {t("admin.recentActivity")}
          </h2>
          <ul className="mt-4 space-y-3">
            {activityRows.length === 0 ? (
              <li className="text-sm text-[var(--growth-text-sub)]">—</li>
            ) : (
              activityRows.map((a) => (
                <li key={a.id} className="flex gap-2 text-sm">
                  <span aria-hidden>{activityIcon(a.kind)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{a.headline}</span>
                    <span className="mt-0.5 block text-[10px] text-[var(--growth-text-sub)]">
                      {new Date(a.createdAt).toLocaleString(nfLocale)}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
