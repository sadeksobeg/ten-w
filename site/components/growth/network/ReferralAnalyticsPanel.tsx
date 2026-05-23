"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  networkSize: number;
  closedDeals: number;
  referralCode: string;
  baseUrl: string;
};

export function ReferralAnalyticsPanel({
  networkSize,
  closedDeals,
  referralCode,
  baseUrl,
}: Props) {
  const t = useTranslations("Growth.networkAnalytics");
  const [copied, setCopied] = useState(false);
  const conversion =
    networkSize > 0 ? Math.round((closedDeals / Math.max(networkSize, 1)) * 100) : 0;
  const utmLink = `${baseUrl}?ref=${encodeURIComponent(referralCode)}&utm_source=partner&utm_medium=referral&utm_campaign=growth`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(utmLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

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
      <div className="sm:col-span-3 flex flex-col gap-2">
        <p className="text-xs text-white/45">{t("codeHint", { code: referralCode })}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-start text-xs text-white/70 hover:border-gold/35"
        >
          {copied ? t("copied") : t("copyUtm")}
        </button>
      </div>
    </div>
  );
}
