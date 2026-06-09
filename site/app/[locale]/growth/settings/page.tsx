import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AvatarSettingsForm } from "@/components/growth/settings/AvatarSettingsForm";
import { PartnerProfileSettingsForm } from "@/components/growth/settings/PartnerProfileSettingsForm";
import { PartnerSettingsLayout } from "@/components/growth/settings/PartnerSettingsLayout";
import { ProfileShareExport } from "@/components/growth/ProfileShareExport";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { BadgeShowcase } from "@/components/growth/badges/BadgeShowcase";
import { PushNotificationPermission } from "@/components/growth/PushNotificationPermission";
import { NotificationSoundToggle } from "@/components/growth/settings/NotificationSoundToggle";
import { TerritorySettingsForm } from "@/components/growth/settings/TerritorySettingsForm";
import { prisma } from "@/lib/prisma";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { uniquePublicSlug } from "@/lib/growth/public-slug";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthSettingsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/growth/sign-in`);
  if (session.user.role === "ADMIN") redirect(`/${locale}/growth/admin`);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatarUrl: true,
      avatarPreset: true,
      name: true,
      email: true,
      publicSlug: true,
      bio: true,
      partnerProfile: {
        select: {
          displayTitle: true,
          socialLinks: true,
          showcasedBadges: true,
          territory: true,
          currentLevel: { select: { name: true, code: true } },
        },
      },
      userBadges: {
        include: { badge: { select: { key: true, name: true } } },
      },
    },
  });

  if (!user) redirect(`/${locale}/growth`);

  let publicSlug = user.publicSlug;
  if (!publicSlug) {
    publicSlug = await uniquePublicSlug(
      prisma,
      user.name ?? session.user.name ?? user.email ?? session.user.email ?? "partner",
    );
    await prisma.user.update({
      where: { id: session.user.id },
      data: { publicSlug },
    });
  }

  const t = await getTranslations("Growth.settings");

  return (
    <div className="mx-auto max-w-5xl space-y-6 growth-page-enter">
      <GrowthPageHeader title={t("title")} subtitle={t("subtitle")} />
      <PartnerSettingsLayout
        name={user.name ?? session.user.name ?? ""}
        email={user.email ?? session.user.email ?? ""}
        avatarUrl={user.avatarUrl ?? ""}
        levelName={user.partnerProfile?.currentLevel?.name ?? "Starter"}
        levelCode={user.partnerProfile?.currentLevel?.code}
        locale={locale}
        previewFields={{
          displayTitle: user.partnerProfile?.displayTitle ?? "",
          bio: user.bio ?? "",
          avatarUrl: user.avatarUrl ?? "",
          avatarPreset: user.avatarPreset ?? "",
        }}
      >
        <ProfileShareExport publicSlug={publicSlug} locale={locale} />
        <PartnerProfileSettingsForm
          locale={locale}
          social={
            (user.partnerProfile?.socialLinks as {
              whatsapp?: string;
              linkedin?: string;
              twitter?: string;
            } | null) ?? {}
          }
        />
        <TerritorySettingsForm
          locale={locale}
          currentTerritory={user.partnerProfile?.territory ?? null}
        />
        <SectionHeader title={t("badgeShowcase")} />
        <BadgeShowcase
          earnedBadges={user.userBadges.map((ub) => {
            const copy = resolveBadgeCopy(ub.badge.key, locale, { name: ub.badge.name });
            return { key: ub.badge.key, name: copy.name, earned: true };
          })}
          showcasedKeys={user.partnerProfile?.showcasedBadges ?? []}
        />
        <SectionHeader title={t("notificationsSection")} />
        <div className="flex flex-wrap items-center gap-3">
          <PushNotificationPermission />
          <NotificationSoundToggle />
        </div>
        <SectionHeader title={t("avatarSection")} />
        <AvatarSettingsForm
          locale={locale}
          initialAvatar={user?.avatarUrl ?? ""}
          initialPreset={user?.avatarPreset ?? null}
          name={user?.name ?? session.user.name ?? ""}
          email={user?.email ?? session.user.email ?? ""}
        />
      </PartnerSettingsLayout>
    </div>
  );
}
