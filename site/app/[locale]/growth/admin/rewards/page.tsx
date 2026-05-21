import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { AdminRewardRulesClient } from "@/components/growth/admin/AdminRewardRulesClient";
import { applyMonthlyRewardsAdminAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminRewardsPage() {
  const t = await getTranslations("Growth");
  const rules = await prisma.leaderboardRewardRule.findMany({ orderBy: { rankMin: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.rewardsPage.title")}
      </h1>
      <p className="max-w-2xl text-sm text-white/65">{t("admin.rewardsPage.hint")}</p>
      <AdminRewardRulesClient
        rules={rules.map((r) => ({
          id: r.id,
          name: r.name,
          windowMs: String(r.windowMs),
          rankMin: r.rankMin,
          rankMax: r.rankMax,
          bonusCents: r.bonusCents,
          badgeKey: r.badgeKey,
          active: r.active,
        }))}
      />
      <GlassCard className="p-4 sm:p-6">
        <form action={applyMonthlyRewardsAdminAction}>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg sm:w-auto"
          >
            {t("admin.rewardsPage.submit")}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
