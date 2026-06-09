"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { IconEvents, IconTrophy, IconShare, IconBattle, IconKit } from "@/components/growth/icons/GrowthIcons";
import { CreatorFeaturedSpotlight } from "./CreatorFeaturedSpotlight";
import { CreatorOnboardingChecklist } from "./CreatorOnboardingChecklist";
import { CreatorWeekGlance } from "./CreatorWeekGlance";
import { CreatorStreakCard } from "./CreatorStreakCard";
import type { CreatorHubProps, CreatorHubSection } from "./CreatorHubTypes";
import type { CreatorWeekStreakData } from "@/lib/growth/creator-arena";

type Props = Pick<
  CreatorHubProps,
  | "viewer"
  | "metrics"
  | "challenge"
  | "featuredCreator"
  | "recentSubmissions"
  | "onboarding"
  | "viewerRank"
  | "clientDiscountCode"
  | "locale"
  | "activeBattles"
  | "weekStreak"
  | "challengeSubmitCount"
  | "challengeParticipantCount"
> & {
  onNavigate: (s: CreatorHubSection) => void;
  onChallengeCreator?: (c: NonNullable<CreatorHubProps["featuredCreator"]>) => void;
  weekStreak: CreatorWeekStreakData;
  challengeSubmitCount: number;
  challengeParticipantCount: number;
};

function greetingKey(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 0 && hour < 4) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function dynamicStatusKey(
  challenge: CreatorHubProps["challenge"],
  streakWeeks: number,
  rankDelta: number,
): "urgent" | "streak" | "rankUp" | "default" {
  if (challenge && !challenge.hasSubmitted && challenge.endsAt) {
    const hrs = (new Date(challenge.endsAt).getTime() - Date.now()) / 3600000;
    if (hrs > 0 && hrs < 24) return "urgent";
  }
  if (streakWeeks > 7) return "streak";
  if (rankDelta > 0) return "rankUp";
  return "default";
}

export function CreatorDashboard({
  viewer,
  metrics,
  challenge,
  featuredCreator,
  recentSubmissions,
  onboarding,
  viewerRank,
  clientDiscountCode,
  onNavigate,
  onChallengeCreator,
  activeBattles,
  weekStreak,
  challengeSubmitCount,
  challengeParticipantCount,
}: Props) {
  const t = useTranslations("Creators.hub");
  const tStatus = useTranslations("Creators.status");
  const greet = useMemo(() => greetingKey(new Date().getHours()), []);
  const statusKey = useMemo(
    () => dynamicStatusKey(challenge, weekStreak.consecutiveWeeks, metrics.weekPointsDelta > 0 ? 1 : 0),
    [challenge, weekStreak.consecutiveWeeks, metrics.weekPointsDelta],
  );
  const name = viewer.displayName ?? viewer.name ?? viewer.email;
  const hoursLeft = challenge?.endsAt
    ? Math.max(0, Math.round((new Date(challenge.endsAt).getTime() - Date.now()) / 3600000))
    : null;
  const contactHref = clientDiscountCode
    ? `/contact?code=${encodeURIComponent(clientDiscountCode)}`
    : "/contact";

  const subState = !challenge?.hasSubmitted
    ? "none"
    : challenge.submissionStatus === "approved"
      ? "approved"
      : challenge.submissionStatus === "rejected"
        ? "rejected"
        : "pending";

  return (
    <div className="space-y-4">
      <GlassCard className="creator-card creator-glow-rose overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <GrowthAvatar name={name} email={viewer.email} avatarUrl={viewer.avatarUrl} avatarPreset={viewer.avatarPreset} size="lg" />
            <div>
              <p className="text-sm text-[var(--creator-text-sub)]">{t(`greeting.${greet}`, { name })}</p>
              <p
                className={`mt-1 text-xs ${
                  statusKey === "urgent"
                    ? "text-rose-300"
                    : statusKey === "streak"
                      ? "text-[var(--creator-secondary)]"
                      : statusKey === "rankUp"
                        ? "text-emerald-300"
                        : "text-white/45"
                }`}
              >
                {statusKey === "urgent" && hoursLeft != null
                  ? t("status.urgent", { hours: hoursLeft })
                  : statusKey === "streak"
                    ? t("status.streak", { n: weekStreak.consecutiveWeeks })
                    : statusKey === "rankUp"
                      ? t("status.rankUp", { rank: viewerRank ?? "—" })
                      : t("status.default")}
              </p>
              <span className="creator-status-pill mt-1 inline-block bg-[var(--status-submitted)]/20 text-emerald-200">
                {tStatus(viewer.status.toLowerCase())}
              </span>
              {viewerRank ? (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                  <IconTrophy size={12} className="text-[var(--creator-secondary)]" />
                  {t("rankLabel", { rank: viewerRank })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-end">
            <p className="text-[10px] uppercase text-white/45">{t("weekPoints")}</p>
            <p className="creator-metric">{metrics.cupScore}</p>
            {metrics.weekPointsDelta !== 0 ? (
              <p className="text-[11px] text-emerald-300">{t("weekDelta", { n: metrics.weekPointsDelta })}</p>
            ) : null}
          </div>
        </div>
      </GlassCard>

      <div className="creator-quick-actions lg:flex lg:gap-2 lg:overflow-x-auto lg:pb-1">
        <GoldButton type="button" className="text-xs" onClick={() => onNavigate("challenge")}>
          {t("actionSubmit")}
        </GoldButton>
        <Link href={contactHref} className="flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/80 hover:border-[var(--creator-primary)]">
          <IconShare size={14} className="me-1 inline" />
          {t("actionCopyLink")}
        </Link>
        <button type="button" className="flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/80" onClick={() => onNavigate("battles")}>
          <IconBattle size={14} className="me-1 inline" />
          {t("actionBattle")}
        </button>
        <button type="button" className="flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/80" onClick={() => onNavigate("kit")}>
          <IconKit size={14} className="me-1 inline" />
          {t("actionKit")}
        </button>
      </div>

      <CreatorWeekGlance
        weekSubmissions={metrics.weekSubmissions}
        weekTarget={3}
        cupScore={metrics.cupScore}
        cupTarget={500}
        referrals={metrics.utmClicks}
        activeBattles={activeBattles}
        rank={viewerRank}
        onNavigate={onNavigate}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <CreatorStreakCard streak={weekStreak} />
        <div className="creator-metrics-grid grid gap-3 sm:grid-cols-2">
        {[
          { key: "submissions", value: metrics.weekSubmissions, sub: t("metricSubHint") },
          { key: "cup", value: metrics.cupScore, sub: viewerRank ? `#${viewerRank}` : "—" },
          { key: "referrals", value: metrics.utmClicks, sub: t("metricRefHint", { reg: metrics.utmRegistrations }) },
          { key: "streak", value: metrics.streakWeeks, sub: t("metricStreakHint") },
        ].map((m) => (
          <div key={m.key} className="creator-card p-4">
            <p className="text-[10px] uppercase text-white/45">{t(`metric.${m.key}`)}</p>
            <p className="creator-metric mt-1">{m.value}</p>
            <p className="text-[11px] text-white/50">{m.sub}</p>
          </div>
        ))}
        </div>
      </div>

      {challenge ? (
        <GlassCard
          className={`creator-card p-5 ${
            subState !== "none"
              ? "border-emerald-500/35 bg-gradient-to-br from-emerald-950/40 to-transparent"
              : hoursLeft != null && hoursLeft < 24
                ? "border-rose-500/40 bg-gradient-to-br from-rose-950/50 to-transparent creator-glow-rose"
                : "border-[var(--creator-secondary)]/30 bg-gradient-to-br from-amber-950/30 to-transparent"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-200">
              {hoursLeft != null && hoursLeft < 24 && subState === "none" ? (
                <>
                  <span className="size-1.5 animate-pulse rounded-full bg-rose-400" />
                  {t("challengeUrgent", { hours: hoursLeft })}
                </>
              ) : (
                t("challengeLive")
              )}
            </span>
            {subState !== "none" ? (
              <span className="text-xs text-emerald-200">{t("challengeDone")}</span>
            ) : null}
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{challenge.title}</h2>
          {subState === "none" && challengeParticipantCount > 0 ? (
            <p className="mt-1 text-xs text-white/55">
              {t("challengeSocial", { n: challengeSubmitCount, total: challengeParticipantCount })}
            </p>
          ) : null}
          {subState === "none" ? (
            <GoldButton type="button" className="mt-3 text-xs" onClick={() => onNavigate("challenge")}>
              {t("challengeCta")}
            </GoldButton>
          ) : challenge.submissionUrl ? (
            <a href={challenge.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-[var(--creator-secondary)] underline">
              {challenge.submissionUrl}
            </a>
          ) : null}
        </GlassCard>
      ) : null}

      <CreatorOnboardingChecklist progress={onboarding} onNavigate={onNavigate} />

      <div className="grid gap-4 md:grid-cols-2">
        <CreatorFeaturedSpotlight creator={featuredCreator} onChallenge={onChallengeCreator} />
        <GlassCard className="creator-card p-5">
          <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("recentTitle")}</h3>
          {recentSubmissions.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">{t("recentEmpty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentSubmissions.map((s) => (
                <li key={s.id}>
                  <a href={s.postUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-[var(--creator-secondary)] hover:underline">
                    {s.name}: {s.postUrl}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
