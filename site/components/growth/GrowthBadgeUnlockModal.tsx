"use client";

import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";

type Props = {
  badgeKey: string;
  badgeName?: string;
  onDismiss: () => void;
};

export function GrowthBadgeUnlockModal({ badgeKey, badgeName, onDismiss }: Props) {
  const t = useTranslations("Growth.badges");

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="badge-unlock-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-6 backdrop-blur-md"
    >
      <div className="growth-page-enter relative max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-[var(--growth-surface-2)] p-8 text-center shadow-[0_0_80px_-20px_rgba(176,125,43,0.45)]">
        <ParticleEffect />
        <BadgeIcon badgeKey={badgeKey} earned size="xl" showGlow animate />
        <div id="badge-unlock-title" className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold/90">
          {t("unlockTitle")}
        </div>
        <div className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {badgeName ?? badgeKey}
        </div>
        <div className="mt-2 text-sm text-[var(--growth-text-sub)]">
          {t("unlockSubtitle", { key: badgeKey })}
        </div>
        <GoldButton type="button" className="mt-8 w-full" onClick={onDismiss}>
          {t("unlockCta")}
        </GoldButton>
      </div>
    </div>
  );
}
