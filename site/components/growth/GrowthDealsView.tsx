import { DealStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { DealJourneyRow } from "@/components/growth/DealJourneyRow";
import { DealsKanbanBoard } from "@/components/growth/deals/DealsKanbanBoard";
import { addLeadDealAction } from "@/lib/growth/actions";

type Props = {
  locale: string;
  data: DashboardData;
};

export async function GrowthDealsView({ locale, data }: Props) {
  const t = await getTranslations("Growth");
  const products = data.products.map((p) => ({ id: p.id, name: p.name }));
  const journeyLabels = {
    lead: t("journey.steps.lead"),
    contacted: t("journey.steps.contacted"),
    negotiation: t("journey.steps.negotiation"),
    closed: t("journey.steps.closed"),
    paid: t("journey.steps.paid"),
  };

  return (
    <div className="space-y-8">
      <GlassCard className="border border-white/12 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {t("hero.addLead")}
            </div>
            <div className="mt-2 text-sm text-white/70">{t("hero.addLeadHint")}</div>
          </div>
          <div className="text-xs text-white/45">
            {t("networkRefWithCode", { code: data.profile.referralCode })}
          </div>
        </div>
        <form action={addLeadDealAction} className="mt-6 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.product")}</span>
            <select
              name="productId"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              defaultValue={products[0]?.id}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.client")}</span>
            <input
              name="clientLabel"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder={t("lead.clientPh")}
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.notes")}</span>
            <input
              name="notes"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder={t("lead.notesPh")}
            />
          </label>
          <div className="sm:col-span-12">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg shadow-[0_0_60px_-20px_rgba(201,160,97,0.75)] transition-transform hover:translate-y-[-1px] sm:w-auto"
            >
              + {t("hero.addLead")}
            </button>
          </div>
        </form>
      </GlassCard>

      <DealsKanbanBoard locale={locale} deals={data.deals} journeyLabels={journeyLabels} />

      <GlassCard className="p-6">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">{t("deals.listTitle")}</h2>
        <div className="mt-5 space-y-3">
          {data.deals.length === 0 ? (
            <EmptyState illustration="rocket" message={t("deals.empty")} actionLabel={`+ ${t("hero.addLead")}`} />
          ) : (
            data.deals.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{d.productName}</div>
                  <div className="mt-1 text-xs text-white/55">{d.clientLabel ?? t("deals.noClient")}</div>
                  <DealJourneyRow
                    status={d.status}
                    steps={d.journey.steps}
                    labels={journeyLabels}
                    lostLabel={t("journey.lost")}
                  />
                </div>
                <div className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gold/90">
                  {d.status === DealStatus.CLOSED
                    ? t("deals.status.closed")
                    : d.status === DealStatus.LOST
                      ? t("deals.status.lost")
                      : t("deals.status.pending")}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
