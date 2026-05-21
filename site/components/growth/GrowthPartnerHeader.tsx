"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { growthSignOutAction } from "@/lib/growth/actions";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";

type Props = {
  locale: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  levelName: string;
  publicSlug: string | null;
};

export function GrowthPartnerHeader({
  locale,
  name,
  email,
  avatarUrl,
  levelName,
  publicSlug,
}: Props) {
  const t = useTranslations("Growth.nav");
  const linkClass =
    "whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 hover:border-gold/30 hover:text-white sm:text-xs";

  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <GrowthAvatar name={name} email={email} avatarUrl={avatarUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{name ?? email}</p>
          <LevelBadge levelName={levelName} size="sm" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        {publicSlug ? (
          <Link
            href={`/growth/profile/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            {t("myProfile")}
          </Link>
        ) : null}
        <NotificationBell locale={locale} />
        <form action={growthSignOutAction} className="inline-flex">
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={linkClass}>
            {t("signOut")}
          </button>
        </form>
      </div>
    </header>
  );
}
