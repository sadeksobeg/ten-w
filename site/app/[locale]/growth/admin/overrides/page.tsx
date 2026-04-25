import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { upsertPartnerCommissionOverrideAction } from "@/lib/growth/actions";

export default async function GrowthAdminOverridesPage() {
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.overridesPage.title")}
      </h1>
      <p className="max-w-2xl text-sm text-white/65">{t("admin.overridesPage.hint")}</p>
      <GlassCard className="p-4 sm:p-6">
        <form action={upsertPartnerCommissionOverrideAction} className="grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.overridesPage.email")}</span>
            <input
              name="partnerEmail"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.overridesPage.slug")}</span>
            <input
              name="productSlug"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder="clinic-system"
            />
          </label>
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.overridesPage.commissionUsd")}</span>
            <input
              name="commissionBaseUsd"
              type="number"
              step="0.01"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-12">
            <span className="text-xs text-white/55">{t("admin.overridesPage.note")}</span>
            <input
              name="note"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <div className="sm:col-span-12">
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:border-gold/35 sm:w-auto"
            >
              {t("admin.overridesPage.submit")}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
