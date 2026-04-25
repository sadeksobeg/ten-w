import { BadgeType } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { assignAdminBadgeAction, revokeAdminBadgeAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminBadgesPage() {
  const t = await getTranslations("Growth");
  const [adminBadges, allBadges] = await Promise.all([
    prisma.badgeDefinition.findMany({
      where: { type: BadgeType.ADMIN },
      orderBy: { key: "asc" },
    }),
    prisma.badgeDefinition.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.badgesPage.title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <form action={assignAdminBadgeAction} className="grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-5">
            <span className="text-xs text-white/55">{t("admin.badgesPage.email")}</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.badgesPage.badgeKey")}</span>
            <select
              name="badgeKey"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {adminBadges.map((b) => (
                <option key={b.id} value={b.key}>
                  {b.key}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-4 py-3 text-xs font-extrabold text-bg"
            >
              {t("admin.badgesPage.submit")}
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("admin.badgesPage.revokeTitle")}</h2>
        <p className="mt-2 text-sm text-white/55">{t("admin.badgesPage.revokeHint")}</p>
        <form action={revokeAdminBadgeAction} className="mt-5 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-5">
            <span className="text-xs text-white/55">{t("admin.badgesPage.email")}</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("admin.badgesPage.revokeBadgeKey")}</span>
            <select
              name="badgeKey"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {allBadges.map((b) => (
                <option key={b.id} value={b.key}>
                  {b.key}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200 hover:border-red-400/50"
            >
              {t("admin.badgesPage.revokeSubmit")}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
