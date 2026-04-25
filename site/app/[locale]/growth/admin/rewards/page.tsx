import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { applyMonthlyRewardsAdminAction } from "@/lib/growth/actions";

export default async function GrowthAdminRewardsPage() {
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.rewardsPage.title")}
      </h1>
      <p className="max-w-2xl text-sm text-white/65">{t("admin.rewardsPage.hint")}</p>
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
