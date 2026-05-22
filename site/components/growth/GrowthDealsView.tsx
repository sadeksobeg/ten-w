import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { AddLeadDealForm } from "@/components/growth/deals/AddLeadDealForm";
import { DealsPipeline } from "@/components/growth/deals/DealsPipeline";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  data: DashboardData;
};

export async function GrowthDealsView({ locale, data }: Props) {
  const t = await getTranslations("Growth");
  const journeyLabels = {
    lead: t("journey.steps.lead"),
    contacted: t("journey.steps.contacted"),
    negotiation: t("journey.steps.negotiation"),
    closed: t("journey.steps.closed"),
    paid: t("journey.steps.paid"),
  };

  return (
    <div className="space-y-8 growth-page-enter">
      <GlassCard className="border border-white/12 bg-white/[0.03] p-6">
        <AddLeadDealForm
          products={data.products.map((p) => ({
            id: p.id,
            name: p.name,
            priceCents: p.priceCents,
            commissionBaseCents: p.commissionBaseCents,
          }))}
          referralCode={data.profile.referralCode}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">{t("deals.listTitle")}</h2>
        <div className="mt-5">
          <DealsPipeline deals={data.deals} journeyLabels={journeyLabels} />
        </div>
      </GlassCard>
    </div>
  );
}
