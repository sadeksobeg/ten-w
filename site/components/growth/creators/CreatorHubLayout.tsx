"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  IconDashboard,
  IconChat,
  IconCalendar,
  IconEvents,
  IconRank,
  IconBattle,
  IconKit,
  IconShare,
  IconTrending,
  IconNetwork,
  IconBadge,
  IconSettings,
  IconPerson,
  IconBag,
  IconTrophy,
} from "@/components/growth/icons/GrowthIcons";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { CreatorLivePanel } from "./CreatorLivePanel";
import { CreatorDashboard } from "./CreatorDashboard";
import { CreatorChatSection } from "./CreatorChatSection";
import { CreatorPlanningSection } from "./CreatorPlanningSection";
import { CreatorChallengeSection } from "./CreatorChallengeSection";
import { CreatorLeaderboardSection } from "./CreatorLeaderboardSection";
import { CreatorBattlesSection } from "./CreatorBattlesSection";
import { CreatorKitSection } from "./CreatorKitSection";
import { CreatorAnalyticsSection } from "./CreatorAnalyticsSection";
import { CreatorNetworkSection } from "./CreatorNetworkSection";
import { CreatorProfileSection } from "./CreatorProfileSection";
import { CreatorLoungeErrorBoundary } from "./CreatorLoungeErrorBoundary";
import { CreatorProfileDrawer } from "./CreatorProfileDrawer";
import type { CreatorHubProps, CreatorHubSection } from "./CreatorHubTypes";
import { ensureCreatorDirectRoomAction } from "@/lib/growth/creator-arena-actions";

type NavItem = { id: CreatorHubSection; labelKey: string; icon: ComponentType<{ size?: number; className?: string }>; badge?: number };

const NAV_GROUPS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "groupOps",
    items: [
      { id: "dashboard", labelKey: "overview", icon: IconDashboard },
      { id: "chat", labelKey: "chat", icon: IconChat },
      { id: "planning", labelKey: "planning", icon: IconCalendar },
    ],
  },
  {
    titleKey: "groupCompetition",
    items: [
      { id: "challenge", labelKey: "challenge", icon: IconEvents },
      { id: "leaderboard", labelKey: "leaderboard", icon: IconRank },
      { id: "battles", labelKey: "battles", icon: IconBattle },
    ],
  },
  {
    titleKey: "groupTools",
    items: [
      { id: "kit", labelKey: "kit", icon: IconKit },
      { id: "analytics", labelKey: "analytics", icon: IconTrending },
    ],
  },
  {
    titleKey: "groupCommunity",
    items: [
      { id: "network", labelKey: "network", icon: IconNetwork },
      { id: "profile", labelKey: "profile", icon: IconBadge },
    ],
  },
];

const MOBILE_TABS: CreatorHubSection[] = ["dashboard", "chat", "challenge", "kit", "profile"];

export function CreatorHubLayout(props: CreatorHubProps) {
  const t = useTranslations("Creators.hub");
  const tNav = useTranslations("Creators.nav");
  const tStatus = useTranslations("Creators.status");
  const searchParams = useSearchParams();
  const [section, setSection] = useState<CreatorHubSection>("dashboard");
  const [rightOpen, setRightOpen] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [challengeDrawer, setChallengeDrawer] = useState(props.featuredCreator);
  const showWelcome = searchParams.get("welcome") === "1";

  const viewerName = props.viewer.displayName ?? props.viewer.name ?? props.viewer.email;
  const chatBadge = props.chatRooms.reduce((s, r) => s + r.unread, 0) + unreadChat;

  function navigate(next: CreatorHubSection) {
    if (next === "chat") setUnreadChat(0);
    setSection(next);
  }

  const main = useMemo(() => {
    switch (section) {
      case "dashboard":
        return (
          <CreatorDashboard
            locale={props.locale}
            viewer={props.viewer}
            metrics={props.metrics}
            challenge={props.challenge}
            featuredCreator={props.featuredCreator}
            recentSubmissions={props.recentSubmissions}
            onboarding={props.onboarding}
            viewerRank={props.viewerRank}
            clientDiscountCode={props.clientDiscountCode}
            onNavigate={navigate}
            onChallengeCreator={setChallengeDrawer}
          />
        );
      case "chat":
        return (
          <CreatorChatSection
            locale={props.locale}
            isRoomMember={props.isRoomMember}
            viewer={props.viewer}
            rooms={props.chatRooms}
            isActive={section === "chat"}
            onUnread={(n) => setUnreadChat((c) => c + n)}
          />
        );
      case "planning":
        return <CreatorPlanningSection userId={props.viewer.userId} contentIdeas={props.contentIdeas} />;
      case "challenge":
        return (
          <CreatorChallengeSection
            challenge={props.challenge}
            weekSubmissions={props.weekSubmissions}
            myUserId={props.viewer.userId}
          />
        );
      case "leaderboard":
        return <CreatorLeaderboardSection rows={props.cupRows} myUserId={props.viewer.userId} />;
      case "battles":
        return (
          <CreatorBattlesSection
            myUserId={props.viewer.userId}
            candidates={props.battleCandidates}
            history={props.battleHistory}
            activeBattle={props.activeBattle}
            pendingInvites={props.pendingInvites}
          />
        );
      case "kit":
        return (
          <CreatorKitSection
            clientDiscountCode={props.clientDiscountCode}
            commissionPercent={props.commissionPercent}
            salesProducts={props.salesProducts}
            viewerName={viewerName}
          />
        );
      case "analytics":
        return (
          <CreatorAnalyticsSection
            series={props.analyticsSeries}
            totalSubmissions={props.metrics.weekSubmissions}
            totalReferrals={props.metrics.utmRegistrations}
            cupPoints={props.metrics.cupScore}
            approvalRate={props.approvalRate}
          />
        );
      case "network":
        return (
          <CreatorNetworkSection
            directory={props.directory}
            myUserId={props.viewer.userId}
            onNavigate={navigate}
            onMessage={(peerId) => {
              void ensureCreatorDirectRoomAction(peerId).then(() => navigate("chat"));
            }}
          />
        );
      case "profile":
        return (
          <CreatorProfileSection
            locale={props.locale}
            badges={props.badges}
            milestones={props.milestones}
            statusCards={props.statusCards}
            myUserId={props.viewer.userId}
            bio={props.bio}
            specialty={props.specialty}
            status={props.viewer.status}
          />
        );
      default:
        return null;
    }
  }, [section, props, viewerName]);

  function badgeFor(id: CreatorHubSection): number | undefined {
    if (id === "chat" && chatBadge > 0) return chatBadge;
    if (id === "leaderboard" && props.viewerRank) return props.viewerRank;
    if (id === "battles" && props.activeBattles > 0) return props.activeBattles;
    return undefined;
  }

  return (
    <CreatorLoungeErrorBoundary>
      <div className="creator-hub-shell creator-arena-shell relative min-h-[70dvh] overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="relative z-10 flex min-h-[70dvh]">
          <aside className="creator-hub-sidebar hidden w-60 shrink-0 flex-col border-e lg:flex">
            <div className="border-b border-white/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--creator-secondary)]">T.E.N.E.G.T.A</p>
              <p className="mt-1 font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">{t("title")}</p>
            </div>
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <GrowthAvatar name={viewerName} email={props.viewer.email} avatarUrl={props.viewer.avatarUrl} avatarPreset={props.viewer.avatarPreset} size="md" />
                  {props.hasBadge ? (
                    <span className="absolute -bottom-1 -end-1"><BadgeIcon badgeKey="content_creator" earned size="sm" /></span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{viewerName}</p>
                  <span className="creator-status-pill bg-[var(--status-joined)]/20 text-sky-200">{tStatus(props.viewer.status.toLowerCase())}</span>
                  <Link href="/growth/settings" className="mt-1 block text-[10px] text-[var(--creator-secondary)] hover:underline">{t("editProfile")}</Link>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {NAV_GROUPS.map((g) => (
                <div key={g.titleKey} className="mb-3">
                  <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white/35">{tNav(g.titleKey)}</p>
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    const active = section === item.id;
                    const badge = badgeFor(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.id)}
                        className={`mb-0.5 flex w-full min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-start text-xs font-semibold ${active ? "creator-nav-active" : "text-white/60 hover:bg-white/[0.04] hover:text-white"}`}
                      >
                        <Icon size={16} className={active ? "text-[var(--creator-primary)]" : ""} />
                        <span className="flex-1">{tNav(item.labelKey)}</span>
                        {badge ? <span className="rounded-full bg-[var(--creator-primary)]/25 px-1.5 text-[9px] font-bold text-rose-200">{badge > 99 ? "99+" : badge}</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="border-t border-white/10 p-3 space-y-1">
              <Link href="/growth/settings" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-white/65 hover:bg-white/[0.04]">
                <IconSettings size={16} />
                {tNav("settings")}
              </Link>
              <Link href="/for-creators" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-[var(--creator-secondary)] hover:bg-white/[0.04]">
                <IconShare size={16} />
                {t("publicPage")}
              </Link>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="border-b border-white/10 px-4 py-4 sm:px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--creator-secondary)] lg:hidden">{t("title")}</p>
              <h1 className="font-[family-name:var(--font-cairo)] text-xl font-black text-white sm:text-2xl">{t("subtitle")}</h1>
              {showWelcome ? <p className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{t("welcome")}</p> : null}
              {!props.hasBadge && props.isRoomMember ? <p className="mt-2 rounded-xl border border-sky-500/25 bg-sky-500/8 px-3 py-2 text-[11px] text-sky-100">{t("hubActivated")}</p> : null}
            </header>
            <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">{main}</main>
          </div>

          {rightOpen ? (
            <aside className="hidden w-72 shrink-0 border-s border-white/10 p-4 xl:block">
              <CreatorLivePanel pulse={props.pulse} statusCards={props.statusCards} metrics={props.metrics} className="sticky top-4" />
            </aside>
          ) : null}
        </div>

        <nav className="creator-arena-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--creator-surface)]/95 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}>
          <div className="mx-auto flex max-w-lg justify-around px-1 pt-1">
            {MOBILE_TABS.map((id) => {
              const icons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
                dashboard: IconDashboard,
                chat: IconChat,
                challenge: IconTrophy,
                kit: IconBag,
                profile: IconPerson,
              };
              const Icon = icons[id]!;
              const active = section === id || (id === "challenge" && (section === "leaderboard" || section === "battles"));
              const badge = id === "chat" ? chatBadge : undefined;
              return (
                <button key={id} type="button" onClick={() => navigate(id === "challenge" ? "challenge" : id)} className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${active ? "text-[var(--creator-primary)]" : "text-white/55"}`}>
                  {active ? <span className="absolute top-1 size-1 rounded-full bg-[var(--creator-primary)]" /> : null}
                  <Icon size={18} />
                  <span>{tNav(id === "dashboard" ? "overview" : id)}</span>
                  {badge ? <span className="absolute end-3 top-1 rounded-full bg-[var(--creator-primary)] px-1 text-[8px] text-white">{badge > 9 ? "9+" : badge}</span> : null}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <CreatorProfileDrawer creator={challengeDrawer} onClose={() => setChallengeDrawer(null)} onChallenge={() => { setChallengeDrawer(null); navigate("battles"); }} />
    </CreatorLoungeErrorBoundary>
  );
}
