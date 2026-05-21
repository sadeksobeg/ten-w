import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { adminSendNotificationFormAction } from "@/lib/growth/actions";

export default async function GrowthAdminNotificationsPage() {
  const t = await getTranslations("Growth.admin.notifications");

  const recent = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("title")}
      </h1>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-bold">{t("sendTitle")}</h2>
        <form action={adminSendNotificationFormAction} className="mt-5 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("emailOptional")}</span>
            <input
              name="email"
              type="email"
              placeholder={t("allPartnersHint")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
            />
          </label>
          <label className="sm:col-span-8">
            <span className="text-xs text-white/55">{t("notifTitle")}</span>
            <input name="title" required className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
          </label>
          <label className="sm:col-span-12">
            <span className="text-xs text-white/55">{t("body")}</span>
            <textarea name="body" required rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" />
          </label>
          <label className="sm:col-span-12">
            <span className="text-xs text-white/55">{t("link")}</span>
            <input name="link" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" placeholder="/growth" />
          </label>
          <div className="sm:col-span-12">
            <button type="submit" className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg">
              {t("sendSubmit")}
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="divide-y divide-white/10">
          {recent.map((n) => (
            <div key={n.id} className="px-4 py-3 text-sm">
              <div className="font-semibold text-white/85">{n.title}</div>
              <div className="text-xs text-white/50">
                {n.user.name ?? n.user.email} · {n.type} · {new Date(n.createdAt).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-white/45 line-clamp-2">{n.body}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
