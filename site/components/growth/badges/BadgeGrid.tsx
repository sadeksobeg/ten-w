"use client";

import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import {
  getBadgeVisual,
  RARITY_COLORS,
  RARITY_LABEL_KEYS,
  type BadgeRarity,
} from "@/lib/growth/badge-visual";

export type BadgeGridItem = {
  key: string;
  name: string;
  description?: string;
  earned: boolean;
  grantedAt?: string | null;
  hidden?: boolean;
};

type Props = {
  badges: BadgeGridItem[];
  size?: "sm" | "md" | "lg";
  showLocked?: boolean;
};

export function BadgeGrid({ badges, size = "md", showLocked = true }: Props) {
  const t = useTranslations("Growth.badges");

  const visible = badges.filter((b) => showLocked || b.earned || !b.hidden);
  const sorted = [...visible].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (sorted.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {sorted.map((b) => {
        const meta = getBadgeVisual(b.key);
        const rarity = meta.rarity as BadgeRarity;
        const tip = [
          b.name,
          b.description,
          b.earned && b.grantedAt
            ? new Date(b.grantedAt).toLocaleDateString()
            : !b.earned
              ? t("locked")
              : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={b.key} className="flex flex-col items-center gap-2" title={tip}>
            <BadgeIcon
              badgeKey={b.key}
              earned={b.earned}
              size={size}
              lockedLabel={t("locked")}
            />
            <span className="max-w-full truncate text-center text-[10px] font-semibold text-[var(--growth-text)]">
              {b.name}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider"
              style={{
                color: RARITY_COLORS[rarity],
                border: `1px solid ${RARITY_COLORS[rarity]}44`,
              }}
            >
              {t(RARITY_LABEL_KEYS[rarity])}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
