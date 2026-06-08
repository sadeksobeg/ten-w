"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CreatorWorkflowStatus } from "@prisma/client";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorStatusBoard } from "@/components/growth/creators/CreatorStatusBoard";
import { CreatorLoungeHeader } from "./CreatorLoungeHeader";
import { CreatorLoungeSidebar, CreatorLoungeMobileTabs } from "./CreatorLoungeSidebar";
import { CreatorLoungeActivityPanel } from "./CreatorLoungeActivityPanel";
import { CreatorLoungeHome, type CreatorSubmissionPreview } from "./CreatorLoungeHome";
import { CreatorLoungeChallenge } from "./CreatorLoungeChallenge";
import { CreatorLoungeCup } from "./CreatorLoungeCup";
import { CreatorLoungeBattles, type CreatorBattleHistoryItem } from "./CreatorLoungeBattles";
import { CreatorLoungeStudio } from "./CreatorLoungeStudio";
import { CreatorLoungeAchievements } from "./CreatorLoungeAchievements";
import { CreatorLoungeErrorBoundary } from "./CreatorLoungeErrorBoundary";
import { CreatorProfileDrawer } from "./CreatorProfileDrawer";
import type { CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";
import type { CreatorOnboardingProgress } from "./CreatorOnboardingChecklist";
import type { BadgeGridItem } from "@/components/growth/badges/BadgeGrid";
import type {
  CreatorChallengeView,
  CreatorCupRow,
  CreatorPulseStats,
  CreatorStatusCard,
} from "@/lib/growth/creator-arena";

export type CreatorLoungeSection =
  | "home"
  | "challenge"
  | "cup"
  | "battles"
  | "studio"
  | "achievements"
  | "settings";

export type CreatorEventPreview = {
  slug: string;
  title: string;
  status: string;
  startAt: string;
  participantCount: number;
};

export type CreatorChatViewer = {
  userId: string;
  email: string;
  name: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
};

export type CreatorBattleCandidate = {
  userId: string;
  name: string;
  levelCode: string;
  initials: string;
};

export type CreatorViewerProfile = {
  status: CreatorWorkflowStatus;
  milestones: string[];
  totalSubmissions: number;
  featuredCount: number;
};

export type CreatorLoungeProps = {
  locale: string;
  hasBadge: boolean;
  isRoomMember: boolean;
  events: CreatorEventPreview[];
  pulse: CreatorPulseStats;
  statusCards: CreatorStatusCard[];
  cupRows: CreatorCupRow[];
  challenge: CreatorChallengeView | null;
  battleCandidates: CreatorBattleCandidate[];
  viewer: CreatorChatViewer;
  publicSlug: string | null;
  recentSubmissions?: CreatorSubmissionPreview[];
  featuredCreator?: CreatorFeaturedCreator | null;
  onboarding?: CreatorOnboardingProgress;
  viewerProfile?: CreatorViewerProfile;
  viewerRank?: number | null;
  activeBattles?: number;
  battleHistory?: CreatorBattleHistoryItem[];
  badges?: BadgeGridItem[];
  plannedDays?: string[];
  clientDiscountCode?: string | null;
  commissionPercent?: string;
  salesProducts?: Array<{ slug: string; name: string; priceCents: number }>;
};

export function CreatorLoungeLayout({
  locale,
  hasBadge,
  isRoomMember,
  events,
  pulse,
  statusCards,
  cupRows,
  challenge,
  battleCandidates,
  viewer,
  publicSlug,
  recentSubmissions = [],
  featuredCreator: featuredCreatorProp,
  onboarding: onboardingProp,
  viewerProfile: viewerProfileProp,
  viewerRank: viewerRankProp,
  activeBattles = 0,
  battleHistory = [],
  badges = [],
  plannedDays,
  clientDiscountCode = null,
  commissionPercent = "10%",
  salesProducts = [],
}: CreatorLoungeProps) {
  const t = useTranslations("Growth.creators");
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const [section, setSection] = useState<CreatorLoungeSection>("home");
  const [challengeDrawer, setChallengeDrawer] = useState<CreatorFeaturedCreator | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);

  const myCard = statusCards.find((c) => c.userId === viewer.userId);
  const viewerProfile: CreatorViewerProfile = viewerProfileProp ?? {
    status: myCard?.status ?? CreatorWorkflowStatus.JOINED,
    milestones: [],
    totalSubmissions: challenge?.hasSubmitted ? 1 : 0,
    featuredCount: 0,
  };

  const viewerRank =
    viewerRankProp ?? cupRows.find((r) => r.userId === viewer.userId)?.rank ?? null;

  const featuredCreator: CreatorFeaturedCreator | null =
    featuredCreatorProp ??
    (() => {
      const featured = statusCards.find((c) => c.status === CreatorWorkflowStatus.FEATURED);
      if (!featured) return null;
      return {
        userId: featured.userId,
        name: featured.name,
        avatarUrl: featured.avatarUrl,
        publicSlug: featured.publicSlug,
        featuredCount: viewerProfile.featuredCount,
        status: featured.status,
      };
    })();

  const onboarding: CreatorOnboardingProgress = onboardingProp ?? {
    profile: Boolean(publicSlug),
    introduce: isRoomMember,
    challenge: Boolean(challenge?.hasSubmitted),
    studio: Boolean(publicSlug),
    orderLink: Boolean(clientDiscountCode),
    firstShare: Boolean(challenge?.submissionUrl),
  };

  const viewerName = viewer.displayName ?? viewer.name ?? viewer.email;

  const mainContent = useMemo(() => {
    switch (section) {
      case "home":
        return (
          <CreatorLoungeHome
            locale={locale}
            isRoomMember={isRoomMember}
            viewer={viewer}
            pulse={pulse}
            featuredCreator={featuredCreator}
            recentSubmissions={recentSubmissions}
            onboarding={onboarding}
            clientDiscountCode={clientDiscountCode}
            commissionPercent={commissionPercent}
            salesProducts={salesProducts}
            onNavigate={(s) => setSection(s)}
            onChallengeCreator={setChallengeDrawer}
          />
        );
      case "challenge":
        return (
          <CreatorLoungeChallenge
            challenge={challenge}
            cupPreview={cupRows}
            myUserId={viewer.userId}
          />
        );
      case "cup":
        return <CreatorLoungeCup rows={cupRows} myUserId={viewer.userId} />;
      case "battles":
        return (
          <CreatorLoungeBattles candidates={battleCandidates} history={battleHistory} />
        );
      case "studio":
        return (
          <CreatorLoungeStudio
            publicSlug={publicSlug}
            plannedDays={plannedDays}
            clientDiscountCode={clientDiscountCode}
            commissionPercent={commissionPercent}
            salesProducts={salesProducts}
          />
        );
      case "achievements":
        return (
          <CreatorLoungeAchievements
            locale={locale}
            badges={badges}
            milestones={viewerProfile.milestones}
          />
        );
      case "settings":
        return (
          <div className="space-y-4">
            <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                {t("lounge.settingsTitle")}
              </h2>
              <p className="mt-1 text-xs text-white/55">{t("lounge.settingsSubtitle")}</p>
              <Link
                href="/growth/settings"
                className="mt-3 inline-flex text-xs font-semibold text-gold underline-offset-4 hover:underline"
              >
                {t("kit.profile")}
              </Link>
            </GlassCard>
            <CreatorStatusBoard cards={statusCards} myUserId={viewer.userId} />
          </div>
        );
      default:
        return null;
    }
  }, [
    section,
    locale,
    isRoomMember,
    viewer,
    pulse,
    featuredCreator,
    recentSubmissions,
    onboarding,
    challenge,
    cupRows,
    battleCandidates,
    battleHistory,
    publicSlug,
    plannedDays,
    badges,
    viewerProfile.milestones,
    statusCards,
    t,
  ]);

  return (
    <CreatorLoungeErrorBoundary>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(228,184,77,0.35), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(220,38,38,0.2), transparent 50%), linear-gradient(165deg, #0a0612 0%, #12081f 40%, #1a0a0a 100%)",
          }}
          aria-hidden
        />
        <ParticleEffect className="pointer-events-none absolute inset-0 opacity-30 sm:opacity-40" />

        <div className="relative z-10 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-4 text-center sm:mb-6">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/80 sm:text-xs">
              {t("eyebrow")}
            </p>
            <h1 className="font-[family-name:var(--font-cairo)] text-xl font-black text-white sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-xs text-white/60 sm:text-sm">{t("subtitle")}</p>
            {showWelcome ? (
              <p className="mx-auto mt-3 max-w-md rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                {t("lounge.welcomeCelebration")}
              </p>
            ) : null}
            {!hasBadge && isRoomMember ? (
              <p className="mx-auto mt-2 max-w-md rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[11px] text-gold/95">
                {t("adminGrantedAccess")}
              </p>
            ) : null}
          </div>

          <CreatorLoungeHeader
            locale={locale}
            hasBadge={hasBadge}
            viewerName={viewerName}
            viewerEmail={viewer.email}
            viewerAvatarUrl={viewer.avatarUrl}
            viewerAvatarPreset={viewer.avatarPreset}
            status={viewerProfile.status}
            activeCreators={statusCards.length}
          />

          <CreatorLoungeMobileTabs
            active={section}
            onNavigate={setSection}
            viewerRank={viewerRank}
            activeBattles={activeBattles}
          />

          <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:gap-6">
            <div className="hidden lg:block">
              <CreatorLoungeSidebar
                active={section}
                onNavigate={setSection}
                viewerRank={viewerRank}
                activeBattles={activeBattles}
                className="sticky top-4"
              />
            </div>

            <main className="min-w-0 space-y-4">{mainContent}</main>

            <div className="hidden lg:block">
              <CreatorLoungeActivityPanel
                pulse={pulse}
                statusCards={statusCards}
                className="sticky top-4"
              />
            </div>
          </div>

          <div className="mt-4 lg:hidden">
            <button
              type="button"
              onClick={() => setActivityOpen((v) => !v)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-white/70"
              aria-expanded={activityOpen}
            >
              {t("lounge.activityTitle")}
            </button>
            {activityOpen ? (
              <div className="mt-3">
                <CreatorLoungeActivityPanel pulse={pulse} statusCards={statusCards} />
              </div>
            ) : null}
          </div>

          {section === "home" && events.length > 0 ? (
            <section className="mt-6">
              <h2 className="mb-3 text-center font-[family-name:var(--font-cairo)] text-base font-extrabold text-gold">
                {t("eventsTitle")}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {events.map((ev) => (
                  <li key={ev.slug}>
                    <Link
                      href={`/growth/events/${ev.slug}`}
                      className="block min-h-11 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/40 hover:bg-gold/5"
                    >
                      <p className="font-bold text-white">{ev.title}</p>
                      <p className="mt-1 text-[11px] text-white/50">
                        {t("eventMeta", { status: ev.status, count: ev.participantCount })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-6 text-center text-[10px] text-white/35">{t("footer")}</p>
        </div>
      </div>

      <CreatorProfileDrawer
        creator={challengeDrawer}
        onClose={() => setChallengeDrawer(null)}
        onChallenge={() => {
          setChallengeDrawer(null);
          setSection("battles");
        }}
      />
    </CreatorLoungeErrorBoundary>
  );
}
