import { PayoutStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  approvePayoutAdminFormAction,
  markPayoutPaidAdminFormAction,
  rejectPayoutAdminFormAction,
} from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminPayoutsPage() {
  const t = await getTranslations("Growth");

  const payouts = await prisma.payoutRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  function statusLabel(status: PayoutStatus) {
    switch (status) {
      case PayoutStatus.PENDING:
        return t("admin.payoutsPage.status.pending");
      case PayoutStatus.APPROVED:
        return t("admin.payoutsPage.status.approved");
      case PayoutStatus.PAID:
        return t("admin.payoutsPage.status.paid");
      case PayoutStatus.REJECTED:
        return t("admin.payoutsPage.status.rejected");
      default:
        return status;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.payoutsPage.title")}
      </h1>
      <p className="max-w-2xl text-sm text-white/65">{t("admin.payoutsPage.hint")}</p>

      <GlassCard className="overflow-hidden p-0">
        <div className="divide-y divide-white/10">
          {payouts.length === 0 ? (
            <p className="px-4 py-8 text-sm text-white/55 sm:px-5">
              {t("admin.payoutsPage.empty")}
            </p>
          ) : (
            payouts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <div className="text-sm font-semibold">
                    ${(p.amountCents / 100).toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {p.user.name ?? p.user.email}
                    {p.method ? ` · ${p.method}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gold/90">
                    {statusLabel(p.status)}
                  </span>
                  {p.status === PayoutStatus.PENDING ? (
                    <>
                      <form action={approvePayoutAdminFormAction}>
                        <input type="hidden" name="payoutId" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
                        >
                          {t("admin.payoutsPage.approve")}
                        </button>
                      </form>
                      <form action={rejectPayoutAdminFormAction}>
                        <input type="hidden" name="payoutId" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                        >
                          {t("admin.payoutsPage.reject")}
                        </button>
                      </form>
                    </>
                  ) : null}
                  {p.status === PayoutStatus.APPROVED ? (
                    <form action={markPayoutPaidAdminFormAction}>
                      <input type="hidden" name="payoutId" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-4 py-2 text-xs font-extrabold text-bg"
                      >
                        {t("admin.payoutsPage.markPaid")}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
