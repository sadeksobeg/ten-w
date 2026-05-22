"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { StatCard } from "@/components/growth/ui/StatCard";
import {
  IconDeals,
  IconEarnings,
  IconRank,
  IconStreak,
} from "@/components/growth/icons/GrowthIcons";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  data: DashboardData;
};

function money(cents: number, locale: string) {
  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(nf, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function DashboardStatsGrid({ data }: Props) {
  const t = useTranslations("Growth.dashboard.stats");
  const locale = useLocale();

  const rankDisplay =
    data.compete.weeklyRank === null ? t("unranked") : `#${data.compete.weeklyRank}`;

  const streakSub = data.streak ? t("streakSub", { n: data.streak.current }) : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("totalEarnings")}
        value={data.earningsCents / 100}
        sub={t("thisMonth", { amount: money(data.earningsThisMonthCents, locale) })}
        icon={<IconEarnings size={32} className="text-gold" />}
        animateValue
        valueFormat={(n) => money(Math.round(n * 100), locale)}
      />
      <StatCard
        label={t("deals")}
        value={data.closedDeals}
        sub={t("dealsSub", { closed: data.closedDeals, pending: data.pendingDeals })}
        icon={<IconDeals size={32} className="text-gold" />}
      />
      <StatCard
        label={t("rank")}
        value={rankDisplay}
        sub={t("rankSub", { n: data.compete.weeklyClosed })}
        icon={<IconRank size={32} className="text-gold" />}
        animateValue={false}
      />
      <StatCard
        label={t("streak")}
        value={data.streak?.current ?? 0}
        sub={streakSub}
        icon={<IconStreak size={32} className="text-gold" />}
      />
    </div>
  );
}
