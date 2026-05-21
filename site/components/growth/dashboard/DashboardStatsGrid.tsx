"use client";

import { StatCard } from "@/components/growth/ui/StatCard";
import type { DashboardData } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
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

export function DashboardStatsGrid({ locale, data }: Props) {
  const monthLabel =
    locale === "ar"
      ? `هذا الشهر: ${money(data.earningsThisMonthCents, locale)}`
      : locale === "fr"
        ? `Ce mois: ${money(data.earningsThisMonthCents, locale)}`
        : `This month: ${money(data.earningsThisMonthCents, locale)}`;

  const dealSub =
    locale === "ar"
      ? `${data.closedDeals} مغلقة · ${data.pendingDeals} قيد المتابعة${data.lostDeals > 0 ? ` · ${data.lostDeals} خسارة` : ""}`
      : locale === "fr"
        ? `${data.closedDeals} fermées · ${data.pendingDeals} en cours`
        : `${data.closedDeals} closed · ${data.pendingDeals} pending`;

  const rankSub =
    locale === "ar"
      ? `${data.compete.weeklyClosed} صفقة هذا الأسبوع`
      : locale === "fr"
        ? `${data.compete.weeklyClosed} deals cette semaine`
        : `${data.compete.weeklyClosed} deals this week`;

  const rankDisplay =
    data.compete.weeklyRank === null
      ? locale === "ar"
        ? "غير مُصنَّف"
        : locale === "fr"
          ? "Non classé"
          : "Unranked"
      : `#${data.compete.weeklyRank}`;

  const streakSub = data.streak
    ? locale === "ar"
      ? `${data.streak.current} يوم متواصل`
      : `${data.streak.current} day streak`
    : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={locale === "ar" ? "الأرباح الإجمالية" : "Total earnings"}
        value={data.earningsCents / 100}
        valueFormat={(n) => money(Math.round(n * 100), locale)}
        sub={monthLabel}
        icon={<span aria-hidden>💰</span>}
      />
      <StatCard
        label={
          locale === "ar" ? "الصفقات المغلقة" : locale === "fr" ? "Deals fermés" : "Closed deals"
        }
        value={data.closedDeals}
        sub={dealSub}
        icon={<span aria-hidden>🎯</span>}
      />
      <StatCard
        label={
          locale === "ar" ? "ترتيبك هذا الأسبوع" : locale === "fr" ? "Classement hebdo" : "Weekly rank"
        }
        value={rankDisplay}
        animateValue={false}
        sub={rankSub}
        trend={
          data.rankDelta !== 0
            ? {
                delta: data.rankDelta,
                label:
                  locale === "ar"
                    ? "مقارنة بالأسبوع السابق"
                    : locale === "fr"
                      ? "vs semaine précédente"
                      : "vs prior week",
              }
            : undefined
        }
        icon={
          data.compete.weeklyRank !== null && data.compete.weeklyRank <= 3 ? (
            <span aria-hidden>🏆</span>
          ) : (
            <span aria-hidden>📊</span>
          )
        }
      />
      <StatCard
        label={locale === "ar" ? "سلسلة النشاط" : "Activity streak"}
        value={data.streak?.current ?? 0}
        sub={streakSub}
        icon={<span aria-hidden>🔥</span>}
      />
    </div>
  );
}
