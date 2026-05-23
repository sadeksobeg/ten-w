import { getTranslations } from "next-intl/server";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { updateCommissionTierAdminAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminTiersPage() {
  const t = await getTranslations("Growth");
  const cfg =
    (await prisma.commissionTierConfig.findFirst({ orderBy: { updatedAt: "desc" } })) ??
    (await prisma.commissionTierConfig.findUnique({ where: { id: "default" } }));

  if (!cfg) {
    return <div className="text-sm text-white/70">{t("admin.tiersMissingSeed")}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.tiersPage.title")}
      </h1>
      <p className="max-w-3xl text-sm text-white/65">{t("admin.tiersPage.hint")}</p>

      <GlassCard className="p-4 sm:p-6">
        <AdminToastForm action={updateCommissionTierAdminAction} className="grid gap-3 sm:grid-cols-12">
          <input type="hidden" name="id" value={cfg.id} />
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.tiersPage.tier1")}</span>
            <input
              name="tier1Bps"
              type="number"
              defaultValue={cfg.tier1Bps}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              required
            />
          </label>
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.tiersPage.tier2")}</span>
            <input
              name="tier2Bps"
              type="number"
              defaultValue={cfg.tier2Bps}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              required
            />
          </label>
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.tiersPage.tier3")}</span>
            <input
              name="tier3Bps"
              type="number"
              defaultValue={cfg.tier3Bps}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              required
            />
          </label>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35"
            >
              {t("admin.tiersPage.save")}
            </button>
          </div>
        </AdminToastForm>
      </GlassCard>
    </div>
  );
}
