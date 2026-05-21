import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { ReferralAnalyticsPanel } from "@/components/growth/network/ReferralAnalyticsPanel";

type Props = {
  locale: string;
  data: DashboardData;
};

export async function GrowthNetworkView({ locale, data }: Props) {
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6">
      <ReferralAnalyticsPanel
        networkSize={data.network.length}
        closedDeals={data.closedDeals}
        referralCode={data.profile.referralCode}
      />
      <GlassCard className="p-6">
        <h1 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("network.title")}</h1>
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
