import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { EarningsMonthlyChart } from "@/components/growth/earnings/EarningsMonthlyChart";
import { GrowthEarningsWallet } from "@/components/growth/earnings/GrowthEarningsWallet";
import { PayoutHistoryList } from "@/components/growth/earnings/PayoutHistoryList";
import { PayoutRequestForm } from "@/components/growth/earnings/PayoutRequestForm";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  data: DashboardData;
};

export async function GrowthEarningsView({ locale, data }: Props) {
  const t = await getTranslations("Growth");
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nfLocale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <div className="space-y-6 growth-page-enter">
      <GrowthPageHeader
        title={t("earnings.title")}
        action={
          <Link
            href="/api/growth/earnings-export"
            className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
            target="_blank"
            rel="noreferrer"
          >
            {t("earnings.exportCsv")}
          </Link>
        }
      />

      <GrowthEarningsWallet locale={locale} wallet={data.wallet} />

      <GlassCard className="p-6 growth-card-hover">
        <EarningsMonthlyChart data={data.earningsByMonth} />
      </GlassCard>

      <GlassCard className="p-6 growth-card-hover">
        <PayoutRequestForm wallet={data.wallet} />
      </GlassCard>

      <GlassCard className="p-6 growth-card-hover">
        <h2 className="text-sm font-bold text-gold">{t("earnings.payoutHistory.title")}</h2>
        <div className="mt-4">
          <PayoutHistoryList requests={data.payoutRequests} />
        </div>
      </GlassCard>

      <GlassCard className="p-6 growth-card-hover">
        <h2 className="text-sm font-bold text-white/80">{t("earnings.ledgerTitle")}</h2>
        <div className="mt-4 space-y-3">
          {data.ledger.length === 0 ? (
            <div className="text-sm text-white/60">{t("earnings.empty")}</div>
          ) : (
            data.ledger.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              >
                <div className="text-white/70">
                  {row.tier === 0 ? t("earnings.bonus") : t("earnings.tier", { tier: row.tier })}
                </div>
                <div className="font-semibold text-gold/90">{fmt(row.amountCents)}</div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
