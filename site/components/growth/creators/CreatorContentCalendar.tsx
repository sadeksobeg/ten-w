"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconCalendar } from "@/components/growth/icons/GrowthIcons";
import { currentWeekKey } from "@/lib/growth/creator-arena";

type DayCell = {
  key: string;
  label: string;
  date: number;
  isToday: boolean;
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function buildWeekDays(): DayCell[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset);

  return DAY_KEYS.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      key,
      label: key,
      date: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
    };
  });
}

type Props = {
  plannedDays?: string[];
};

export function CreatorContentCalendar({ plannedDays = [] }: Props) {
  const t = useTranslations("Growth.creators.calendar");
  const weekKey = currentWeekKey();
  const days = useMemo(() => buildWeekDays(), []);
  const planned = new Set(plannedDays);

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2">
        <IconCalendar size={18} className="text-gold" />
        <div>
          <h3 className="font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">
            {t("title")}
          </h3>
          <p className="text-[10px] text-white/45">{t("subtitle", { week: weekKey })}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const plannedDay = planned.has(day.key);
          return (
            <div
              key={day.key}
              className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                day.isToday
                  ? "border-gold/40 bg-gold/10"
                  : plannedDay
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-black/20"
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wide text-white/45">
                {t(day.label)}
              </span>
              <span className="mt-1 text-lg font-black text-white">{day.date}</span>
              {plannedDay ? (
                <span className="mt-1 text-[8px] font-semibold text-emerald-300">{t("planned")}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
