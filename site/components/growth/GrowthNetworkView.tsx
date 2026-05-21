import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { PartnerNetworkTree } from "@/components/growth/profile/PartnerNetworkTree";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { getPartnerNetworkTree } from "@/lib/growth/partner-network";
import { ReferralAnalyticsPanel } from "@/components/growth/network/ReferralAnalyticsPanel";

type Props = {
  locale: string;
  data: DashboardData;
  userId: string;
};

export async function GrowthNetworkView({ locale, data, userId }: Props) {
  const t = await getTranslations("Growth");
  const { tree, stats } = await getPartnerNetworkTree(userId, { locale, maxDepth: 3 });

  return (
    <div className="space-y-6 growth-page-enter">
      <GrowthPageHeader title={t("network.title")} />
      <ReferralAnalyticsPanel
        networkSize={data.network.length}
        closedDeals={data.closedDeals}
        referralCode={data.profile.referralCode}
      />
      <GlassCard className="p-6 growth-card-hover">
        <h2 className="text-sm font-bold text-gold">{t("publicProfile.teamTitle")}</h2>
        <div className="mt-4">
          <PartnerNetworkTree tree={tree} stats={stats} locale={locale} />
        </div>
      </GlassCard>
      <GlassCard className="p-6 growth-card-hover">
        <h2 className="text-sm font-bold text-white/80">{t("network.directList")}</h2>
        <div className="mt-5 space-y-3">
          {data.network.length === 0 ? (
            <div className="text-sm text-white/60">{t("network.empty")}</div>
          ) : (
            data.network.map((n) => (
              <div key={n.userId} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold">{n.name ?? n.email}</div>
                <div className="mt-1 text-xs text-white/55">{n.email}</div>
                <div className="mt-2 text-xs text-white/45">
                  {t("networkRefWithCode", { code: n.referralCode })}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
