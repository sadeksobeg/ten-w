import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { getWarMapData, getTerritoryLeaderboard } from "@/lib/growth/territory-service";
import { WarMapClient } from "@/components/growth/map/WarMapClient";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { auth } from "@/auth";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthMapPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  await requirePartnerDashboard(locale);
  const userId = session!.user!.id;
  const [data, leaderboard, t] = await Promise.all([
    getWarMapData(userId),
    getTerritoryLeaderboard(),
    getTranslations("Growth.map"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {data.myTerritory
            ? t("my_territory_stat", { city: t(`territories.${data.myTerritory}`) })
            : t("pick_territory")}
        </p>
      </div>

      <WarMapClient locale={locale} data={data} />

      <GlassCard className="p-4">
        <h2 className="text-sm font-bold text-gold">{t("legendTitle")}</h2>
        <ul className="mt-3 space-y-1 text-xs text-white/65">
          <li>{t("legendControlled")}</li>
          <li>{t("legendUnclaimed")}</li>
          <li>{t("legendRival")}</li>
        </ul>
      </GlassCard>

      {leaderboard.length > 0 ? (
        <GlassCard className="p-4">
          <h2 className="text-sm font-bold text-gold">{t("territoryLeaders")}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {leaderboard.map((row) => (
              <li key={row.key} className="flex justify-between gap-2">
                <span>{t(`territories.${row.key}`)}</span>
                <span className="text-white/70">
                  {row.topPartner.name} · {row.partnerCount}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
