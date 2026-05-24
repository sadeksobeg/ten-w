import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { getWarMapData, getTerritoryLeaderboard } from "@/lib/growth/territory-service";
import { WarMapClient } from "@/components/growth/map/WarMapClient";
import { AscendAtlasBackdrop } from "@/components/growth/map/AscendAtlasBackdrop";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { ASCEND_PRODUCT_NAME } from "@/lib/growth/brand";

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
    <div className="relative -mx-1 space-y-6 pb-4 sm:-mx-2">
      <AscendAtlasBackdrop />

      <header className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1a1408] via-[#0a0c14] to-[#0f1428] px-5 py-7 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gold/25 blur-3xl motion-safe:animate-pulse motion-reduce:animate-none"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -start-12 size-40 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
          {ASCEND_PRODUCT_NAME}
        </p>
        <p className="relative mt-1 text-[11px] font-semibold text-gold/70">{t("syriaBadge")}</p>
        <h1 className="relative mt-3 font-[family-name:var(--font-cairo)] text-3xl font-black leading-tight text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
          {t("subtitle")}
        </p>
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
            {data.myTerritory
              ? t("my_territory_stat", { city: t(`territories.${data.myTerritory}`) })
              : t("pick_territory")}
          </span>
          {!data.myTerritory ? (
            <Link
              href="/growth/settings"
              className="inline-flex rounded-full bg-gradient-to-r from-[#B07D2B] to-[#E4B84D] px-4 py-2 text-xs font-bold text-black shadow-[0_0_24px_-4px_rgba(228,184,77,0.6)] hover:brightness-110"
            >
              {t("goSettings")}
            </Link>
          ) : null}
        </div>
      </header>

      <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
        <GlassCard className="border-gold/20 bg-black/40 p-3 text-center backdrop-blur-md">
          <p className="bg-gradient-to-b from-gold to-amber-200 bg-clip-text text-2xl font-black text-transparent">
            {claimedCount}
          </p>
          <p className="text-[10px] font-semibold text-white/50">{t("statClaimed")}</p>
        </GlassCard>
        <GlassCard className="border-sky-400/20 bg-black/40 p-3 text-center backdrop-blur-md">
          <p className="text-2xl font-black text-sky-300">{data.cities.length - claimedCount}</p>
          <p className="text-[10px] font-semibold text-white/50">{t("statOpen")}</p>
        </GlassCard>
        <GlassCard className="border-violet-400/20 bg-black/40 p-3 text-center backdrop-blur-md">
          <p className="text-2xl font-black text-violet-200">{data.networkLines.length}</p>
          <p className="text-[10px] font-semibold text-white/50">{t("statNetwork")}</p>
        </GlassCard>
      </div>

      <div className="relative">
        <WarMapClient locale={locale} data={data} />
      </div>

      <GlassCard className="relative border-white/10 bg-black/50 p-4 backdrop-blur-md sm:p-5">
        <h2 className="text-sm font-bold text-gold">{t("legendTitle")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs text-gold">
            <span className="size-2.5 rounded-full bg-gold shadow-[0_0_12px_#E4B84D]" aria-hidden />
            {t("legendControlled")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200">
            <span className="size-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" aria-hidden />
            {t("legendContested")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200">
            <span className="size-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" aria-hidden />
            {t("legendRival")}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
            <span className="size-2.5 rounded-full bg-white/25" aria-hidden />
            {t("legendUnclaimed")}
          </li>
        </ul>
      </GlassCard>

      {leaderboard.length > 0 ? (
        <GlassCard className="relative border-white/10 bg-black/50 p-4 backdrop-blur-md sm:p-5">
          <h2 className="text-sm font-bold text-gold">{t("territoryLeaders")}</h2>
          <ul className="mt-3 divide-y divide-white/10">
            {leaderboard.map((row, i) => (
              <li key={row.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                      i === 0
                        ? "bg-gradient-to-br from-gold to-amber-600 text-black"
                        : "bg-white/10 text-gold"
                    }`}
                  >
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
