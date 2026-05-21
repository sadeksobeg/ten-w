"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
  children: ReactNode;
};

const NAV = [
  { href: "/growth", key: "dashboard" as const },
  { href: "/growth/events", key: "events" as const },
  { href: "/growth/chat", key: "chat" as const },
  { href: "/growth/settings", key: "settings" as const },
];

export function GrowthPartnerShell({ locale, children }: Props) {
  const t = useTranslations("Growth.nav");
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
      active
        ? "bg-gold/20 text-gold ring-1 ring-gold/40"
        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <>
      <nav
        className="mb-6 hidden gap-2 overflow-x-auto border-b border-white/10 pb-3 lg:flex [scrollbar-width:none]"
        aria-label={locale === "ar" ? "قائمة الشريك" : "Partner navigation"}
      >
        {NAV.map((item) => {
          const active =
            item.href === "/growth"
              ? pathname === "/growth"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={linkClass(active)}>
              {item.key === "settings"
                ? locale === "ar"
                  ? "الإعدادات"
                  : locale === "fr"
                    ? "Réglages"
                    : "Settings"
                : t(item.key)}
            </Link>
          );
        })}
      </nav>
      {children}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0A0A0F]/95 px-2 py-2 backdrop-blur-md lg:hidden"
        aria-label={locale === "ar" ? "تنقل سفلي" : "Mobile nav"}
      >
        {NAV.slice(0, 3).map((item) => {
          const active =
            item.href === "/growth"
              ? pathname === "/growth"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`${linkClass(active)} flex-1 text-center`}>
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
