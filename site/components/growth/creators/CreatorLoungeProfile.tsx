"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorStatusBoard } from "@/components/growth/creators/CreatorStatusBoard";
import { CreatorLoungeAchievements } from "./CreatorLoungeAchievements";
import type { BadgeGridItem } from "@/components/growth/badges/BadgeGrid";
import type { CreatorStatusCard } from "@/lib/growth/creator-arena";

type Props = {
  locale: string;
  badges: BadgeGridItem[];
  milestones: string[];
  statusCards: CreatorStatusCard[];
  myUserId: string;
};

export function CreatorLoungeProfile({
  locale,
  badges,
  milestones,
  statusCards,
  myUserId,
}: Props) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <div className="space-y-4">
      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
          {t("profileTitle")}
        </h2>
        <p className="mt-1 text-xs text-white/55">{t("profileSubtitle")}</p>
        <Link
          href="/growth/settings"
          className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-gold/35 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:border-gold/50"
        >
          {t("profileSettingsCta")}
        </Link>
      </GlassCard>

      <CreatorLoungeAchievements locale={locale} badges={badges} milestones={milestones} />

      <div>
        <h3 className="mb-3 font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white/80">
          {t("profileStatusBoard")}
        </h3>
        <CreatorStatusBoard cards={statusCards} myUserId={myUserId} />
      </div>
    </div>
  );
}
