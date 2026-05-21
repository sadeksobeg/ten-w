"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type NavItem = { href: string; labelKey: string };

const groups: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "groupOperations",
    items: [
      { href: "/growth/admin", labelKey: "overview" },
      { href: "/growth/admin/deals", labelKey: "deals" },
      { href: "/growth/admin/payouts", labelKey: "payouts" },
      { href: "/growth/admin/partners", labelKey: "partners" },
      { href: "/growth/admin/chat", labelKey: "chat" },
    ],
  },
  {
    titleKey: "groupCatalog",
    items: [
      { href: "/growth/admin/products", labelKey: "products" },
      { href: "/growth/admin/badges", labelKey: "badges" },
      { href: "/growth/admin/levels", labelKey: "levels" },
      { href: "/growth/admin/tiers", labelKey: "tiers" },
      { href: "/growth/admin/leaderboard", labelKey: "leaderboard" },
      { href: "/growth/admin/seasons", labelKey: "seasons" },
      { href: "/growth/admin/rewards", labelKey: "rewards" },
      { href: "/growth/admin/missions", labelKey: "missions" },
      { href: "/growth/admin/audit", labelKey: "audit" },
      { href: "/growth/admin/overrides", labelKey: "overrides" },
      { href: "/growth/admin/bonuses", labelKey: "bonuses" },
    ],
  },
  {
    titleKey: "groupPrograms",
    items: [
      { href: "/growth/admin/events", labelKey: "events" },
      { href: "/growth/admin/notifications", labelKey: "notifications" },
      { href: "/growth/admin/insights", labelKey: "insights" },
      { href: "/growth/admin/demo", labelKey: "demo" },
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

  const linkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-gold/15 text-gold ring-1 ring-gold/35"
        : "text-white/65 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <>
      <label className="mb-3 block lg:hidden">
        <span className="sr-only">{t("jumpTo")}</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
          value={groups.flatMap((g) => g.items).find((i) => isActive(pathname, i.href))?.href ?? "/growth/admin"}
          onChange={(e) => {
            router.push(e.target.value);
          }}
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

      <nav className="hidden space-y-5 lg:block" aria-label={t("adminNavAria")}>
        {groups.map((g) => (
          <div key={g.titleKey}>
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              {t(g.titleKey as "groupOperations")}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass(active)}>
                      {t(item.labelKey as "overview")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="border-t border-white/10 pt-4">
          <Link
            href="/growth"
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/50 hover:text-gold"
          >
            {t("partnerDashboard")}
          </Link>
        </div>
      </nav>
    </>
  );
}
