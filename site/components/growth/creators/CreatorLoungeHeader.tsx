"use client";

import { useTranslations } from "next-intl";
import { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { NotificationBell } from "@/components/growth/NotificationBell";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { IconStar } from "@/components/growth/icons/GrowthIcons";
import { currentWeekKey } from "@/lib/growth/creator-arena";

type Props = {
  locale: string;
  hasBadge: boolean;
  viewerName: string;
  viewerEmail: string;
  viewerAvatarUrl?: string | null;
  viewerAvatarPreset?: string | null;
  status: CreatorWorkflowStatus;
  activeCreators: number;
};

function weekNumber(weekKey: string): string {
  const match = weekKey.match(/W(\d+)/);
  return match?.[1] ?? "1";
}

export function CreatorLoungeHeader({
  locale,
  hasBadge,
  viewerName,
  viewerEmail,
  viewerAvatarUrl,
  viewerAvatarPreset,
  status,
  activeCreators,
}: Props) {
  const t = useTranslations("Growth.creators");
  const weekKey = currentWeekKey();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <GrowthAvatar
            name={viewerName}
            email={viewerEmail}
            avatarUrl={viewerAvatarUrl}
            avatarPreset={viewerAvatarPreset}
            size="md"
          />
          {hasBadge ? (
            <span className="absolute -bottom-1 -end-1">
              <BadgeIcon badgeKey="content_creator" earned size="sm" />
            </span>
          ) : (
            <span className="absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold">
              <IconStar size={10} />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-cairo)] text-base font-extrabold text-white sm:text-lg">
            {viewerName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
              {t(`status.${status}`)}
            </span>
            <span className="text-[10px] text-white/45">
              {t("lounge.weekLabel", { week: weekNumber(weekKey) })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="hidden text-xs text-white/55 sm:block">
          {t("lounge.activeCreators", { count: activeCreators })}
        </p>
        <NotificationBell locale={locale} />
      </div>
    </header>
  );
}
