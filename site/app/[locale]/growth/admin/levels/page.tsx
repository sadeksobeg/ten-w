import { getTranslations } from "next-intl/server";
import { LevelPerksEditor } from "@/components/growth/admin/LevelPerksEditor";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { updateLevelAdminAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminLevelsPage() {
  const t = await getTranslations("Growth");
  const levels = await prisma.levelDefinition.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.levelsPage.title")}
      </h1>

      <div className="grid gap-5">
        {levels.map((lvl) => (
          <GlassCard key={lvl.id} className="p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold">
                  {lvl.name}{" "}
                  <span className="text-xs font-normal text-white/45">({lvl.code})</span>
                </div>
                <div className="text-xs text-white/45">
                  {t("admin.levelsOrderLabel", { n: lvl.order })}
                </div>
              </div>
            </div>
            <AdminToastForm action={updateLevelAdminAction} className="mt-5 grid gap-3 sm:grid-cols-12">
              <input type="hidden" name="levelId" value={lvl.id} />
              <label className="sm:col-span-4">
                <span className="text-xs text-white/55">{t("admin.levelsPage.minDeals")}</span>
                <input
                  name="minClosedDeals"
                  type="number"
                  defaultValue={lvl.minClosedDeals}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                  required
                />
              </label>
              <label className="sm:col-span-4">
                <span className="text-xs text-white/55">{t("admin.levelsPage.salaryUsd")}</span>
                <input
                  name="salaryUsd"
                  type="number"
                  defaultValue={lvl.salaryUsd ?? ""}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                  placeholder="0"
                />
              </label>
              <div className="flex items-end sm:col-span-4">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35"
                >
                  {t("admin.levelsPage.save")}
                </button>
              </div>
            </AdminToastForm>
            <LevelPerksEditor levelId={lvl.id} perksJson={lvl.perksJson} />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
