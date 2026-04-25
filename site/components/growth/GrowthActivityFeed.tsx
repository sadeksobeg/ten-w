"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DashboardActivity } from "@/lib/growth/get-dashboard";

type Props = {
  initial: DashboardActivity[];
};

export function GrowthActivityFeed({ initial }: Props) {
  const t = useTranslations("Growth.activity");
  const locale = useLocale();
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await fetch("/api/growth/activity", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { items: DashboardActivity[] };
        if (Array.isArray(data.items)) setItems(data.items);
      } catch {
        /* ignore */
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="text-xs font-semibold tracking-wide text-white/55">{t("title")}</div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">{t("empty")}</div>
        ) : (
          items.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-white/80">{row.headline}</div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-white/45">
                {row.amountCents != null && row.amountCents > 0 ? (
                  <span className="font-semibold text-gold/90">
                    {new Intl.NumberFormat(nfLocale, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(row.amountCents / 100)}
                  </span>
                ) : null}
                <time dateTime={row.createdAt}>
                  {new Intl.DateTimeFormat(nfLocale, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(row.createdAt))}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
