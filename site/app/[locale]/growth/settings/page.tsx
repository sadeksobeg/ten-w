import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AvatarSettingsForm } from "@/components/growth/settings/AvatarSettingsForm";
import { PartnerProfileSettingsForm } from "@/components/growth/settings/PartnerProfileSettingsForm";
import { PartnerSettingsLayout } from "@/components/growth/settings/PartnerSettingsLayout";
import { ProfileShareExport } from "@/components/growth/ProfileShareExport";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { prisma } from "@/lib/prisma";

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
          currentLevel: { select: { name: true, code: true } },
        },
      },
    },
  });

  if (!user?.publicSlug) redirect(`/${locale}/growth`);

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
        }}
      >
        <ProfileShareExport publicSlug={user.publicSlug!} locale={locale} />
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
