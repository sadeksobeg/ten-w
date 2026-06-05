"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { BadgeTooltip } from "@/components/growth/badges/BadgeTooltip";
import { BadgeDetailDrawer } from "@/components/growth/badges/BadgeDetailDrawer";
import { getBadgeDef, RARITY_LABEL_KEYS, type BadgeRarity } from "@/lib/growth/badge-visual";
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
  size?: "sm" | "md" | "lg" | "xl";
  showLocked?: boolean;
};

type RarityFilter = "all" | BadgeRarity;

const FILTER_KEYS: RarityFilter[] = ["all", "rare", "epic", "legendary", "mythic"];

export function BadgeGrid({ badges, locale = "ar", size = "md", showLocked = true }: Props) {
  const t = useTranslations("Growth.badges");
  const [drawer, setDrawer] = useState<BadgeGridItem | null>(null);
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  const visible = useMemo(
    () => badges.filter((b) => showLocked || b.earned || !b.hidden),
    [badges, showLocked],
  );

  const filtered = useMemo(() => {
    if (rarityFilter === "all") return visible;
    return visible.filter((b) => getBadgeDef(b.key).rarity === rarityFilter);
  }, [visible, rarityFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return a.name.localeCompare(b.name, locale === "ar" ? "ar" : "en");
      }),
    [filtered, locale],
  );

  if (visible.length === 0) return null;

  const earnedCount = visible.filter((b) => b.earned).length;

  const countByRarity = (r: BadgeRarity) =>
    visible.filter((b) => getBadgeDef(b.key).rarity === r).length;

  return (
    <div className="growth-trophy-vault rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(228,184,77,0.08),transparent_55%)] p-3 sm:p-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-[var(--growth-text-sub)]">
          {t("badge_count", { earned: earnedCount, total: visible.length })}
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTER_KEYS.map((f) => {
            const label =
              f === "all"
                ? t("filter.all")
                : `${t(`filter.${f}`)} (${countByRarity(f)})`;
            const active = rarityFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setRarityFilter(f)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                  active
                    ? "bg-gold text-bg"
                    : "border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-2 gap-y-4 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
        {sorted.map((b) => {
          const def = getBadgeDef(b.key);
          const isSecret = Boolean(b.hidden && !b.earned);
          const displayName = isSecret ? t("secret") : b.name;
          const progressPct =
            b.progress && b.progress.target > 0
              ? Math.min(100, Math.round((b.progress.current / b.progress.target) * 100))
              : 0;

          return (
            <li
              key={b.key}
              className={`growth-trophy-vault-cell flex min-w-0 flex-col items-center gap-2 rounded-xl border p-2.5 transition sm:rounded-2xl sm:p-3 ${
                b.earned
                  ? "border-gold/25 bg-gradient-to-b from-gold/[0.08] to-transparent shadow-[0_12px_40px_-16px_rgba(228,184,77,0.35)]"
                  : "border-white/8 bg-black/20 opacity-90"
              }`}
            >
              <BadgeTooltip
                badgeKey={b.key}
                name={displayName}
                description={isSecret ? t("secretHint") : b.description}
                howTo={b.howTo}
                earned={b.earned}
                grantedAt={b.grantedAt}
                locale={locale}
                progress={b.progress}
              >
                <button
                  type="button"
                  className="rounded-xl transition hover:scale-[1.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                  onClick={() => setDrawer(b)}
                >
                  <BadgeIcon
                    badgeKey={b.key}
                    earned={b.earned}
                    size="md"
                    showGlow={b.earned}
                    lockedLabel={t("locked")}
                  />
                </button>
              </BadgeTooltip>
              <span
                className={`max-w-full truncate text-center text-[10px] font-semibold ${b.earned ? "text-[var(--growth-text)]" : "text-white/45"}`}
              >
                {displayName}
              </span>
              {b.earned ? (
                <span className="rounded-full border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-gold">
                  {t(RARITY_LABEL_KEYS[def.rarity] as "rarityCommon")}
                </span>
              ) : null}
              {!b.earned && !isSecret && b.progress ? (
                <div className="w-full max-w-[5.5rem] px-0.5">
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%`, background: def.primaryColor, opacity: 0.65 }}
                    />
                  </div>
                  <p className="mt-0.5 text-center text-[9px] text-white/45">
                    {b.progress.current}/{b.progress.target}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {drawer ? (
        <BadgeDetailDrawer
          badgeKey={drawer.key}
          name={drawer.hidden && !drawer.earned ? t("secret") : drawer.name}
          description={drawer.description}
          howTo={drawer.howTo}
          earned={drawer.earned}
          progress={drawer.progress ?? null}
          onClose={() => setDrawer(null)}
        />
      ) : null}
    </div>
  );
}
