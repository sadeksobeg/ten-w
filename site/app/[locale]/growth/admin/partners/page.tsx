import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { CreatePartnerForm, PartnerList } from "@/components/growth/admin/PartnerAdminPanel";
import {
  getPartnerUpline,
  getPartnerNetworkTree,
  listPartnersForPicker,
} from "@/lib/growth/partner-network";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthAdminPartnersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Growth.admin.partners");

  const [partners, levels, pickerOptions] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.PARTNER },
      orderBy: { createdAt: "desc" },
      include: {
        partnerProfile: { include: { currentLevel: true } },
      },
    }),
    prisma.levelDefinition.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    listPartnersForPicker(),
  ]);

  const filtered = partners.filter((u) => u.partnerProfile);
  const enriched = await Promise.all(
    filtered.map(async (u) => {
      const [upline, { stats }] = await Promise.all([
        getPartnerUpline(u.id),
        getPartnerNetworkTree(u.id, { maxDepth: 1, locale }),
      ]);
      return {
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
        uplineName: upline?.name ?? null,
        uplineUserId: upline?.userId ?? null,
        uplineSlug: upline?.publicSlug ?? null,
        directCount: stats.directCount,
        totalCount: stats.totalCount,
      };
    }),
  );
  const rows = enriched;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("subtitle")}</p>
      </header>

      <GlassCard className="border border-white/10 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">{t("createTitle")}</h2>
        <p className="mt-1 text-xs text-white/45">{t("createHint")}</p>
        <div className="mt-6">
          <CreatePartnerForm pickerOptions={pickerOptions} />
        </div>
      </GlassCard>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/45">
          {t("listTitle")} ({rows.length})
        </h2>
        <GlassCard className="overflow-hidden border border-white/10 p-0">
          <PartnerList partners={rows} levels={levels} pickerOptions={pickerOptions} />
        </GlassCard>
      </section>
    </div>
  );
}
