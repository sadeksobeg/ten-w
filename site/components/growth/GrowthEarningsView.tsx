import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { StatCard } from "@/components/growth/ui/StatCard";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { Link } from "@/i18n/navigation";
import { requestPayoutAction } from "@/lib/growth/actions";

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
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t("earnings.totalLabel")} value={fmt(data.earningsCents)} icon="💰" />
        <StatCard
          label={t("deals.title")}
          value={String(data.closedDeals)}
          sub={`${data.closedDeals} / ${data.pendingDeals}`}
          icon="🤝"
        />
        <StatCard label={t("earnings.ledgerCount")} value={String(data.ledger.length)} icon="📜" />
      </div>
    <GlassCard className="p-6 growth-card-hover">
      <div className="text-3xl font-extrabold tracking-tight text-gold">{fmt(data.earningsCents)}</div>
      <div className="mt-6 space-y-3">
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
      <form action={requestPayoutAction} className="mt-8 grid gap-3 sm:grid-cols-12">
        <label className="sm:col-span-4">
          <span className="text-xs text-white/55">{t("earnings.withdrawAmount")}</span>
          <input
            name="amountUsd"
            type="number"
            min={10}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            placeholder="250"
            required
          />
        </label>
        <label className="sm:col-span-5">
          <span className="text-xs text-white/55">{t("earnings.method")}</span>
          <input
            name="method"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            placeholder={t("earnings.methodPh")}
          />
        </label>
        <div className="flex items-end sm:col-span-3">
          <button
            type="submit"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35"
          >
            {t("earnings.request")}
          </button>
        </div>
      </form>
    </GlassCard>
    </div>
  );
}
