"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { BadgeTooltip } from "@/components/growth/badges/BadgeTooltip";
import { BadgeDetailDrawer } from "@/components/growth/badges/BadgeDetailDrawer";
import { getBadgeVisual, RARITY_LABEL_KEYS } from "@/lib/growth/badge-visual";
import type { BadgeProgress } from "@/lib/growth/badge-progress";

export type BadgeGridItem = {
  key: string;
  name: string;
  description?: string;
  howTo?: string;
  earned: boolean;
  grantedAt?: string | null;
  hidden?: boolean;
  progress?: BadgeProgress | null;
};

type Props = {
  badges: BadgeGridItem[];
  locale?: string;
  size?: "sm" | "md" | "lg";
  showLocked?: boolean;
};

export function BadgeGrid({ badges, locale = "ar", size = "md", showLocked = true }: Props) {
  const t = useTranslations("Growth.badges");
  const [drawer, setDrawer] = useState<BadgeGridItem | null>(null);

  const visible = badges.filter((b) => showLocked || b.earned || !b.hidden);
  const sorted = [...visible].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return a.name.localeCompare(b.name, locale === "ar" ? "ar" : "en");
  });

  if (sorted.length === 0) return null;

  const earnedCount = sorted.filter((b) => b.earned).length;

  return (
    <>
      <p className="mb-3 text-xs font-semibold text-[var(--growth-text-sub)]">
        {t("badge_count", { earned: earnedCount, total: sorted.length })}
      </p>
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {sorted.map((b) => (
          <li key={b.key} className="flex flex-col items-center gap-2">
            <BadgeTooltip
              badgeKey={b.key}
              name={b.name}
              description={b.description}
              howTo={b.howTo}
              earned={b.earned}
              grantedAt={b.grantedAt}
              locale={locale}
              progress={b.progress}
            >
              <button
                type="button"
                className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                onClick={() => setDrawer(b)}
              >
                <BadgeIcon badgeKey={b.key} earned={b.earned} size={size} lockedLabel={t("locked")} />
              </button>
            </BadgeTooltip>
            <span
              className={`max-w-full truncate text-center text-[10px] font-semibold ${b.earned ? "text-[var(--growth-text)]" : "text-white/45"}`}
            >
              {b.name}
            </span>
            {b.earned ? (
              <span className="rounded-full border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-gold">
                {t(RARITY_LABEL_KEYS[getBadgeVisual(b.key).rarity] as "rarityCommon")}
              </span>
            ) : null}
            {!b.earned && b.progress ? (
              <span className="text-[9px] text-white/45">
                {b.progress.current}/{b.progress.target}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {drawer ? (
        <BadgeDetailDrawer
          badgeKey={drawer.key}
          name={drawer.name}
          description={drawer.description}
          howTo={drawer.howTo}
          earned={drawer.earned}
          progress={drawer.progress ?? null}
          onClose={() => setDrawer(null)}
        />
      ) : null}
    </>
  );
}
