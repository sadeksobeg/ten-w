"use client";

import { useLocale, useTranslations } from "next-intl";
import { PayoutStatus } from "@prisma/client";
import type { DashboardPayoutRequest } from "@/lib/growth/get-dashboard";

type Props = {
  requests: DashboardPayoutRequest[];
};

function relativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (locale === "ar") {
    if (days < 1) return "اليوم";
    return `منذ ${days} ي`;
  }
  if (days < 1) return "today";
  return `${days}d ago`;
}

function statusClass(status: PayoutStatus): string {
  switch (status) {
    case PayoutStatus.PENDING:
      return "bg-amber-500/20 text-amber-200 ring-amber-400/30";
    case PayoutStatus.APPROVED:
      return "bg-sky-500/20 text-sky-200 ring-sky-400/30";
    case PayoutStatus.PAID:
      return "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30";
    case PayoutStatus.REJECTED:
      return "bg-rose-500/20 text-rose-200 ring-rose-400/30";
    default:
      return "bg-white/10 text-white/70";
  }
}

export function PayoutHistoryList({ requests }: Props) {
  const t = useTranslations("Growth.earnings.payoutHistory");
  const locale = useLocale();
  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  if (requests.length === 0) {
    return <p className="text-sm text-white/50">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
        >
          <div>
            <div className="text-lg font-bold text-gold">{fmt(r.amountCents)}</div>
            {r.method ? (
              <div className="mt-0.5 text-xs text-white/50">{r.method}</div>
            ) : null}
            <div className="mt-1 text-[10px] text-white/40">
              {relativeTime(r.createdAt, locale)}
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${statusClass(r.status)}`}
          >
            {t(`status.${r.status}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}
