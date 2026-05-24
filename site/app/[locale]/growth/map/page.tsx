import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { getWarMapData, getTerritoryLeaderboard } from "@/lib/growth/territory-service";
import { WarMapClient } from "@/components/growth/map/WarMapClient";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { Link } from "@/i18n/navigation";
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

  const claimedCount = data.cities.filter((c) => !c.isUnclaimed).length;

  return (
    <div className="space-y-6 pb-2">
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-transparent to-sky-500/5 px-4 py-5 sm:px-6">
        <div
          className="pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
          {t("syriaBadge")}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/60">{t("subtitle")}</p>
        <p className="mt-3 text-xs font-semibold text-white/50">
          {data.myTerritory
            ? t("my_territory_stat", { city: t(`territories.${data.myTerritory}`) })
            : t("pick_territory")}
        </p>
        {!data.myTerritory ? (
          <Link
            href="/growth/settings"
            className="mt-4 inline-flex rounded-full border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/25"
          >
            {t("goSettings")}
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <GlassCard className="p-3 text-center">
          <p className="text-lg font-extrabold text-gold">{claimedCount}</p>
          <p className="text-[10px] text-white/50">{t("statClaimed")}</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-lg font-extrabold text-sky-300">{data.cities.length - claimedCount}</p>
          <p className="text-[10px] text-white/50">{t("statOpen")}</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-lg font-extrabold text-white">{data.networkLines.length}</p>
          <p className="text-[10px] text-white/50">{t("statNetwork")}</p>
        </GlassCard>
      </div>

      <WarMapClient locale={locale} data={data} />

      <GlassCard className="p-4 sm:p-5">
        <h2 className="text-sm font-bold text-gold">{t("legendTitle")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
            <span className="size-2.5 rounded-full bg-gold shadow-[0_0_8px_#E4B84D]" aria-hidden />
            {t("legendControlled")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200">
            <span className="size-2.5 rounded-full bg-sky-400" aria-hidden />
            {t("legendContested")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200">
            <span className="size-2.5 rounded-full bg-rose-400" aria-hidden />
            {t("legendRival")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
            <span className="size-2.5 rounded-full bg-white/25" aria-hidden />
            {t("legendUnclaimed")}
          </li>
        </ul>
      </GlassCard>

      {leaderboard.length > 0 ? (
        <GlassCard className="p-4 sm:p-5">
          <h2 className="text-sm font-bold text-gold">{t("territoryLeaders")}</h2>
          <ul className="mt-3 divide-y divide-white/10">
            {leaderboard.map((row, i) => (
              <li key={row.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] font-black text-gold">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-semibold text-white">
                    {t(`territories.${row.key}`)}
                  </span>
                </div>
                <span className="shrink-0 text-end text-xs text-white/60">
                  {row.topPartner.name}
                  <span className="text-white/35"> · {row.partnerCount}</span>
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
