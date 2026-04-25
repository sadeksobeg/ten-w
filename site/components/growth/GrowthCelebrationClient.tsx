"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { GrowthBadgeUnlockModal } from "@/components/growth/GrowthBadgeUnlockModal";

type Props = {
  celebrate?: string;
  badgeName?: string;
};

export function GrowthCelebrationClient({ celebrate, badgeName }: Props) {
  const router = useRouter();
  const key = celebrate?.startsWith("badge:") ? celebrate.slice(6).trim() : undefined;
  const [open, setOpen] = useState(!!key);

  if (!open || !key) return null;

  return (
    <GrowthBadgeUnlockModal
      badgeKey={key}
      badgeName={badgeName}
      onDismiss={() => {
        setOpen(false);
        router.replace("/growth");
      }}
    />
  );
}
