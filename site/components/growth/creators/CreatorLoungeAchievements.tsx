"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { BadgeGrid, type BadgeGridItem } from "@/components/growth/badges/BadgeGrid";
import { IconStarFilled } from "@/components/growth/icons/GrowthIcons";

type Props = {
  locale: string;
  badges: BadgeGridItem[];
  milestones: string[];
};

export function CreatorLoungeAchievements({ locale, badges, milestones }: Props) {
  const t = useTranslations("Growth.creators.lounge");

  const creatorBadges = badges.filter(
    (b) => b.key === "content_creator" || b.key.startsWith("creator_") || b.earned,
  );

  return (
    <div className="space-y-4">
      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
          {t("achievementsTitle")}
        </h2>
        <p className="mt-1 text-xs text-white/55">{t("achievementsSubtitle")}</p>
      </GlassCard>

      {creatorBadges.length > 0 ? (
        <BadgeGrid badges={creatorBadges} locale={locale} size="md" showLocked />
      ) : null}

      <GlassCard className="border border-gold/20 bg-gold/5 p-5">
        <div className="flex items-center gap-2">
          <IconStarFilled size={18} className="text-gold" />
          <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
            {t("milestonesTitle")}
          </h3>
        </div>
        {milestones.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">{t("milestonesEmpty")}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {milestones.map((m) => (
              <li
                key={m}
                className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold"
              >
                {m}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
