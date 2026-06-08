"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CreatorWorkflowStatus } from "@prisma/client";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorLoungeHeader } from "./CreatorLoungeHeader";
import { CreatorLoungeSidebar, CreatorLoungeMobileTabs } from "./CreatorLoungeSidebar";
import { CreatorLoungeActivityPanel } from "./CreatorLoungeActivityPanel";
import { CreatorLoungeHome, type CreatorSubmissionPreview } from "./CreatorLoungeHome";
import { CreatorLoungeChallenge } from "./CreatorLoungeChallenge";
import { CreatorLoungeCup } from "./CreatorLoungeCup";
import { CreatorLoungeBattles, type CreatorBattleHistoryItem } from "./CreatorLoungeBattles";
import { CreatorPartnershipKit } from "./CreatorPartnershipKit";
import { CreatorLoungeChatTab } from "./CreatorLoungeChatTab";
import { CreatorLoungeProfile } from "./CreatorLoungeProfile";
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
  | "chat"
  | "challenge"
  | "cup"
  | "battles"
  | "toolkit"
  | "profile";

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
  const [unreadChat, setUnreadChat] = useState(0);

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
    firstShare: Boolean(challenge?.submissionUrl),
  };

  const viewerName = viewer.displayName ?? viewer.name ?? viewer.email;

  function navigate(next: CreatorLoungeSection) {
    if (next === "chat") setUnreadChat(0);
    setSection(next);
  }

  const mainContent = useMemo(() => {
    switch (section) {
      case "home":
        return (
          <CreatorLoungeHome
            locale={locale}
            pulse={pulse}
            challenge={challenge}
            viewerRank={viewerRank}
            featuredCreator={featuredCreator}
            recentSubmissions={recentSubmissions}
            onboarding={onboarding}
            onNavigate={(s) => navigate(s)}
            onChallengeCreator={setChallengeDrawer}
          />
        );
      case "chat":
        return (
          <CreatorLoungeChatTab
            locale={locale}
            isRoomMember={isRoomMember}
            viewer={viewer}
            isActive={section === "chat"}
            onUnread={(n) => setUnreadChat((c) => c + n)}
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
      case "toolkit":
        return (
          <CreatorPartnershipKit
            clientDiscountCode={clientDiscountCode}
            commissionPercent={commissionPercent}
            salesProducts={salesProducts}
          />
        );
      case "profile":
        return (
          <CreatorLoungeProfile
            locale={locale}
            badges={badges}
            milestones={viewerProfile.milestones}
            statusCards={statusCards}
            myUserId={viewer.userId}
          />
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
    clientDiscountCode,
    commissionPercent,
    salesProducts,
    badges,
    viewerProfile.milestones,
    statusCards,
    viewerRank,
  ]);

  return (
    <CreatorLoungeErrorBoundary>
      <div className="creator-arena-shell relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(228,184,77,0.12), transparent 55%), linear-gradient(165deg, #080a10 0%, #0e1018 50%, #0a0c12 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl px-3 py-5 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          <div className="mb-5 text-center sm:mb-6 sm:text-start">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/80 sm:text-xs">
              {t("eyebrow")}
            </p>
            <h1 className="font-[family-name:var(--font-cairo)] text-xl font-black text-white sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-xs text-white/60 sm:mx-0 sm:text-sm">
              {t("subtitle")}
            </p>
            {showWelcome ? (
              <p className="mx-auto mt-3 max-w-md rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 sm:mx-0">
                {t("lounge.welcomeCelebration")}
              </p>
            ) : null}
            {!hasBadge && isRoomMember ? (
              <p className="mx-auto mt-2 max-w-lg rounded-xl border border-sky-500/25 bg-sky-500/8 px-4 py-2.5 text-[11px] leading-relaxed text-sky-100/90 sm:mx-0">
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

          <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:gap-6">
            <div className="hidden lg:block">
              <CreatorLoungeSidebar
                active={section}
                onNavigate={navigate}
                viewerRank={viewerRank}
                activeBattles={activeBattles}
                unreadChat={unreadChat}
                className="sticky top-4"
              />
            </div>

            <main className="min-w-0">{mainContent}</main>

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
              <h2 className="mb-3 text-center font-[family-name:var(--font-cairo)] text-base font-extrabold text-gold sm:text-start">
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

          <p className="mt-6 text-center text-[10px] text-white/35 lg:text-start">
            {t("footer")}
          </p>
        </div>
      </div>

      <CreatorLoungeMobileTabs
        active={section}
        onNavigate={navigate}
        viewerRank={viewerRank}
        activeBattles={activeBattles}
        unreadChat={unreadChat}
      />

      <CreatorProfileDrawer
        creator={challengeDrawer}
        onClose={() => setChallengeDrawer(null)}
        onChallenge={() => {
          setChallengeDrawer(null);
          navigate("battles");
        }}
      />
    </CreatorLoungeErrorBoundary>
  );
}
