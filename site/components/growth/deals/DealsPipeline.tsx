"use client";

import { useMemo, useState } from "react";
import { DealStatus } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import { IconCheck, IconChevronDown, IconClose, IconDeals } from "@/components/growth/icons/GrowthIcons";
import { DealJourneyRow } from "@/components/growth/DealJourneyRow";
import { PendingLeadManage } from "@/components/growth/deals/PendingLeadManage";
import { RequestDealCloseButton } from "@/components/growth/deals/RequestDealCloseButton";
import type { DashboardDeal } from "@/lib/growth/get-dashboard";
import { relativeDate } from "@/lib/growth/relative-date";

type Tab = DealStatus;

type ProductOption = {
  id: string;
  name: string;
  priceCents: number;
  commissionBaseCents: number;
};

type Props = {
  deals: DashboardDeal[];
  journeyLabels: Record<string, string>;
  products: ProductOption[];
};

function borderClass(status: DealStatus): string {
  switch (status) {
    case DealStatus.PENDING:
      return "border-s-gold/70";
    case DealStatus.CLOSED:
      return "border-s-emerald-500/70";
    case DealStatus.LOST:
      return "border-s-rose-500/60";
    default:
      return "border-s-white/20";
  }
}

export function DealsPipeline({ deals, journeyLabels, products }: Props) {
  const t = useTranslations("Growth.deals");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>(DealStatus.PENDING);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (d.status !== tab) return false;
      if (!q) return true;
      return (
        (d.clientLabel ?? "").toLowerCase().includes(q) ||
        d.productName.toLowerCase().includes(q)
      );
    });
  }, [deals, tab, query]);

  const counts = useMemo(
    () => ({
      PENDING: deals.filter((d) => d.status === DealStatus.PENDING).length,
      CLOSED: deals.filter((d) => d.status === DealStatus.CLOSED).length,
      LOST: deals.filter((d) => d.status === DealStatus.LOST).length,
    }),
    [deals],
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: DealStatus.PENDING, label: t("status.pending") },
    { key: DealStatus.CLOSED, label: t("status.closed") },
    { key: DealStatus.LOST, label: t("status.lost") },
  ];

  const emptyIllustration =
    tab === DealStatus.PENDING ? "rocket" : tab === DealStatus.CLOSED ? "trophy" : "refresh";
  const emptyMessage =
    tab === DealStatus.PENDING
      ? t("emptyPending")
      : tab === DealStatus.CLOSED
        ? t("emptyClosed")
        : t("emptyLost");

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPh")}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/40"
      />
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--growth-border)] bg-white/[0.04] p-1">
        {tabs.map(({ key, label }) => {
          const n = counts[key];
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                active
                  ? "bg-gradient-to-r from-gold/90 via-gold to-gold-bright text-bg shadow-sm"
                  : "bg-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                  active ? "bg-black/20 text-bg" : "bg-white/10 text-white/60"
                }`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <EmptyState illustration={emptyIllustration} message={emptyMessage} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => {
            const open = expanded === d.id;
            return (
              <li
                key={d.id}
                className={`rounded-xl border border-white/10 border-s-4 bg-black/25 ${borderClass(d.status)}`}
              >
                <button
                  type="button"
                  className="flex w-full items-start gap-2 p-4 text-start"
                  onClick={() => setExpanded(open ? null : d.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{d.productName}</span>
                      {d.status === DealStatus.CLOSED ? (
                        <IconCheck size={14} className="text-emerald-400" aria-hidden />
                      ) : null}
                      {d.status === DealStatus.LOST ? (
                        <IconClose size={14} className="text-rose-400" aria-hidden />
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {t("client")}: {d.clientLabel ?? t("noClient")}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      {t("value")}: {fmt(d.saleAmountCents)} · {relativeDate(d.createdAt, locale)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase text-gold/80">
                      {d.status === DealStatus.CLOSED
                        ? t("status.closed")
                        : d.status === DealStatus.LOST
                          ? t("status.lost")
                          : t("status.pending")}
                    </span>
                    <IconChevronDown
                      size={18}
                      className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </div>
                </button>
                {open ? (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3">
                    {d.notes ? (
                      <p className="text-xs text-white/60">
                        <span className="font-semibold text-white/70">{t("notes")}: </span>
                        {d.notes}
                      </p>
                    ) : null}
                    {d.status === DealStatus.CLOSED && d.commissionCents != null ? (
                      <p className="mt-2 text-sm font-semibold text-gold">
                        {t("commission")}: {fmt(d.commissionCents)}
                      </p>
                    ) : null}
                    <DealJourneyRow
                      status={d.status}
                      steps={d.journey.steps}
                      labels={journeyLabels}
                      lostLabel={t("journeyLost")}
                    />
                    {d.status === DealStatus.PENDING ? (
                      <>
                        <PendingLeadManage
                          dealId={d.id}
                          productId={d.productId}
                          clientLabel={d.clientLabel}
                          notes={d.notes}
                          products={products}
                        />
                        <RequestDealCloseButton dealId={d.id} />
                      </>
                    ) : null}
                    <Link
                      href="/growth/chat"
                      className="mt-3 inline-block text-xs font-semibold text-gold hover:underline"
                    >
                      {t("openChat")}
                    </Link>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
