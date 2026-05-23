import { getTranslations } from "next-intl/server";
import { getAdminQuickStats } from "@/lib/growth/get-admin-quick-stats";

export async function AdminStatsBar() {
  const t = await getTranslations("Growth.admin.statsBar");
  const stats = await getAdminQuickStats();

  const items = [
    { label: t("partners"), value: stats.partners },
    { label: t("pendingDeals"), value: stats.pendingDeals },
    { label: t("pendingPayouts"), value: stats.pendingPayouts },
    { label: t("openChats"), value: stats.openChats },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t("aria")}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center sm:text-start"
        >
          <div className="text-lg font-extrabold text-gold">{item.value}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
