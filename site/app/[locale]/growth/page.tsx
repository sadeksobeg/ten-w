import { auth } from "@/auth";
import { GrowthCelebrationClient } from "@/components/growth/GrowthCelebrationClient";
import { GrowthDashboardView } from "@/components/growth/GrowthDashboardView";
import { getPartnerDashboard } from "@/lib/growth/get-dashboard";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { touchActivityDay, touchPartnerStreak } from "@/lib/growth/streak";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ celebrate?: string }>;
};

export default async function GrowthPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }

  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin`);
  }

  await touchPartnerStreak(session.user.id);
  await touchActivityDay(session.user.id);

  let data;
  try {
    data = await getPartnerDashboard(session.user.id, locale);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "missing_seed" || msg === "not_a_partner") {
      throw e;
    }
    throw new Error("dashboard_load_failed");
  }

  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  }).catch(() => null);

  const celebrate = typeof sp.celebrate === "string" ? sp.celebrate : undefined;
  let badgeUnlockName: string | undefined;
  if (celebrate?.startsWith("badge:")) {
    const bk = celebrate.slice(6).trim();
    const b = await prisma.badgeDefinition.findUnique({
      where: { key: bk },
      select: { name: true },
    });
    badgeUnlockName = b
      ? resolveBadgeCopy(bk, locale, { name: b.name }).name
      : undefined;
  }

  return (
    <>
      <GrowthCelebrationClient celebrate={celebrate} badgeName={badgeUnlockName} />
      <GrowthDashboardView
        locale={locale}
        data={data}
        celebrate={celebrate}
        userId={session.user.id}
        userName={session.user.name ?? session.user.email ?? "Partner"}
        userEmail={session.user.email ?? ""}
        avatarUrl={userRow?.avatarUrl ?? session.user.image}
      />
    </>
  );
}
