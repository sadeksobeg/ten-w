"use client";

import { useLocale, useTranslations } from "next-intl";
import { PayoutStatus } from "@prisma/client";
import type { DashboardPayoutRequest } from "@/lib/growth/get-dashboard";
import { relativeDate } from "@/lib/growth/relative-date";

type Props = {
  requests: DashboardPayoutRequest[];
};

function dotStyle(status: PayoutStatus): { background: string; borderColor: string } {
  switch (status) {
    case PayoutStatus.PENDING:
      return { background: "rgba(245, 158, 11, 0.8)", borderColor: "rgba(245, 158, 11, 1)" };
    case PayoutStatus.APPROVED:
      return { background: "rgba(59, 130, 246, 0.8)", borderColor: "rgba(59, 130, 246, 1)" };
    case PayoutStatus.PAID:
      return { background: "rgba(34, 197, 94, 0.8)", borderColor: "rgba(34, 197, 94, 1)" };
    case PayoutStatus.REJECTED:
      return { background: "rgba(239, 68, 68, 0.8)", borderColor: "rgba(239, 68, 68, 1)" };
    default:
      return { background: "rgba(107, 114, 128, 0.8)", borderColor: "rgba(107, 114, 128, 1)" };
  }
}

function statusPillClass(status: PayoutStatus): string {
  switch (status) {
    case PayoutStatus.PENDING:
      return "bg-amber-500/15 text-amber-200 ring-amber-400/30";
    case PayoutStatus.APPROVED:
      return "bg-sky-500/15 text-sky-200 ring-sky-400/30";
    case PayoutStatus.PAID:
      return "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30";
    case PayoutStatus.REJECTED:
      return "bg-rose-500/15 text-rose-200 ring-rose-400/30";
    default:
      return "bg-white/10 text-white/70 ring-white/20";
  }
}

export function PayoutHistoryList({ requests }: Props) {
  const t = useTranslations("Growth.earnings.payoutHistory");
  const tStatus = useTranslations("Growth.payout_status");
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
    <div className="relative ps-6">
      <div
        className="absolute bottom-2 top-2 w-0.5"
        style={{
          insetInlineStart: "7px",
          background: `repeating-linear-gradient(
            to bottom,
            rgba(176, 125, 43, 0.4) 0px,
            rgba(176, 125, 43, 0.4) 6px,
            transparent 6px,
            transparent 12px
          )`,
        }}
        aria-hidden
      />
      <ul className="space-y-0">
        {requests.map((r) => {
          const dot = dotStyle(r.status);
          return (
            <li key={r.id} className="relative flex gap-4 pb-5 last:pb-0">
              <span
                className="relative z-[1] mt-0.5 size-3.5 shrink-0 rounded-full border-2"
                style={{
                  background: dot.background,
                  borderColor: dot.borderColor,
                }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-lg font-bold text-[var(--growth-gold-bright)]">
                    {fmt(r.amountCents)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ring-1 ${statusPillClass(r.status)}`}
                  >
                    {tStatus(r.status)}
                  </span>
                </div>
                {r.method ? (
                  <p className="mt-0.5 text-xs text-[var(--growth-text-sub)]">{r.method}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-[var(--growth-text-sub)]">
                  {relativeDate(r.createdAt, locale)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
