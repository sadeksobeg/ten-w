import Link from "next/link";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { growthSignOutAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

type Props = {
  locale: string;
  variant: "partner" | "admin";
};

export async function GrowthTopBar({ locale, variant }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const t = await getTranslations("Growth.nav");

  let eventBadge = 0;
  if (variant === "partner" && session.user.role === "PARTNER") {
    eventBadge = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
        type: NotificationType.EVENT_INVITE,
      },
    });
  }

  const linkClass =
    "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 hover:border-gold/30 hover:text-white sm:text-xs";

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
      <div className="flex flex-wrap gap-2">
        {variant === "partner" && session.user.role === "PARTNER" ? (
          <>
            <Link className={linkClass} href="/growth">
              {t("dashboard")}
            </Link>
            <Link className={linkClass} href="/growth/events">
              {t("events")}
              {eventBadge > 0 ? (
                <span className="ms-1 rounded-full bg-gold px-1.5 text-[10px] font-bold text-bg">
                  {eventBadge}
                </span>
              ) : null}
            </Link>
            <Link className={linkClass} href="/growth/chat">
              {t("chat")}
            </Link>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell locale={locale} />
        <form action={growthSignOutAction} className="inline-flex">
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={linkClass}>
            {t("signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
