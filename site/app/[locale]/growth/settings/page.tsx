import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AvatarSettingsForm } from "@/components/growth/settings/AvatarSettingsForm";
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
    select: { avatarUrl: true, name: true, email: true },
  });

  const t = await getTranslations("Growth.settings");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />
      <AvatarSettingsForm
        locale={locale}
        initialAvatar={user?.avatarUrl ?? ""}
        name={user?.name ?? session.user.name ?? ""}
        email={user?.email ?? session.user.email ?? ""}
      />
    </div>
  );
}
