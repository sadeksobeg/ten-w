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

  const activeTotal = data.closedDeals + data.pendingDeals;
  const dealSub =
    locale === "ar"
      ? `${data.pendingDeals} نشطة · ${data.closedDeals} مغلقة`
      : `${data.pendingDeals} active · ${data.closedDeals} closed`;

  const rankSub =
    locale === "ar"
      ? `${data.compete.weeklyClosed} صفقة هذا الأسبوع`
      : `${data.compete.weeklyClosed} deals this week`;

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
        label={locale === "ar" ? "الصفقات" : "Deals"}
        value={data.pendingDeals}
        sub={dealSub}
        icon={<span aria-hidden>🎯</span>}
      />
      <StatCard
        label={locale === "ar" ? "ترتيبك هذا الأسبوع" : "Weekly rank"}
        value={`#${data.compete.weeklyRank}`}
        animateValue={false}
        sub={rankSub}
        trend={
          data.rankDelta !== 0
            ? { delta: data.rankDelta, label: locale === "ar" ? "مقارنة بالأسبوع الماضي" : "" }
            : undefined
        }
        icon={
          data.compete.weeklyRank <= 3 ? <span aria-hidden>🏆</span> : <span aria-hidden>📊</span>
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
