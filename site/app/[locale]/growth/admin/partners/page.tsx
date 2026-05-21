import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { CreatePartnerForm, PartnerList } from "@/components/growth/admin/PartnerAdminPanel";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthAdminPartnersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Growth.admin.partners");

  const [partners, levels] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.PARTNER },
      orderBy: { createdAt: "desc" },
      include: {
        partnerProfile: { include: { currentLevel: true } },
      },
    }),
    prisma.levelDefinition.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  const rows = partners
    .filter((u) => u.partnerProfile)
    .map((u) => ({
      userId: u.id,
      name: u.name ?? u.email,
      email: u.email,
      phone: u.phone,
      levelName: u.partnerProfile!.currentLevel.name,
      totalXp: u.partnerProfile!.totalXp,
      joinedAt: u.createdAt.toISOString(),
      isActive: u.isActive,
      publicSlug: u.publicSlug,
      locale,
    }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("createTitle")}</h2>
        <div className="mt-5">
          <CreatePartnerForm />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <PartnerList partners={rows} levels={levels} />
      </GlassCard>
    </div>
  );
}
