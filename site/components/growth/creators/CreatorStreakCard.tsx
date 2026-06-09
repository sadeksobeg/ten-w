"use client";

import { useTranslations } from "next-intl";
import { IconFire } from "@/components/growth/icons/GrowthIcons";
import type { CreatorWeekStreakData } from "@/lib/growth/creator-arena";

type Props = { streak: CreatorWeekStreakData };

export function CreatorStreakCard({ streak }: Props) {
  const t = useTranslations("Creators.hub.streak");
  const milestones = [
    { weeks: 3, label: t("m3") },
    { weeks: 7, label: t("m7") },
    { weeks: 12, label: t("m12") },
  ];

  return (
    <div className="creator-card p-4">
      <div className="flex items-center gap-2">
        <IconFire size={20} className="text-[var(--creator-primary)]" />
        <p className="text-sm font-bold text-white">{t("title")}</p>
      </div>
      <p className="mt-2 text-2xl font-black text-[var(--creator-secondary)]">
        {t("weeks", { n: streak.consecutiveWeeks })}
      </p>
      <div className="mt-3 flex gap-1.5">
        {streak.weekSlots.map((active, i) => (
          <span
            key={i}
            className={`size-3 rounded-full border ${
              active
                ? "border-[var(--creator-secondary)] bg-[var(--creator-secondary)]"
                : i === streak.weekSlots.length - 1 && !active
                  ? "border-[var(--creator-primary)] bg-transparent ring-2 ring-[var(--creator-primary)]/40"
                  : "border-white/20 bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/45">
        {milestones.map((m) => (
          <span key={m.weeks} className={streak.consecutiveWeeks >= m.weeks ? "text-amber-200/90" : ""}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
