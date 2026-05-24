import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import {
  AdminBadgeGrantStudio,
} from "@/components/growth/admin/AdminBadgeGrantStudio";
import { AdminCreateBadgeForm } from "@/components/growth/admin/AdminCreateBadgeForm";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { revokeAdminBadgeAction } from "@/lib/growth/actions";
import { ensureAdminBadgeDefinitions } from "@/lib/growth/ensure-admin-badges";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminBadgesPage() {
  const t = await getTranslations("Growth");

  await ensureAdminBadgeDefinitions();

  const [allBadges, partners] = await Promise.all([
    prisma.badgeDefinition.findMany({
      orderBy: { key: "asc" },
      select: { key: true, name: true, description: true, type: true },
    }),
    prisma.user.findMany({
      where: { role: UserRole.PARTNER, partnerProfile: { isNot: null }, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        userBadges: { select: { badge: { select: { key: true } } } },
      },
    }),
  ]);

  const partnerOptions = partners.map((p) => ({
    userId: p.id,
    email: p.email,
    name: p.name,
    avatarUrl: p.avatarUrl,
    earnedBadgeKeys: p.userBadges.map((ub) => ub.badge.key),
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("admin.badgesPage.title")}
      </h1>

      <AdminBadgeGrantStudio adminBadges={allBadges} partners={partnerOptions} />

      <AdminCreateBadgeForm />

      <GlassCard>
        <h2 className="text-lg font-bold">{t("admin.badgesPage.revokeTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{t("admin.badgesPage.revokeHint")}</p>
        <form action={revokeAdminBadgeAction} className="mt-5 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-5">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("admin.badgesPage.email")}</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("admin.badgesPage.revokeBadgeKey")}</span>
            <select
              name="badgeKey"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {allBadges.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.name} ({b.key})
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="w-full rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-xs font-semibold text-rose-200"
            >
              {t("admin.badgesPage.revokeSubmit")}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
