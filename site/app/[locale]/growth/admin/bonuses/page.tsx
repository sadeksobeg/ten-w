import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { grantManualBonusAdminAction } from "@/lib/growth/actions";

export default async function GrowthAdminBonusesPage() {
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.bonusesPage.title")}
      </h1>
      <p className="max-w-2xl text-sm text-white/65">{t("admin.bonusesPage.hint")}</p>
      <GlassCard className="p-4 sm:p-6">
        <form action={grantManualBonusAdminAction} className="grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.bonusesPage.email")}</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-3">
            <span className="text-xs text-white/55">{t("admin.bonusesPage.amountUsd")}</span>
            <input
              name="amountUsd"
              type="number"
              min={1}
              step="1"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-5">
            <span className="text-xs text-white/55">{t("admin.bonusesPage.note")}</span>
            <input
              name="note"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <div className="sm:col-span-12">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg sm:w-auto"
            >
              {t("admin.bonusesPage.submit")}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
