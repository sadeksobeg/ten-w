"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import {
  IconBadge,
  IconChat,
  IconDashboard,
  IconDeals,
  IconEarnings,
  IconEvent,
  IconInfo,
  IconLevel,
  IconMission,
  IconNotifications,
  IconPayout,
  IconPartners,
  IconTrophy,
  IconLegends,
  IconStar,
  IconSettings,
  type GrowthIconProps,
} from "@/components/growth/icons/GrowthIcons";

type NavItem = {
  href: string;
  labelKey: string;
  Icon: ComponentType<GrowthIconProps>;
  /** Outside /[locale] — use plain <a> (e.g. /admin invites panel) */
  external?: boolean;
};

const groups: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "groupOperations",
    items: [
      { href: "/growth/admin", labelKey: "overview", Icon: IconDashboard },
      { href: "/growth/admin/deals", labelKey: "deals", Icon: IconDeals },
      { href: "/growth/admin/payouts", labelKey: "payouts", Icon: IconPayout },
      { href: "/growth/admin/partners", labelKey: "partners", Icon: IconPartners },
      { href: "/admin", labelKey: "invites", Icon: IconStar, external: true },
      { href: "/growth/admin/chat", labelKey: "chat", Icon: IconChat },
      { href: "/growth/admin/chat/moderators", labelKey: "chatModerators", Icon: IconChat },
    ],
  },
  {
    titleKey: "groupCatalog",
    items: [
      { href: "/growth/admin/products", labelKey: "products", Icon: IconSettings },
      { href: "/growth/admin/badges", labelKey: "badges", Icon: IconBadge },
      { href: "/growth/admin/levels", labelKey: "levels", Icon: IconLevel },
      { href: "/growth/admin/tiers", labelKey: "tiers", Icon: IconEarnings },
      { href: "/growth/admin/leaderboard", labelKey: "leaderboard", Icon: IconTrophy },
      { href: "/growth/admin/seasons", labelKey: "seasons", Icon: IconEvent },
      { href: "/growth/admin/rewards", labelKey: "rewards", Icon: IconEarnings },
      { href: "/growth/admin/missions", labelKey: "missions", Icon: IconMission },
      { href: "/growth/admin/vault", labelKey: "vault", Icon: IconLegends },
      { href: "/growth/admin/audit", labelKey: "audit", Icon: IconInfo },
      { href: "/growth/admin/overrides", labelKey: "overrides", Icon: IconDeals },
      { href: "/growth/admin/bonuses", labelKey: "bonuses", Icon: IconEarnings },
    ],
  },
  {
    titleKey: "groupPrograms",
    items: [
      { href: "/growth/admin/creators", labelKey: "creators", Icon: IconStar },
      { href: "/growth/admin/legends", labelKey: "legends", Icon: IconLegends },
      { href: "/growth/admin/events", labelKey: "events", Icon: IconEvent },
      { href: "/growth/admin/event-contacts", labelKey: "eventContacts", Icon: IconPartners },
      { href: "/growth/admin/notifications", labelKey: "notifications", Icon: IconNotifications },
      { href: "/growth/admin/insights", labelKey: "insights", Icon: IconInfo },
      { href: "/growth/admin/demo", labelKey: "demo", Icon: IconDashboard },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/growth/admin") return pathname === "/growth/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GrowthAdminNav() {
  const t = useTranslations("Growth.admin.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const linkClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
      active
        ? "bg-gold/15 text-gold ring-1 ring-gold/35 before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full before:bg-gold relative"
        : "text-white/65 hover:bg-white/[0.06] hover:text-white"
    }`;

  const flat = groups.flatMap((g) => g.items);

  return (
    <>
      <label className="mb-3 block lg:hidden">
        <span className="sr-only">{t("jumpTo")}</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
          value={flat.find((i) => isActive(pathname, i.href))?.href ?? "/growth/admin"}
          onChange={(e) => router.push(e.target.value)}
        >
          {groups.map((g) => (
            <optgroup key={g.titleKey} label={t(g.titleKey as "groupOperations")}>
              {g.items.map((item) => (
                <option key={item.href} value={item.href}>
                  {t(item.labelKey as "overview")}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <nav className="hidden space-y-4 lg:block" aria-label={t("navAria")}>
        {groups.map((g) => {
          const isCollapsed = collapsed[g.titleKey];
          return (
            <div key={g.titleKey}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [g.titleKey]: !c[g.titleKey] }))
                }
                className="mb-1 flex w-full items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60"
              >
                {t(g.titleKey as "groupOperations")}
                <span className="text-white/30" aria-hidden>
                  {isCollapsed ? "▸" : "▾"}
                </span>
              </button>
              {!isCollapsed ? (
                <ul className="space-y-0.5">
                  {g.items.map((item) => {
                    const active = !item.external && isActive(pathname, item.href);
                    const Icon = item.Icon;
                    const label = t(item.labelKey as "overview");
                    return (
                      <li key={item.href}>
                        {item.external ? (
                          <a href={item.href} className={linkClass(false)}>
                            <Icon size={18} className="shrink-0 opacity-90" aria-hidden />
                            {label}
                          </a>
                        ) : (
                          <Link href={item.href} className={linkClass(active)}>
                            <Icon size={18} className="shrink-0 opacity-90" aria-hidden />
                            {label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
        <Link
          href="/growth"
          className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 hover:border-gold/30 hover:text-gold"
        >
          <IconDashboard size={16} aria-hidden />
          {t("partnerDashboard")}
        </Link>
      </nav>
    </>
  );
}
