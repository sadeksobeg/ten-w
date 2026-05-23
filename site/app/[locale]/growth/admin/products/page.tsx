import { getTranslations } from "next-intl/server";
import { MarketingKitEditor } from "@/components/growth/admin/MarketingKitEditor";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { updateProductAdminAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminProductsPage() {
  const t = await getTranslations("Growth");
  const products = await prisma.product.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.productsPage.title")}
      </h1>

      <div className="grid gap-5">
        {products.map((p) => (
          <GlassCard key={p.id} className="p-4 sm:p-6">
            <div className="text-sm font-extrabold">{p.name}</div>
            <div className="mt-1 text-xs text-white/45">{p.slug}</div>
            <AdminToastForm action={updateProductAdminAction} className="mt-5 grid gap-3 sm:grid-cols-12">
              <input type="hidden" name="productId" value={p.id} />
              <label className="sm:col-span-4">
                <span className="text-xs text-white/55">{t("admin.productsPage.priceUsd")}</span>
                <input
                  name="priceUsd"
                  type="number"
                  step="0.01"
                  defaultValue={(p.priceCents / 100).toFixed(2)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                  required
                />
              </label>
              <label className="sm:col-span-4">
                <span className="text-xs text-white/55">
                  {t("admin.productsPage.commissionUsd")}
                </span>
                <input
                  name="commissionBaseUsd"
                  type="number"
                  step="0.01"
                  defaultValue={(p.commissionBaseCents / 100).toFixed(2)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                  required
                />
              </label>
              <div className="flex items-end sm:col-span-4">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35"
                >
                  {t("admin.productsPage.save")}
                </button>
              </div>
            </AdminToastForm>
            <MarketingKitEditor
              productId={p.id}
              initialKit={(p.marketingKit as Record<string, unknown>) ?? {}}
            />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
