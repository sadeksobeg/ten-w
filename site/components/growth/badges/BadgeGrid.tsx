"use client";

import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { BadgeTooltip } from "@/components/growth/badges/BadgeTooltip";

export type BadgeGridItem = {
  key: string;
  name: string;
  description?: string;
  howTo?: string;
  earned: boolean;
  grantedAt?: string | null;
  hidden?: boolean;
};

type Props = {
  badges: BadgeGridItem[];
  locale?: string;
  size?: "sm" | "md" | "lg";
  showLocked?: boolean;
};

export function BadgeGrid({ badges, locale = "ar", size = "md", showLocked = true }: Props) {
  const t = useTranslations("Growth.badges");

  const visible = badges.filter((b) => showLocked || b.earned || !b.hidden);
  const sorted = [...visible].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return a.name.localeCompare(b.name, locale === "ar" ? "ar" : "en");
  });

  if (sorted.length === 0) {
    return null;
  }

  return (
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
          >
            <BadgeIcon badgeKey={b.key} earned={b.earned} size={size} lockedLabel={t("locked")} />
          </BadgeTooltip>
          <span className="max-w-full truncate text-center text-[10px] font-semibold text-[var(--growth-text)]">
            {b.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
