"use client";

import { useTranslations } from "next-intl";
import type { CreatorAdminStats } from "./creator-admin-types";

type Props = {
  stats: CreatorAdminStats;
};

export function AdminCreatorStatsRow({ stats }: Props) {
  const t = useTranslations("Growth.creators.admin.stats");

  const items = [
    { label: t("totalCreators"), value: stats.totalCreators },
    { label: t("activeThisWeek"), value: stats.activeThisWeek },
    { label: t("featured"), value: stats.featured },
    { label: t("pendingSubmissions"), value: stats.pendingSubmissions },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t("aria")}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center sm:text-start"
        >
          <div className="text-xl font-extrabold text-gold">{item.value}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
