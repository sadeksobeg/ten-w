import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { AdminStatsBar } from "@/components/growth/admin/AdminStatsBar";
import { GrowthAdminNav } from "@/components/growth/admin/GrowthAdminNav";
import { growthSignOutAction } from "@/lib/growth/actions";

type Props = {
  children: ReactNode;
  locale: string;
};

export async function GrowthAdminShell({ children, locale }: Props) {
  const t = await getTranslations("Growth");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-56 xl:w-60">
        <div className="rounded-2xl border border-white/10 bg-[#070b18]/90 p-4 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80">
            {t("admin.enter")}
          </p>
          <p className="mt-1 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
            {t("admin.productName")}
          </p>
          <div className="mt-4">
            <GrowthAdminNav />
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 lg:flex-col lg:items-stretch">
            <NotificationBell locale={locale} />
            <form action={growthSignOutAction} className="flex-1">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 hover:border-rose-400/30 hover:text-rose-200"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <AdminStatsBar />
        {children}
      </main>
    </div>
  );
}
