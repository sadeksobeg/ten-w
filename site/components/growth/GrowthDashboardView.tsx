import { DealStatus } from "@prisma/client";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { DashboardHero } from "@/components/growth/dashboard/DashboardHero";
import { DashboardStatsGrid } from "@/components/growth/dashboard/DashboardStatsGrid";
import { DashboardMissions } from "@/components/growth/dashboard/DashboardMissions";
import { DashboardBadgesSection } from "@/components/growth/dashboard/DashboardBadgesSection";
import { DashboardLeaderboardPreview } from "@/components/growth/dashboard/DashboardLeaderboardPreview";
import { ActivityHeatmap } from "@/components/growth/dashboard/ActivityHeatmap";
import { DealJourneyRow } from "@/components/growth/DealJourneyRow";
import {
  addLeadDealAction,
  recordMarketingKitHitAction,
  requestPayoutAction,
} from "@/lib/growth/actions";
import { GrowthActivityFeed } from "@/components/growth/GrowthActivityFeed";
import { MarketingKitProductCard } from "@/components/growth/MarketingKitProductCard";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";

type Props = {
  locale: string;
  data: DashboardData;
  celebrate?: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
};

export async function GrowthDashboardView({
  locale,
  data,
  userId,
  userName,
  userEmail,
  avatarUrl,
}: Props) {
  const t = await getTranslations("Growth");
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const products = data.products.map((p) => ({ id: p.id, name: p.name }));
  const powerLabel = getXpBrandLabel(locale);
  const journeyLabels = {
    lead: t("journey.steps.lead"),
    contacted: t("journey.steps.contacted"),
    negotiation: t("journey.steps.negotiation"),
    closed: t("journey.steps.closed"),
    paid: t("journey.steps.paid"),
  };

  return (
    <div className="space-y-10">
      <DashboardHero
        locale={locale}
        name={userName}
        email={userEmail}
        avatarUrl={avatarUrl}
        levelName={data.profile.levelName}
        levelOrder={data.profile.levelOrder}
        totalXp={data.profile.totalXp}
        currentLevelMinXp={data.currentLevelMinXp}
        nextLevelName={data.nextLevel?.name ?? null}
        nextLevelMinXp={data.nextLevel?.minXp ?? null}
      />

      <DashboardStatsGrid locale={locale} data={data} />

      <DashboardMissions locale={locale} missions={data.missions} />

      {await DashboardBadgesSection({ locale, badges: data.badges })}

      <ActivityHeatmap locale={locale} days={data.activityDays} memberDays={data.memberDays} />

      <DashboardLeaderboardPreview
        locale={locale}
        weekly={data.leaderboard}
        monthly={data.monthlyLeaderboard}
        season={data.leaderboardSeason}
        currentUserId={userId}
      />

      <GrowthActivityFeed initial={data.activityFeed} />

      <div className="flex flex-wrap gap-3 text-xs text-white/70">
        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 font-semibold text-purple-100">
          {t("powerPointsLine", { n: data.profile.totalXp, label: powerLabel })}
        </span>
        {data.nextLevel ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/70">
            {t("nextLevel", { name: data.nextLevel.name, n: data.nextLevel.minClosedDeals })}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/70">
            {t("maxLevel")}
          </span>
        )}
      </div>

      <GlassCard className="border border-white/12 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {t("hero.addLead")}
            </div>
            <div className="mt-2 text-sm text-white/70">
              {t("hero.addLeadHint")}
            </div>
          </div>
          <div className="text-xs text-white/45">
            {t("networkRefWithCode", { code: data.profile.referralCode })}
          </div>
        </div>

        <form action={addLeadDealAction} className="mt-6 grid gap-3 sm:grid-cols-12">
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.product")}</span>
            <select
              name="productId"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              defaultValue={products[0]?.id}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.client")}</span>
            <input
              name="clientLabel"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder={t("lead.clientPh")}
            />
          </label>
          <label className="sm:col-span-4">
            <span className="text-xs text-white/55">{t("lead.notes")}</span>
            <input
              name="notes"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              placeholder={t("lead.notesPh")}
            />
          </label>
          <div className="sm:col-span-12">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg shadow-[0_0_60px_-20px_rgba(201,160,97,0.75)] transition-transform hover:translate-y-[-1px] sm:w-auto"
            >
              + {t("hero.addLead")}
            </button>
          </div>
        </form>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">
              {t("deals.title")}
            </h2>
            <div className="text-xs text-white/50">
              {data.closedDeals} {t("deals.closed")} · {data.pendingDeals}{" "}
              {t("deals.pending")}
            </div>
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
            {t("journey.title")}
          </div>
          <div className="mt-5 space-y-3">
            {data.deals.length === 0 ? (
              <EmptyState
                illustration="rocket"
                message={t("deals.empty")}
                actionLabel={`+ ${t("hero.addLead")}`}
              />
            ) : (
              data.deals.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{d.productName}</div>
                    <div className="mt-1 text-xs text-white/55">
                      {d.clientLabel ?? t("deals.noClient")}
                    </div>
                    <DealJourneyRow
                      status={d.status}
                      steps={d.journey.steps}
                      labels={journeyLabels}
                      lostLabel={t("journey.lost")}
                    />
                  </div>
                  <div className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gold/90">
                    {d.status === DealStatus.CLOSED
                      ? t("deals.status.closed")
                      : d.status === DealStatus.LOST
                        ? t("deals.status.lost")
                        : t("deals.status.pending")}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">
            {t("network.title")}
          </h2>
          <div className="mt-5 space-y-3">
            {data.network.length === 0 ? (
              <div className="text-sm text-white/60">{t("network.empty")}</div>
            ) : (
              data.network.map((n) => (
                <div
                  key={n.userId}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-sm font-semibold">{n.name ?? n.email}</div>
                  <div className="mt-1 text-xs text-white/55">{n.email}</div>
                  <div className="mt-2 text-xs text-white/45">
                    {t("networkRefWithCode", { code: n.referralCode })}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="p-6 lg:col-span-7">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">
            {t("earnings.title")}
          </h2>
          <div className="mt-4 text-3xl font-semibold tracking-tight">
            {new Intl.NumberFormat(nfLocale, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(data.earningsCents / 100)}
          </div>
          <div className="mt-6 space-y-3">
            {data.ledger.length === 0 ? (
              <div className="text-sm text-white/60">{t("earnings.empty")}</div>
            ) : (
              data.ledger.slice(0, 8).map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                >
                  <div className="text-white/70">
                    {row.tier === 0
                      ? t("earnings.bonus")
                      : t("earnings.tier", { tier: row.tier })}
                  </div>
                  <div className="font-semibold text-gold/90">
                    {new Intl.NumberFormat(nfLocale, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(row.amountCents / 100)}
                  </div>
                </div>
              ))
            )}
          </div>

          <form action={requestPayoutAction} className="mt-8 grid gap-3 sm:grid-cols-12">
            <label className="sm:col-span-4">
              <span className="text-xs text-white/55">{t("earnings.withdrawAmount")}</span>
              <input
                name="amountUsd"
                type="number"
                min={10}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                placeholder="250"
                required
              />
            </label>
            <label className="sm:col-span-5">
              <span className="text-xs text-white/55">{t("earnings.method")}</span>
              <input
                name="method"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                placeholder={t("earnings.methodPh")}
              />
            </label>
            <div className="flex items-end sm:col-span-3">
              <button
                type="submit"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35"
              >
                {t("earnings.request")}
              </button>
            </div>
          </form>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-5">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">
            {t("leaderboard.title")}
          </h2>
          <div className="mt-5 space-y-3">
            {data.leaderboard.length === 0 ? (
              <div className="text-sm text-white/60">{t("leaderboard.empty")}</div>
            ) : (
              data.leaderboard.map((row, idx) => (
                <div
                  key={row.userId}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div className="text-sm text-white/80">
                    <span className="text-white/40">#{idx + 1}</span>{" "}
                    {row.name ?? t("leaderboard.anon")}
                  </div>
                  <div className="text-sm font-semibold text-gold/90">
                    {row.score}{" "}
                    <span className="text-[10px] text-white/40">
                      ({row.closedDeals} {locale === "ar" ? "صفقة" : "deals"})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {t("leaderboard.monthlyTitle")}
            </div>
            <div className="mt-2 text-xs text-white/50">
              {t("leaderboard.monthlyYou", {
                rank: data.monthlyRank.rank ?? "—",
                closed: data.monthlyRank.closedInWindow,
              })}
            </div>
            <div className="mt-4 space-y-3">
              {data.monthlyLeaderboard.length === 0 ? (
                <div className="text-sm text-white/60">{t("leaderboard.monthlyEmpty")}</div>
              ) : (
                data.monthlyLeaderboard.map((row, idx) => (
                  <div
                    key={row.userId}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="text-sm text-white/80">
                      <span className="text-white/40">#{idx + 1}</span>{" "}
                      {row.name ?? t("leaderboard.anon")}
                    </div>
                    <div className="text-sm font-semibold text-gold/90">{row.score}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {t("streak.title")}
            </div>
            <div className="mt-2 text-sm text-white/75">
              {t("streak.current", { n: data.streak?.current ?? 0 })} ·{" "}
              {t("streak.longest", { n: data.streak?.longest ?? 0 })}
            </div>
            <div className="mt-2 text-xs text-white/45">{t("streak.hint")}</div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-xs font-semibold tracking-wide text-white/55">
              {t("badges.title")}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.badges.length === 0 ? (
                <div className="text-sm text-white/60">{t("badges.empty")}</div>
              ) : (
                data.badges.map((b) => (
                  <span
                    key={b.key}
                    title={b.key}
                    className="rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100"
                  >
                    {b.hidden ? `${b.name} (${t("badges.hiddenTag")})` : b.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">
            {t("kit.title")}
          </h2>
          <form action={recordMarketingKitHitAction}>
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/80 hover:border-gold/35"
            >
              {t("kit.record")}
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {data.products.map((p) => (
            <MarketingKitProductCard
              key={p.id}
              locale={locale}
              productName={p.name}
              productSlug={p.slug}
              marketingKit={p.marketingKit}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
