"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  GROWTH_DESKTOP_NAV_ICONS,
  GROWTH_MOBILE_NAV_ICONS,
} from "@/components/growth/icons/GrowthIcons";

type Props = {
  children: ReactNode;
  locale: string;
  showCreatorsProgram?: boolean;
};

const BASE_NAV = [
  { href: "/growth", key: "dashboard" as const, exact: true },
  { href: "/growth/deals", key: "deals" as const },
  { href: "/growth/events", key: "events" as const },
  { href: "/growth/earnings", key: "earnings" as const },
  { href: "/growth/network", key: "network" as const },
  { href: "/growth/leaderboard", key: "leaderboard" as const },
  { href: "/growth/map", key: "map" as const },
  { href: "/growth/chronicle", key: "chronicle" as const },
  { href: "/growth/constellation", key: "constellation" as const },
  { href: "/growth/vault", key: "vault" as const },
  { href: "/growth/battles", key: "battles" as const },
  { href: "/growth/mentors", key: "mentors" as const },
  { href: "/growth/legends", key: "legends" as const },
  { href: "/growth/chat", key: "chat" as const },
  { href: "/growth/notifications", key: "notifications" as const },
  { href: "/growth/settings", key: "settings" as const },
] as const;

const CREATORS_NAV = { href: "/growth/creators", key: "creators" as const };

const MOBILE_KEYS_BASE = [
  "dashboard",
  "deals",
  "events",
  "map",
  "chat",
  "settings",
] as const;

const MOBILE_KEYS_WITH_CREATORS = [
  "dashboard",
  "creators",
  "deals",
  "chat",
  "settings",
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname.endsWith(href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GrowthPartnerShell({ children, locale: _locale, showCreatorsProgram = false }: Props) {
  const t = useTranslations("Growth.nav");
  const tShort = useTranslations("Growth.navShort");
  const tDesc = useTranslations("Growth.navDesc");
  const pathname = usePathname();
  const [chatUnread, setChatUnread] = useState(0);

  const navItems = showCreatorsProgram
    ? [
        ...BASE_NAV.slice(0, 3),
        CREATORS_NAV,
        ...BASE_NAV.slice(3),
      ]
    : [...BASE_NAV];

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/chat/partner-summary");
      if (!res.ok) return;
      const data = (await res.json()) as { unreadCount?: number };
      setChatUnread(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const id = window.setInterval(() => void refreshUnread(), 20000);
    const onRead = () => void refreshUnread();
    window.addEventListener("growth-chat-read", onRead);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("growth-chat-read", onRead);
    };
  }, [refreshUnread]);

  const desktopLinkClass = (active: boolean) =>
    `relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
      active
        ? "bg-gold/15 text-gold before:absolute before:inset-y-1 before:start-0 before:w-[3px] before:rounded-full before:bg-gold"
        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
    }`;

  const mobileKeys = showCreatorsProgram ? MOBILE_KEYS_WITH_CREATORS : MOBILE_KEYS_BASE;
  const mobileNav = navItems.filter((n) => (mobileKeys as readonly string[]).includes(n.key));

  return (
    <>
      <nav
        className="growth-partner-nav-desktop growth-nav-scroll mb-4 flex-nowrap border-b border-white/10 pb-3"
        aria-label={t("navAria")}
      >
        {navItems.map((item) => {
          const Icon = GROWTH_DESKTOP_NAV_ICONS[item.key];
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
          return (
            <Link key={item.href} href={item.href} className={`${desktopLinkClass(active)} shrink-0`}>
              {Icon ? <Icon size={18} className="shrink-0" /> : null}
              {t(item.key)}
              {item.key === "chat" && chatUnread > 0 ? (
                <span className="ms-1 flex min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                  {chatUnread > 99 ? "99+" : chatUnread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="growth-page-wrap growth-mobile-pad growth-stack">{children}</div>
      <nav className="growth-partner-nav-mobile" aria-label={t("mobileNavAria")}>
        {mobileNav.map((item) => {
          const Icon = GROWTH_MOBILE_NAV_ICONS[item.key as keyof typeof GROWTH_MOBILE_NAV_ICONS];
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[var(--growth-touch-min)] min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-center text-[9px] font-semibold leading-tight focus-visible:ring-2 focus-visible:ring-gold/40 sm:text-[10px] ${
                active ? "text-gold" : "text-white/55"
              }`}
            >
              {active ? (
                <span className="absolute top-0.5 size-1.5 rounded-full bg-gold motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden />
              ) : null}
              <Icon size={20} className="shrink-0" />
              <span className="max-w-full truncate">{tShort(item.key)}</span>
              <span className="sr-only">{tDesc(item.key)}</span>
              {item.key === "chat" && chatUnread > 0 ? (
                <span className="absolute end-1/4 top-0 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div
        className="md:hidden"
        style={{ height: "calc(var(--growth-mobile-nav-h) + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden
      />
    </>
  );
}
