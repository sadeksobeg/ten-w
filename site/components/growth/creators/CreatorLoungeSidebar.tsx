"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  IconBattle,
  IconChat,
  IconDashboard,
  IconEvents,
  IconKit,
  IconSettings,
  IconStarFilled,
  IconTrophy,
  type GrowthIconProps,
} from "@/components/growth/icons/GrowthIcons";
import type { CreatorLoungeSection } from "./CreatorLoungeLayout";

type NavItem = {
  id: CreatorLoungeSection;
  labelKey: string;
  icon: ComponentType<GrowthIconProps>;
  badge?: number;
  mobilePrimary?: boolean;
};

type Props = {
  active: CreatorLoungeSection;
  onNavigate: (section: CreatorLoungeSection) => void;
  viewerRank?: number | null;
  activeBattles?: number;
  unreadChat?: number;
  className?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { id: "home", labelKey: "nav.home", icon: IconDashboard, mobilePrimary: true },
  { id: "chat", labelKey: "nav.chat", icon: IconChat, mobilePrimary: true },
  { id: "challenge", labelKey: "nav.challenge", icon: IconEvents, mobilePrimary: true },
  { id: "cup", labelKey: "nav.cup", icon: IconTrophy, mobilePrimary: true },
];

export const SECONDARY_NAV: NavItem[] = [
  { id: "battles", labelKey: "nav.battles", icon: IconBattle },
  { id: "toolkit", labelKey: "nav.toolkit", icon: IconKit },
  { id: "profile", labelKey: "nav.profile", icon: IconStarFilled },
];

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

function navBadge(
  item: NavItem,
  viewerRank: number | null | undefined,
  activeBattles: number,
  unreadChat: number,
): number | undefined {
  if (item.id === "chat" && unreadChat > 0) return unreadChat;
  if (item.id === "cup" && viewerRank && viewerRank > 0) return viewerRank;
  if (item.id === "battles" && activeBattles > 0) return activeBattles;
  return item.badge;
}

export function CreatorLoungeSidebar({
  active,
  onNavigate,
  viewerRank,
  activeBattles = 0,
  unreadChat = 0,
  className = "",
}: Props) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <nav className={`flex flex-col gap-1 ${className}`} aria-label={t("navAria")}>
      {ALL_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        const badge = navBadge(item, viewerRank, activeBattles, unreadChat);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition ${
              isActive
                ? "border border-gold/35 bg-gold/15 text-gold shadow-[0_0_16px_rgba(228,184,77,0.15)]"
                : "border border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={18} className={isActive ? "text-gold" : "text-white/50"} />
            <span className="flex-1">{t(item.labelKey)}</span>
            {badge !== undefined ? (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function CreatorLoungeMobileTabs({
  active,
  onNavigate,
  viewerRank,
  activeBattles = 0,
  unreadChat = 0,
}: Omit<Props, "className">) {
  const t = useTranslations("Growth.creators.lounge");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = SECONDARY_NAV.some((item) => item.id === active);

  return (
    <>
      <nav
        className="creator-arena-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080a10]/95 backdrop-blur-xl lg:hidden"
        aria-label={t("mobileNavAria")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {PRIMARY_NAV.map((item) => {
            const isActive = active === item.id;
            const badge = navBadge(item, viewerRank, activeBattles, unreadChat);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onNavigate(item.id);
                }}
                className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold transition ${
                  isActive ? "text-gold" : "text-white/55"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className={isActive ? "text-gold" : "text-white/45"} />
                <span className="truncate">{t(item.labelKey)}</span>
                {badge !== undefined ? (
                  <span className="absolute end-2 top-1 rounded-full bg-gold px-1.5 py-0.5 text-[8px] font-black text-black">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold transition ${
              moreActive || moreOpen ? "text-gold" : "text-white/55"
            }`}
            aria-expanded={moreOpen}
          >
            <IconSettings size={18} className={moreActive || moreOpen ? "text-gold" : "text-white/45"} />
            <span>{t("nav.more")}</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      ) : null}

      {moreOpen ? (
        <div
          className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-white/10 bg-[#0c0e14] p-2 shadow-2xl lg:hidden"
          role="menu"
        >
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const badge = navBadge(item, viewerRank, activeBattles, unreadChat);
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setMoreOpen(false);
                  onNavigate(item.id);
                }}
                className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive ? "bg-gold/15 text-gold" : "text-white/75 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-start">{t(item.labelKey)}</span>
                {badge !== undefined ? (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
