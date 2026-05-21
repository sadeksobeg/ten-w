import { GrowthCelebrationClient } from "@/components/growth/GrowthCelebrationClient";
import { GrowthHubView } from "@/components/growth/GrowthHubView";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ celebrate?: string }>;
};

export default async function GrowthPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const { data, userId, userName, userEmail } = await requirePartnerDashboard(locale);

  const userRow = await prisma.user.findUnique({
    where: { id: userId },
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
      <GrowthHubView
        locale={locale}
        data={data}
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={userRow?.avatarUrl ?? undefined}
      />
    </>
  );
}
