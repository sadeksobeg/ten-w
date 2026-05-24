"use client";

import { useLocale } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { sortBadgeKeysForDisplay } from "@/lib/growth/badge-visual";

type Props = {
  badgeKeys: string[];
  size?: "xs" | "sm";
  max?: number;
  className?: string;
};

export function PartnerNameBadges({
  badgeKeys,
  size = "xs",
  max = 8,
  className = "",
}: Props) {
  const locale = useLocale();
  const keys = sortBadgeKeysForDisplay(badgeKeys).slice(0, max);
  if (keys.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-0.5 ${className}`} aria-hidden>
      {keys.map((key) => {
        const copy = resolveBadgeCopy(key, locale);
        return (
          <BadgeIcon
            key={key}
            badgeKey={key}
            earned
            chip
            size={size}
            name={copy.name}
          />
        );
      })}
    </span>
  );
}
