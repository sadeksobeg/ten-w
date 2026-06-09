"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GROWTH_DESKTOP_NAV_ICONS } from "@/components/growth/icons/GrowthIcons";
import { GrowthPartnerNavLink } from "@/components/growth/GrowthPartnerNavLink";

const WORKSPACE_KEYS = ["dashboard", "creators", "deals", "chat", "settings"] as const;

const WORKSPACE_HREFS: Record<(typeof WORKSPACE_KEYS)[number], string> = {
  dashboard: "/growth",
  creators: "/growth/creators",
  deals: "/growth/deals",
  chat: "/growth/chat",
  settings: "/growth/settings",
};

const WORKSPACE_EXACT: Partial<Record<(typeof WORKSPACE_KEYS)[number], boolean>> = {
  dashboard: true,
};

type Props = {
  chatUnread?: number;
  className?: string;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname.endsWith(href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GrowthWorkspaceNav({ chatUnread = 0, className = "" }: Props) {
  const t = useTranslations("Growth.nav");
  const tShort = useTranslations("Growth.navShort");
  const tWorkspace = useTranslations("Growth.workspace");
  const pathname = usePathname();
  const isCreatorHub =
    pathname === "/growth/creators" || pathname.endsWith("/growth/creators");

  return (
    <nav
      className={`growth-workspace-nav sticky top-0 z-30 -mx-1 mb-3 rounded-2xl border border-white/10 bg-[#0a0a12]/92 px-1 py-1 backdrop-blur-xl sm:-mx-0 ${className}`}
      aria-label={tWorkspace("navAria")}
    >
      <p className="hidden px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-white/35 lg:block">
        {tWorkspace("label")}
      </p>
      <div className="flex items-stretch gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WORKSPACE_KEYS.map((key) => {
          const href = WORKSPACE_HREFS[key];
          const exact = WORKSPACE_EXACT[key];
          const active = isActive(pathname, href, exact);
          const DesktopIcon = GROWTH_DESKTOP_NAV_ICONS[key];
          const label = key === "dashboard" ? tWorkspace("ascend") : tShort(key);
          const fullLabel = key === "dashboard" ? tWorkspace("ascend") : t(key);

          const Icon = DesktopIcon;
          return (
            <GrowthPartnerNavLink
              key={key}
              href={href}
              exact={exact}
              prefetch={key === "creators" || key === "dashboard"}
              className={`growth-workspace-nav__item relative flex min-h-10 min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-center transition sm:min-h-11 sm:flex-row sm:gap-1.5 sm:px-3 lg:min-w-0 lg:flex-none ${
                active
                  ? isCreatorHub && key === "creators"
                    ? "bg-[var(--creator-primary)]/15 text-[var(--creator-primary)] ring-1 ring-[var(--creator-primary)]/35"
                    : "bg-gold/15 text-gold ring-1 ring-gold/30"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white"
              }`}
              Icon={Icon}
              iconSize={16}
              badge={
                key === "chat" && chatUnread > 0 ? (
                  <span className="absolute end-1 top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white sm:static sm:ms-0.5">
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                ) : undefined
              }
            >
              <span className="text-[10px] font-bold sm:text-xs sm:font-semibold">
                <span className="sm:hidden">{label}</span>
                <span className="hidden sm:inline">{fullLabel}</span>
              </span>
            </GrowthPartnerNavLink>
          );
        })}
      </div>
    </nav>
  );
}
