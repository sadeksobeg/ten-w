import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { dealConversionRates, inactivePartnersSummary } from "@/lib/growth/rewards";

export default async function GrowthAdminInsightsPage() {
  const t = await getTranslations("Growth");
  const [inactive, conv] = await Promise.all([
    inactivePartnersSummary(30),
    dealConversionRates(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.insightsPage.title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("admin.insightsPage.conversionTitle")}</h2>
        <div className="mt-4 grid gap-3 text-sm text-white/80 sm:grid-cols-4">
          <div>
            <div className="text-xs text-white/50">{t("admin.insightsPage.pending")}</div>
            <div className="mt-1 text-2xl font-semibold text-gold/90">{conv.pending}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">{t("admin.insightsPage.closed")}</div>
            <div className="mt-1 text-2xl font-semibold text-gold/90">{conv.closed}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">{t("admin.insightsPage.lost")}</div>
            <div className="mt-1 text-2xl font-semibold text-gold/90">{conv.lost}</div>
          </div>
          <div>
            <div className="text-xs text-white/50">{t("admin.insightsPage.winRate")}</div>
            <div className="mt-1 text-2xl font-semibold text-gold/90">{conv.winRatePct}%</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("admin.insightsPage.inactiveTitle")}</h2>
        <div className="mt-4 space-y-2 text-sm text-white/75">
          {inactive.length === 0 ? (
            <div className="text-white/55">—</div>
          ) : (
            inactive.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                {p.name ?? p.email}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
