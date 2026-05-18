import { DealStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  closeDealAdminFormAction,
  createDealAdminAction,
  markDealLostAdminFormAction,
} from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminDealsPage() {
  const t = await getTranslations("Growth");

  const [deals, products] = await Promise.all([
    prisma.deal.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        product: { select: { name: true } },
        partner: { select: { email: true, name: true } },
      },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { slug: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.dealsPage.title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("admin.dealsPage.createTitle")}</h2>
        <form action={createDealAdminAction} className="mt-4 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.dealsPage.partnerEmail")}</span>
            <input
              name="partnerEmail"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder="partner@tenegta.local"
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.dealsPage.product")}</span>
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
            <span className="text-xs text-white/55">{t("admin.dealsPage.clientLabel")}</span>
            <input
              name="clientLabel"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <div className="sm:col-span-12">
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:border-gold/35 sm:w-auto"
            >
              {t("admin.dealsPage.createSubmit")}
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="divide-y divide-white/10">
          {deals.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div>
                <div className="text-sm font-semibold">{d.product.name}</div>
                <div className="mt-1 text-xs text-white/55">
                  {t("admin.dealsPage.partner")}: {d.partner.name ?? d.partner.email}
                </div>
                <div className="mt-1 text-xs text-white/45">{d.clientLabel ?? "—"}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gold/90">
                  {d.status === DealStatus.CLOSED
                    ? t("deals.status.closed")
                    : d.status === DealStatus.LOST
                      ? t("deals.status.lost")
                      : t("deals.status.pending")}
                </div>
                {d.status === DealStatus.PENDING ? (
                  <>
                    <form action={closeDealAdminFormAction}>
                      <input type="hidden" name="dealId" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-4 py-2 text-xs font-extrabold text-bg"
                      >
                        {t("admin.dealsPage.close")}
                      </button>
                    </form>
                    <form action={markDealLostAdminFormAction}>
                      <input type="hidden" name="dealId" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200"
                      >
                        {t("admin.dealsPage.markLost")}
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
