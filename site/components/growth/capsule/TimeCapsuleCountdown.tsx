"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = { daysLeft: number };

export function TimeCapsuleCountdown({ daysLeft }: Props) {
  const t = useTranslations("Growth.capsule");
  return (
    <GlassCard className="border-gold/20 p-4">
      <p className="text-xs font-semibold text-gold">{t("lockedTitle")}</p>
      <p className="mt-1 text-sm text-white/70">{t("lockedBody", { days: daysLeft })}</p>
    </GlassCard>
  );
}
