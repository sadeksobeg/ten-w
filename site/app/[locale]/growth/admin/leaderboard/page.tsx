import { getTranslations } from "next-intl/server";
import { AdminLeaderboardClient } from "@/components/growth/admin/AdminLeaderboardClient";
import {
  compositeLeaderboardAll,
  getActiveLeaderboardSeason,
} from "@/lib/growth/leaderboard";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthAdminLeaderboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("Growth.admin.nav");
  const season = await getActiveLeaderboardSeason();
  const rows = await compositeLeaderboardAll(season.windowMs, {
    weightDeals: season.weightDeals,
    weightXp: season.weightXp,
    weightStreak: season.weightStreak,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {locale === "ar" ? "لوحة المتصدرين" : "Leaderboard control"}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {locale === "ar"
            ? "اضبط أوزان النقاط المركّبة (صفقات + XP + سلسلة) للشركاء."
            : "Configure composite scoring weights for partners."}
        </p>
      </div>
      <AdminLeaderboardClient locale={locale} season={season} rows={rows} />
      <p className="text-sm">
        <a href={`/${locale}/growth/admin/rewards`} className="text-gold/80 underline">
          {t("rewards")} →
        </a>
      </p>
    </div>
  );
}
