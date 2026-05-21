"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  children: ReactNode;
  locale: string;
};

const NAV = [
  { href: "/growth", key: "dashboard" as const, exact: true },
  { href: "/growth/deals", key: "deals" as const },
  { href: "/growth/earnings", key: "earnings" as const },
  { href: "/growth/network", key: "network" as const },
  { href: "/growth/events", key: "events" as const },
  { href: "/growth/chat", key: "chat" as const },
  { href: "/growth/notifications", key: "notifications" as const },
  { href: "/growth/settings", key: "settings" as const },
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

  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
      active
        ? "bg-gold/20 text-gold ring-1 ring-gold/40"
        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
    }`;

  const mobileNav = NAV.filter((n) =>
    ["dashboard", "deals", "events", "chat", "notifications"].includes(n.key),
  );

  return (
    <>
      <nav
        className="mb-4 hidden gap-2 overflow-x-auto border-b border-white/10 pb-3 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t("navAria")}
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative ${linkClass(isActive(pathname, item.href, "exact" in item ? item.exact : false))}`}
          >
            {t(item.key)}
            {item.key === "chat" && chatUnread > 0 ? (
              <span className="absolute -top-1 end-0 flex min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                {chatUnread > 99 ? "99+" : chatUnread}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      {children}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0A0A0F]/95 px-1 py-2 backdrop-blur-md lg:hidden"
        aria-label={t("mobileNavAria")}
      >
        {mobileNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative ${linkClass(isActive(pathname, item.href, "exact" in item ? item.exact : false))} min-w-0 flex-1 px-1 text-center text-[10px]`}
          >
            {t(item.key)}
            {item.key === "chat" && chatUnread > 0 ? (
              <span className="absolute end-1/4 top-0 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                {chatUnread > 9 ? "9+" : chatUnread}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
