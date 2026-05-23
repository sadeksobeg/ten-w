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
};

const NAV = [
  { href: "/growth", key: "dashboard" as const, exact: true },
  { href: "/growth/deals", key: "deals" as const },
  { href: "/growth/earnings", key: "earnings" as const },
  { href: "/growth/network", key: "network" as const },
  { href: "/growth/leaderboard", key: "leaderboard" as const },
  { href: "/growth/events", key: "events" as const },
  { href: "/growth/chat", key: "chat" as const },
  { href: "/growth/notifications", key: "notifications" as const },
  { href: "/growth/settings", key: "settings" as const },
] as const;

const MOBILE_KEYS = [
  "dashboard",
  "deals",
  "earnings",
  "leaderboard",
  "chat",
  "settings",
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname.endsWith(href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GrowthPartnerShell({ children, locale: _locale }: Props) {
  const t = useTranslations("Growth.nav");
  const pathname = usePathname();
  const [chatUnread, setChatUnread] = useState(0);

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

  const mobileNav = NAV.filter((n) =>
    (MOBILE_KEYS as readonly string[]).includes(n.key),
  );

  return (
    <>
      <nav
        className="mb-4 hidden gap-2 overflow-x-auto border-b border-white/10 pb-3 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t("navAria")}
      >
        {NAV.map((item) => {
          const Icon = GROWTH_DESKTOP_NAV_ICONS[item.key];
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
          return (
            <Link key={item.href} href={item.href} className={desktopLinkClass(active)}>
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
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-white/10 bg-[#0A0A0F]/90 px-1 py-2 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
        aria-label={t("mobileNavAria")}
      >
        {mobileNav.map((item) => {
          const Icon = GROWTH_MOBILE_NAV_ICONS[item.key as keyof typeof GROWTH_MOBILE_NAV_ICONS];
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-center text-[10px] font-semibold focus-visible:ring-2 focus-visible:ring-gold/40 ${
                active ? "text-gold" : "text-white/55"
              }`}
            >
              {active ? (
                <span className="absolute -top-0.5 size-1.5 rounded-full bg-gold motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden />
              ) : null}
              <Icon size={22} />
              <span className="truncate">{t(item.key)}</span>
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
        className="lg:hidden"
        style={{ height: "calc(var(--growth-mobile-nav-h) + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden
      />
    </>
  );
}
