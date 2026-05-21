import Link from "next/link";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { growthSignOutAction } from "@/lib/growth/actions";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { countNotificationsSafe } from "@/lib/growth/prisma-optional";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";

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
    eventBadge = await countNotificationsSafe(prisma, {
      userId: session.user.id,
      isRead: false,
      type: NotificationType.EVENT_INVITE,
    });
  }

  const userRow =
    variant === "partner"
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true, avatarUrl: true, publicSlug: true },
        })
      : null;

  const linkClass =
    "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 hover:border-gold/30 hover:text-white sm:text-xs";

  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {userRow ? (
          <GrowthAvatar
            name={userRow.name}
            email={userRow.email}
            avatarUrl={userRow.avatarUrl}
            size="md"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
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
