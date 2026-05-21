"use client";

import { DealStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  deals: DashboardData["deals"];
  journeyLabels: Record<string, string>;
};

const COLUMNS: DealStatus[] = [DealStatus.PENDING, DealStatus.CLOSED, DealStatus.LOST];

export function DealsKanbanBoard({ deals }: Props) {
  const t = useTranslations("Growth.deals");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((status) => {
        const col = deals.filter((d) => d.status === status);
        const label =
          status === DealStatus.CLOSED
            ? t("status.closed")
            : status === DealStatus.LOST
              ? t("status.lost")
              : t("status.pending");
        return (
          <div
            key={status}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{label}</h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/70">
                {col.length}
              </span>
            </div>
            <ul className="space-y-2">
              {col.length === 0 ? (
                <li className="text-xs text-white/45">{t("kanbanEmpty")}</li>
              ) : (
                col.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-white">{d.productName}</p>
                    <p className="mt-0.5 text-xs text-white/55">
                      {d.clientLabel ?? t("noClient")}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
