import type { ReactNode } from "react";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { growthSignOutAction } from "@/lib/growth/actions";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function GrowthAdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/growth`);
  }

  const t = await getTranslations("Growth");

  const linkClass =
    "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 hover:border-gold/30 hover:text-white sm:px-4 sm:text-xs";

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="sticky top-14 z-[60] -mx-4 mb-2 flex flex-col gap-3 border-b border-white/10 bg-[#050816]/95 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link className={linkClass} href="/growth/admin">
            {t("admin.nav.overview")}
          </Link>
          <Link className={linkClass} href="/growth/admin/deals">
            {t("admin.nav.deals")}
          </Link>
          <Link className={linkClass} href="/growth/admin/payouts">
            {t("admin.nav.payouts")}
          </Link>
          <Link className={linkClass} href="/growth/admin/products">
            {t("admin.nav.products")}
          </Link>
          <Link className={linkClass} href="/growth/admin/badges">
            {t("admin.nav.badges")}
          </Link>
          <Link className={linkClass} href="/growth/admin/levels">
            {t("admin.nav.levels")}
          </Link>
          <Link className={linkClass} href="/growth/admin/tiers">
            {t("admin.nav.tiers")}
          </Link>
          <Link className={linkClass} href="/growth/admin/rewards">
            {t("admin.nav.rewards")}
          </Link>
          <Link className={linkClass} href="/growth/admin/chat">
            {t("admin.nav.chat")}
          </Link>
          <Link className={linkClass} href="/growth/admin/demo">
            {t("admin.nav.demo")}
          </Link>
          <Link className={linkClass} href="/growth/admin/insights">
            {t("admin.nav.insights")}
          </Link>
          <Link className={linkClass} href="/growth/admin/partners">
            {t("admin.nav.partners")}
          </Link>
          <Link className={linkClass} href="/growth/admin/events">
            {t("admin.nav.events")}
          </Link>
          <Link className={linkClass} href="/growth/admin/notifications">
            {t("admin.nav.notifications")}
          </Link>
          <Link className={linkClass} href="/growth/admin/overrides">
            {t("admin.nav.overrides")}
          </Link>
          <Link className={linkClass} href="/growth/admin/bonuses">
            {t("admin.nav.bonuses")}
          </Link>
          <Link className={linkClass} href="/growth">
            {t("admin.nav.partnerDashboard")}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell locale={locale} />
          <form action={growthSignOutAction} className="inline-flex">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 hover:border-gold/30 hover:text-white sm:px-4 sm:text-xs"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
