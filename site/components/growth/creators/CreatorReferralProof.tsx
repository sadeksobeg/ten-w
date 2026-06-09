"use client";

import { useTranslations } from "next-intl";
import type { CreatorReferralRow } from "@/lib/growth/creator-arena";

type Props = {
  rows: CreatorReferralRow[];
  totalCents: number;
};

export function CreatorReferralProof({ rows, totalCents }: Props) {
  const t = useTranslations("Creators.hub.referralProof");

  return (
    <div className="creator-card p-5">
      <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("title")}</h3>
      <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">{t("empty")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-xs">
              <span className="min-w-0 truncate text-white/75">{r.label}</span>
              <span className="shrink-0 font-bold text-[var(--creator-secondary)]">
                {t("commission", { amount: (r.amountCents / 100).toFixed(0) })}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm font-bold text-emerald-200">
        {t("total", { amount: (totalCents / 100).toFixed(0) })}
      </p>
    </div>
  );
}
