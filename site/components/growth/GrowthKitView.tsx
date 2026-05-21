import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { MarketingKitProductCard } from "@/components/growth/MarketingKitProductCard";
import { recordMarketingKitHitAction } from "@/lib/growth/actions";

type Props = {
  locale: string;
  data: DashboardData;
};

export async function GrowthKitView({ locale, data }: Props) {
  const t = await getTranslations("Growth");

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("kit.title")}</h1>
        <form action={recordMarketingKitHitAction}>
          <button
            type="submit"
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/80 hover:border-gold/35"
          >
            {t("kit.record")}
          </button>
        </form>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {data.products.map((p) => (
          <MarketingKitProductCard
            key={p.id}
            locale={locale}
            productName={p.name}
            productSlug={p.slug}
            marketingKit={p.marketingKit}
          />
        ))}
      </div>
    </GlassCard>
  );
}
