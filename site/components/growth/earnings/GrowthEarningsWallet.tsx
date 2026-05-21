"use client";

import { useTranslations } from "next-intl";
import { StatCard } from "@/components/growth/ui/StatCard";
import type { PartnerWallet } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  wallet: PartnerWallet;
};

export function GrowthEarningsWallet({ locale, wallet }: Props) {
  const t = useTranslations("Growth.earnings.wallet");
  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <section>
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold text-white">
        {t("title")}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl ring-1 ring-emerald-500/30">
          <StatCard
            label={t("available")}
            value={fmt(wallet.availableCents)}
            colorClass="text-emerald-300"
            animateValue={false}
          />
        </div>
        <div className="rounded-2xl ring-1 ring-amber-500/25">
          <StatCard
            label={t("pending")}
            value={fmt(wallet.pendingCents)}
            colorClass="text-amber-200"
            animateValue={false}
          />
        </div>
        <div className="rounded-2xl ring-1 ring-white/15">
          <StatCard
            label={t("paid")}
            value={fmt(wallet.paidOutCents)}
            colorClass="text-white/80"
            animateValue={false}
          />
        </div>
      </div>
    </section>
  );
}
