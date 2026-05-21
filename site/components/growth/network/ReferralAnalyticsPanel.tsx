"use client";

import { useTranslations } from "next-intl";

type Props = {
  networkSize: number;
  closedDeals: number;
  referralCode: string;
};

export function ReferralAnalyticsPanel({ networkSize, closedDeals, referralCode }: Props) {
  const t = useTranslations("Growth.networkAnalytics");
  const conversion =
    networkSize > 0 ? Math.round((closedDeals / Math.max(networkSize, 1)) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs text-white/50">{t("downlines")}</p>
        <p className="mt-1 text-2xl font-bold text-gold">{networkSize}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs text-white/50">{t("yourCloses")}</p>
        <p className="mt-1 text-2xl font-bold text-white">{closedDeals}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs text-white/50">{t("activityIndex")}</p>
        <p className="mt-1 text-2xl font-bold text-purple-200">{conversion}%</p>
      </div>
      <p className="sm:col-span-3 text-xs text-white/45">
        {t("codeHint", { code: referralCode })}
      </p>
    </div>
  );
}
