"use client";

import { useTranslations } from "next-intl";
import { ClientOrderStatus } from "@prisma/client";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { AdminDealRowActions } from "@/components/growth/admin/AdminDealRowActions";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import {
  rejectClientOrderAdminFormAction,
  reviewClientOrderAdminFormAction,
} from "@/lib/growth/actions";
import type { AdminClientOrderRow, AdminOrderStats } from "@/lib/growth/client-order-admin";

type Props = {
  orders: AdminClientOrderRow[];
  stats: AdminOrderStats;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatValue(cents: number, pendingLabel: string): string {
  return cents > 0 ? formatUsd(cents) : pendingLabel;
}

const STATUS_COLORS: Record<ClientOrderStatus, string> = {
  NEW: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  REVIEWED: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  CONVERTED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  REJECTED: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function AdminClientOrdersClient({ orders, stats }: Props) {
  const t = useTranslations("Growth.admin.orders");

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-sky-500/10 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-20 start-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <BadgeIcon badgeKey="first_deal" earned size="md" showGlow />
            <div>
              <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-white/60">{t("subtitle")}</p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <dt className="text-[10px] uppercase tracking-wide text-white/45">{t("stats.today")}</dt>
              <dd className="mt-1 text-2xl font-black text-gold">{stats.todayCount}</dd>
              <dd className="text-xs text-white/50">
                {formatValue(stats.todayValueCents, t("pricePending"))}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <dt className="text-[10px] uppercase tracking-wide text-white/45">{t("stats.total")}</dt>
              <dd className="mt-1 text-2xl font-black text-white">{stats.totalCount}</dd>
              <dd className="text-xs text-white/50">
                {formatValue(stats.totalValueCents, t("pricePending"))}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <dt className="text-[10px] uppercase tracking-wide text-white/45">{t("stats.topCreator")}</dt>
              <dd className="mt-1 text-sm font-bold text-white">{stats.topCreatorName ?? "—"}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <dt className="text-[10px] uppercase tracking-wide text-white/45">{t("stats.topProduct")}</dt>
              <dd className="mt-1 text-sm font-bold text-white">{stats.topProductName ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </GlassCard>

      {orders.length === 0 ? (
        <GlassCard className="border border-white/10 p-8 text-center text-sm text-white/45">
          {t("empty")}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GlassCard
              key={order.id}
              className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-gold/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[order.status]}`}
                  >
                    {t(`status.${order.status}`)}
                  </span>
                  <h3 className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                    {order.clientName}
                    {order.company ? (
                      <span className="ms-2 text-sm font-semibold text-white/45">
                        {order.company}
                      </span>
                    ) : null}
                  </h3>
                  <p className="text-xs text-white/50">
                    {order.clientEmail}
                    {order.clientPhone ? ` · ${order.clientPhone}` : ""}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xl font-black text-gold">
                    {formatValue(order.finalPriceCents, t("pricePending"))}
                  </p>
                  {order.discountCode ? (
                    <p className="text-[10px] text-emerald-300">
                      {order.discountBps > 0
                        ? t("discountApplied", {
                            pct: order.discountBps / 100,
                            code: order.discountCode,
                          })
                        : t("discountCodeOnly", { code: order.discountCode })}
                    </p>
                  ) : null}
                </div>
              </div>

              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-white/40">{t("colProduct")}</dt>
                  <dd className="font-semibold text-white">{order.productName}</dd>
                </div>
                <div>
                  <dt className="text-white/40">{t("colCreator")}</dt>
                  <dd className="font-semibold text-white">
                    {order.partnerName ?? t("organic")}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/40">{t("colDate")}</dt>
                  <dd className="text-white/70">
                    {new Date(order.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/40">{t("colRef")}</dt>
                  <dd className="font-mono text-[10px] text-white/55">
                    {order.id.slice(-8).toUpperCase()}
                  </dd>
                </div>
              </dl>

              {order.selectedFeatures.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {order.selectedFeatures.map((f) => (
                    <li
                      key={f.label}
                      className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/65"
                    >
                      {f.label}
                      {f.priceDeltaCents > 0 ? ` (+${formatUsd(f.priceDeltaCents)})` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}

              {order.notes ? (
                <p className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/60">
                  {order.notes}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === ClientOrderStatus.NEW ? (
                  <AdminToastForm
                    action={reviewClientOrderAdminFormAction}
                    successKey="toastOrderReviewed"
                  >
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200"
                    >
                      {t("review")}
                    </button>
                  </AdminToastForm>
                ) : null}
                {order.status !== ClientOrderStatus.REJECTED &&
                order.status !== ClientOrderStatus.CONVERTED ? (
                  <AdminToastForm
                    action={rejectClientOrderAdminFormAction}
                    successKey="toastOrderRejected"
                  >
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200"
                    >
                      {t("reject")}
                    </button>
                  </AdminToastForm>
                ) : null}
                {order.dealId && order.dealStatus === "PENDING" ? (
                  <AdminDealRowActions dealId={order.dealId} />
                ) : null}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
