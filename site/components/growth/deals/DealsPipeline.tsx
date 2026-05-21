"use client";

import { useMemo, useState } from "react";
import { DealStatus } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import { DealJourneyRow } from "@/components/growth/DealJourneyRow";
import type { DashboardDeal } from "@/lib/growth/get-dashboard";

type Tab = DealStatus;

type Props = {
  deals: DashboardDeal[];
  journeyLabels: Record<string, string>;
};

function daysAgo(date: Date, locale: string): string {
  const d = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (locale === "ar") return d < 1 ? "اليوم" : `منذ ${d} ي`;
  if (locale === "fr") return d < 1 ? "aujourd'hui" : `il y a ${d} j`;
  return d < 1 ? "today" : `${d}d ago`;
}

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

export function DealsPipeline({ deals, journeyLabels }: Props) {
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
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-1">
        {tabs.map(({ key, label }) => {
          const n = counts[key];
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`shrink-0 border-b-2 px-3 py-2 text-xs font-bold transition ${
                active
                  ? "border-gold text-gold"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {label} ({n})
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
                  className="flex w-full flex-col gap-2 p-4 text-start sm:flex-row sm:items-start sm:justify-between"
                  onClick={() => setExpanded(open ? null : d.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{d.productName}</span>
                      {d.status === DealStatus.CLOSED ? (
                        <span className="text-emerald-400" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                      {d.status === DealStatus.LOST ? (
                        <span className="text-rose-400" aria-hidden>
                          ×
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {t("client")}: {d.clientLabel ?? t("noClient")}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      {t("value")}: {fmt(d.saleAmountCents)} · {daysAgo(d.createdAt, locale)}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-gold/80">
                    {d.status === DealStatus.CLOSED
                      ? t("status.closed")
                      : d.status === DealStatus.LOST
                        ? t("status.lost")
                        : t("status.pending")}
                  </span>
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
