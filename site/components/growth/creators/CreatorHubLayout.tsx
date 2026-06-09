"use client";

import { useCallback, useEffect, useState, useTransition, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
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
  IconBack,
  IconMenu,
} from "@/components/growth/icons/GrowthIcons";
import { CreatorLivePanel } from "./CreatorLivePanel";
import { CreatorHubSectionHost } from "./CreatorHubSectionHost";
import { CreatorHubSettingsLink } from "./CreatorHubSettingsLink";
import { CreatorLoungeErrorBoundary } from "./CreatorLoungeErrorBoundary";
import { CreatorProfileDrawer } from "./CreatorProfileDrawer";
import type { CreatorHubProps, CreatorHubSection } from "./CreatorHubTypes";
import {
  recordCreatorConsentAction,
} from "@/lib/growth/creator-arena-actions";
import {
  CreatorCelebrationOverlay,
  type CelebrationPayload,
} from "./CreatorCelebrationOverlay";
import { CreatorConsentModal } from "./CreatorConsentModal";
import { CreatorHubProfileCard } from "./CreatorHubProfileCard";
import type { ConsentLocale } from "@/lib/growth/creator-consent";
import { useToast } from "@/hooks/useToast";

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

const MOBILE_MORE_SECTIONS: CreatorHubSection[] = [
  "planning",
  "leaderboard",
  "battles",
  "analytics",
  "network",
];

const SECTION_LABEL_KEYS: Record<CreatorHubSection, string> = {
  dashboard: "overview",
  chat: "chat",
  planning: "planning",
  challenge: "challenge",
  leaderboard: "leaderboard",
  battles: "battles",
  kit: "kit",
  analytics: "analytics",
  network: "network",
  profile: "profile",
};

export function CreatorHubLayout(props: CreatorHubProps) {
  const t = useTranslations("Creators.hub");
  const tConsent = useTranslations("Creators.consent");
  const tNav = useTranslations("Creators.nav");
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [section, setSection] = useState<CreatorHubSection>("dashboard");
  const [visited, setVisited] = useState<Set<CreatorHubSection>>(() => new Set(["dashboard"]));
  const [isNavPending, startNavTransition] = useTransition();
  const [rightOpen] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [challengeDrawer, setChallengeDrawer] = useState(props.featuredCreator);
  const [moreOpen, setMoreOpen] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const dismissCelebration = useCallback(() => setCelebration(null), []);
  const [consentOpen, setConsentOpen] = useState(props.needsConsent);
  const [consentGiven, setConsentGiven] = useState(props.consentGiven);
  const showWelcome = searchParams.get("welcome") === "1";
  const consentLocale = (props.locale === "en" || props.locale === "fr"
    ? props.locale
    : "ar") as ConsentLocale;

  useEffect(() => {
    router.prefetch("/growth/settings");
    router.prefetch("/for-creators");
  }, [router]);

  useEffect(() => {
    setConsentOpen(props.needsConsent);
    setConsentGiven(props.consentGiven);
  }, [props.needsConsent, props.consentGiven]);

  useEffect(() => {
    if (showWelcome) {
      setCelebration({ type: "badge", badgeName: t("title") });
      return;
    }
    const kind = searchParams.get("celebrate");
    if (kind === "rank") {
      const oldRank = Number(searchParams.get("old") ?? 0);
      const newRank = Number(searchParams.get("new") ?? 0);
      if (oldRank > 0 && newRank > 0) {
        setCelebration({ type: "rank", oldRank, newRank });
      }
    } else if (kind === "battle") {
      const rival = searchParams.get("rival");
      if (rival) setCelebration({ type: "battle", rivalName: rival });
    }
  }, [showWelcome, searchParams, t]);

  const viewerName = props.viewer.displayName ?? props.viewer.name ?? props.viewer.email;
  const chatBadge = props.chatRooms.reduce((s, r) => s + r.unread, 0) + unreadChat;
  const sectionTitle = tNav(SECTION_LABEL_KEYS[section]);

  function navigate(next: CreatorHubSection) {
    if (consentOpen) return;
    if (next === section) return;
    if (next === "chat") setUnreadChat(0);
    setMoreOpen(false);
    startNavTransition(() => {
      setSection(next);
      setVisited((prev) => {
        if (prev.has(next)) return prev;
        const nextSet = new Set(prev);
        nextSet.add(next);
        return nextSet;
      });
    });
  }

  function handleBack() {
    if (section !== "dashboard") {
      navigate("dashboard");
      return;
    }
    router.push("/growth");
  }

  function badgeFor(id: CreatorHubSection): number | undefined {
    if (id === "chat" && chatBadge > 0) return chatBadge;
    if (id === "profile" && props.platformReviewPending) return 1;
    if (id === "leaderboard" && props.viewerRank) return props.viewerRank;
    if (id === "battles" && props.activeBattles > 0) return props.activeBattles;
    return undefined;
  }

  function moreItemIcon(id: CreatorHubSection) {
    const map: Record<string, ComponentType<{ size?: number; className?: string }>> = {
      planning: IconCalendar,
      leaderboard: IconRank,
      battles: IconBattle,
      analytics: IconTrending,
      network: IconNetwork,
    };
    return map[id] ?? IconDashboard;
  }

  return (
    <CreatorLoungeErrorBoundary>
      <div className="creator-hub-mobile-root">
        <div className={`creator-hub-shell creator-hub-mobile-app creator-arena-shell relative min-h-[70dvh] overflow-hidden rounded-2xl sm:rounded-3xl ${consentOpen ? "pointer-events-none select-none blur-[2px]" : ""}`}>
          <div className="relative z-10 flex min-h-[70dvh] flex-col lg:min-h-[70dvh] lg:flex-row">
            <aside className="creator-hub-sidebar hidden w-60 shrink-0 flex-col border-e lg:flex">
              <div className="border-b border-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--creator-secondary)]">T.E.N.E.G.T.A</p>
                <p className="mt-1 font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">{t("title")}</p>
              </div>
              <div className="border-b border-white/10 p-3">
                <CreatorHubProfileCard
                  name={viewerName}
                  email={props.viewer.email}
                  avatarUrl={props.viewer.avatarUrl ?? null}
                  avatarPreset={props.viewer.avatarPreset}
                  levelCode={props.viewer.levelCode}
                  locale={props.locale}
                  status={props.viewer.status}
                  hasBadge={props.hasBadge}
                  consentGiven={consentGiven}
                  viewerRank={props.viewerRank}
                  compact
                />
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
                          className={`mb-0.5 flex w-full min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-start text-xs font-semibold transition active:scale-[0.98] ${active ? "creator-nav-active" : "text-white/60 hover:bg-white/[0.04] hover:text-white"} ${isNavPending && !active ? "opacity-70" : ""}`}
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
              <div className="space-y-1 border-t border-white/10 p-3">
                <CreatorHubSettingsLink className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-xs font-semibold text-white/65 hover:bg-white/[0.04]">
                  <IconSettings size={16} />
                  {tNav("settings")}
                </CreatorHubSettingsLink>
                <Link href="/for-creators" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-[var(--creator-secondary)] hover:bg-white/[0.04]">
                  <IconShare size={16} />
                  {t("publicPage")}
                </Link>
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="creator-hub-app-header flex min-h-14 items-center gap-2 px-3 py-2 sm:px-4 lg:hidden">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 active:bg-white/[0.08]"
                  aria-label={tNav("back")}
                >
                  <IconBack size={20} className="rtl:rotate-180" />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">{sectionTitle}</p>
                  <p className="truncate text-[10px] text-[var(--creator-secondary)]">{t("title")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 active:bg-white/[0.08]"
                  aria-label={tNav("more")}
                >
                  <IconMenu size={20} />
                </button>
              </header>

              <header className="hidden border-b border-white/10 px-4 py-4 sm:px-6 lg:block">
                <h1 className="font-[family-name:var(--font-cairo)] text-xl font-black text-white sm:text-2xl">{t("subtitle")}</h1>
                {showWelcome ? <p className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{t("welcome")}</p> : null}
                {!props.hasBadge && props.isRoomMember ? (
                  <p className="mt-2 hidden rounded-xl border border-sky-500/25 bg-sky-500/8 px-3 py-2 text-[11px] text-sky-100 lg:block">
                    {t("hubActivated")}
                  </p>
                ) : null}
              </header>

              {(showWelcome || (!props.hasBadge && props.isRoomMember)) ? (
                <div className="space-y-2 px-3 pt-2 lg:hidden">
                  {showWelcome ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">{t("welcome")}</p> : null}
                  {!props.hasBadge && props.isRoomMember && !showWelcome ? (
                    <p className="rounded-xl border border-sky-500/25 bg-sky-500/8 px-3 py-2 text-[11px] text-sky-100">{t("hubActivated")}</p>
                  ) : null}
                </div>
              ) : null}

              <main className="creator-hub-main-scroll relative flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">
                {isNavPending ? <div className="creator-hub-section-progress" aria-hidden /> : null}
                <CreatorHubSectionHost
                  section={section}
                  visited={visited}
                  props={props}
                  viewerName={viewerName}
                  consentGiven={consentGiven}
                  onNavigate={navigate}
                  onChallengeCreator={setChallengeDrawer}
                  onUnread={(n) => setUnreadChat((c) => c + n)}
                />
              </main>
            </div>

            {rightOpen ? (
              <aside className="hidden w-72 shrink-0 border-s border-white/10 p-4 xl:block">
                <CreatorLivePanel pulse={props.pulse} statusCards={props.statusCards} metrics={props.metrics} className="sticky top-4" />
              </aside>
            ) : null}
          </div>

          <nav
            className="creator-arena-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[var(--creator-surface)]/98 backdrop-blur-xl lg:hidden"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4px)" }}
            aria-label={tNav("mobileNav")}
          >
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
                const active =
                  section === id ||
                  (id === "challenge" && (section === "leaderboard" || section === "battles")) ||
                  (id === "profile" && (section === "planning" || section === "analytics" || section === "network"));
                const badge = id === "chat" ? chatBadge : id === "challenge" && props.activeBattles > 0 ? props.activeBattles : undefined;
                const labelKey = id === "dashboard" ? "overview" : id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(id)}
                    className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-bold transition active:scale-95 ${active ? "text-[var(--creator-primary)]" : "text-white/55"} ${isNavPending && !active ? "opacity-60" : ""}`}
                  >
                    <span className={`flex size-8 items-center justify-center rounded-xl ${active ? "bg-[var(--creator-primary)]/15" : ""}`}>
                      <Icon size={18} />
                    </span>
                    <span className="max-w-full truncate">{tNav(labelKey)}</span>
                    {badge ? (
                      <span className="absolute end-2 top-1 rounded-full bg-[var(--creator-primary)] px-1.5 text-[8px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={tNav("more")}>
          <button type="button" className="creator-mobile-sheet-backdrop absolute inset-0" onClick={() => setMoreOpen(false)} aria-label={tNav("close")} />
          <div className="creator-mobile-sheet absolute inset-x-0 bottom-0 z-10 px-4 pt-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-[var(--creator-secondary)]">{tNav("more")}</p>
            <ul className="space-y-1">
              {MOBILE_MORE_SECTIONS.map((id) => {
                const Icon = moreItemIcon(id);
                const badge = badgeFor(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => navigate(id)}
                      className="flex w-full min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/85 active:bg-white/[0.06]"
                    >
                      <Icon size={18} className="text-[var(--creator-secondary)]" />
                      <span className="flex-1 text-start">{tNav(SECTION_LABEL_KEYS[id])}</span>
                      {badge ? <span className="rounded-full bg-[var(--creator-primary)]/25 px-2 text-[10px] text-rose-200">{badge}</span> : null}
                    </button>
                  </li>
                );
              })}
              <li>
                <CreatorHubSettingsLink
                  onBeforeNavigate={() => setMoreOpen(false)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-semibold text-white/85 active:bg-white/[0.06]"
                >
                  <IconSettings size={18} className="text-[var(--creator-secondary)]" />
                  {tNav("settings")}
                </CreatorHubSettingsLink>
              </li>
              <li>
                <Link href="/for-creators" onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--creator-secondary)] active:bg-white/[0.06]">
                  <IconShare size={18} />
                  {t("publicPage")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      <CreatorProfileDrawer creator={challengeDrawer} onClose={() => setChallengeDrawer(null)} onChallenge={() => { setChallengeDrawer(null); navigate("battles"); }} />
      <CreatorCelebrationOverlay payload={celebration} onDismiss={dismissCelebration} />
      <CreatorConsentModal
        locale={consentLocale}
        creatorName={viewerName}
        isOpen={consentOpen}
        mode="creator-join"
        versionMismatch={props.consentVersionMismatch}
        onAccept={async ({ qualificationStatement, attestations }) => {
          const res = await recordCreatorConsentAction(
            qualificationStatement,
            consentLocale,
            attestations,
          );
          if (res.ok) {
            setConsentOpen(false);
            setConsentGiven(true);
            showToast({
              type: "success",
              title: tConsent("confirmationTitle"),
              body: tConsent("confirmationBody"),
            });
          } else {
            showToast({ type: "error", title: tConsent("error") });
          }
        }}
      />
    </CreatorLoungeErrorBoundary>
  );
}
