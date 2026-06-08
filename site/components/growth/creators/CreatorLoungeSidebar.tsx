"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  IconBattle,
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
};

type Props = {
  active: CreatorLoungeSection;
  onNavigate: (section: CreatorLoungeSection) => void;
  viewerRank?: number | null;
  activeBattles?: number;
  className?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", labelKey: "nav.home", icon: IconDashboard },
  { id: "challenge", labelKey: "nav.challenge", icon: IconEvents },
  { id: "cup", labelKey: "nav.cup", icon: IconTrophy },
  { id: "battles", labelKey: "nav.battles", icon: IconBattle },
  { id: "studio", labelKey: "nav.studio", icon: IconKit },
  { id: "achievements", labelKey: "nav.achievements", icon: IconStarFilled },
  { id: "settings", labelKey: "nav.settings", icon: IconSettings },
];

export function CreatorLoungeSidebar({
  active,
  onNavigate,
  viewerRank,
  activeBattles = 0,
  className = "",
}: Props) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <nav
      className={`flex flex-col gap-1 ${className}`}
      aria-label={t("navAria")}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        const badge =
          item.id === "cup" && viewerRank && viewerRank > 0
            ? viewerRank
            : item.id === "battles" && activeBattles > 0
              ? activeBattles
              : undefined;

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
                {badge}
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
}: Omit<Props, "className">) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <nav
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      aria-label={t("mobileNavAria")}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const badge =
          item.id === "cup" && viewerRank && viewerRank > 0
            ? viewerRank
            : item.id === "battles" && activeBattles > 0
              ? activeBattles
              : undefined;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              isActive
                ? "bg-gold text-black shadow-[0_0_16px_rgba(228,184,77,0.3)]"
                : "border border-white/15 text-white/70"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {t(item.labelKey)}
            {badge !== undefined ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? "bg-black/20 text-black" : "bg-gold/20 text-gold"}`}
              >
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
