"use client";

import type { ReactNode } from "react";
import {
  getBadgeVisual,
  RARITY_COLORS,
  RARITY_LABEL_KEYS,
  type BadgeRarity,
} from "@/lib/growth/badge-visual";
import { useTranslations } from "next-intl";

type Props = {
  badgeKey: string;
  name: string;
  description?: string;
  howTo?: string;
  earned: boolean;
  grantedAt?: string | null;
  locale: string;
  children: ReactNode;
};

export function BadgeTooltip({
  badgeKey,
  name,
  description,
  howTo,
  earned,
  grantedAt,
  locale,
  children,
}: Props) {
  const t = useTranslations("Growth.badges");
  const meta = getBadgeVisual(badgeKey);
  const rarity = meta.rarity as BadgeRarity;
  const dateStr =
    earned && grantedAt
      ? new Date(grantedAt).toLocaleDateString(
          locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
          { year: "numeric", month: "short", day: "numeric" },
        )
      : null;

  return (
    <div className="group/badge relative flex flex-col items-center">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full z-50 mb-2 hidden w-56 rounded-xl border border-[var(--growth-border)] bg-[var(--growth-surface-2)] p-3 text-start shadow-xl motion-safe:group-hover/badge:block group-focus-within/badge:block"
        style={{ insetInlineStart: "50%", transform: "translateX(-50%)" }}
      >
        <p className="text-sm font-bold text-[var(--growth-text)]">{name}</p>
        <span
          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
          style={{
            color: RARITY_COLORS[rarity],
            border: `1px solid ${RARITY_COLORS[rarity]}55`,
          }}
        >
          {t(RARITY_LABEL_KEYS[rarity])}
        </span>
        {description ? (
          <p className="mt-2 text-xs leading-relaxed text-[var(--growth-text-sub)]">{description}</p>
        ) : null}
        {howTo ? (
          <p className="mt-2 text-xs text-gold/90">
            <span className="font-semibold">
              {locale === "ar" ? "كيف تُكتسب: " : locale === "fr" ? "Comment: " : "How: "}
            </span>
            {howTo}
          </p>
        ) : null}
        {earned && dateStr ? (
          <p className="mt-2 text-[10px] text-emerald-400/90">
            {locale === "ar" ? `مُنحت في ${dateStr}` : locale === "fr" ? `Obtenu le ${dateStr}` : `Earned ${dateStr}`}
          </p>
        ) : !earned ? (
          <p className="mt-2 text-[10px] text-white/45">{t("locked")}</p>
        ) : null}
      </div>
    </div>
  );
}
