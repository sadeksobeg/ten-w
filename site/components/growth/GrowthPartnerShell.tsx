"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  children: ReactNode;
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

export function GrowthPartnerShell({ children }: Props) {
  const t = useTranslations("Growth.nav");
  const pathname = usePathname();

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
            className={linkClass(isActive(pathname, item.href, "exact" in item ? item.exact : false))}
          >
            {t(item.key)}
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
            className={`${linkClass(isActive(pathname, item.href, "exact" in item ? item.exact : false))} min-w-0 flex-1 px-1 text-center text-[10px]`}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
