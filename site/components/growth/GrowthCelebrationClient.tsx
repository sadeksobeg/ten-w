"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { GrowthBadgeUnlockModal } from "@/components/growth/GrowthBadgeUnlockModal";
import { LevelUpOverlay } from "@/components/growth/LevelUpOverlay";

type Props = {
  celebrate?: string;
  badgeName?: string;
};

export function GrowthCelebrationClient({ celebrate, badgeName }: Props) {
  const router = useRouter();
  const badgeKey = celebrate?.startsWith("badge:") ? celebrate.slice(6).trim() : undefined;
  const levelName = celebrate?.startsWith("level:") ? celebrate.slice(6).trim() : undefined;
  const [open, setOpen] = useState(!!(badgeKey || levelName));

  if (!open) return null;

  if (levelName) {
    return (
      <LevelUpOverlay
        levelName={levelName}
        onDone={() => {
          setOpen(false);
          router.replace("/growth");
        }}
      />
    );
  }

  if (!badgeKey) return null;

  return (
    <GrowthBadgeUnlockModal
      badgeKey={badgeKey}
      badgeName={badgeName}
      onDismiss={() => {
        setOpen(false);
        router.replace("/growth");
      }}
    />
  );
}
