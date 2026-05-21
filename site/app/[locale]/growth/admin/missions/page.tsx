import { getTranslations } from "next-intl/server";
import { AdminMissionsClient } from "@/components/growth/admin/AdminMissionsClient";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminMissionsPage() {
  const t = await getTranslations("Growth.admin.missionsPage");
  const missions = await prisma.missionDefinition.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
      <p className="text-sm text-white/65">{t("hint")}</p>
      <AdminMissionsClient
        missions={missions.map((m) => ({
          id: m.id,
          key: m.key,
          title: m.title,
          xpReward: m.xpReward,
          sortOrder: m.sortOrder,
          chainGroup: m.chainGroup,
          active: m.active,
          criteria: m.criteria,
        }))}
      />
    </div>
  );
}
