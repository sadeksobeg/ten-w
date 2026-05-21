"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import type { DashboardMission } from "@/lib/growth/get-dashboard";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";
import { useLocale } from "next-intl";

type Props = {
  missions: DashboardMission[];
};

function msUntilMidnightUtc(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function DashboardMissions({ missions }: Props) {
  const t = useTranslations("Growth.missions");
  const locale = useLocale();
  const [remaining, setRemaining] = useState(msUntilMidnightUtc());
  const powerLabel = getXpBrandLabel(locale);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(msUntilMidnightUtc()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const timer = t("resetsIn", { h, m });

  return (
    <section>
      <SectionHeader title={t("title")} subtitle={timer} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {missions.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-[var(--growth-text-sub)]">{t("empty")}</p>
          </GlassCard>
        ) : (
          missions.map((mission) => {
            const pct = Math.min(
              100,
              Math.round((mission.progress / Math.max(1, mission.target)) * 100),
            );
            return (
              <GlassCard key={mission.key} className={mission.completed ? "border-emerald-500/35" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold">{mission.title}</span>
                  <span className="shrink-0 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
                    +{mission.xpReward} {powerLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--growth-text-sub)]">
                  {mission.progress}/{mission.target}
                  {mission.completed && mission.rewardStatus === "pending"
                    ? ` · ${t("pendingApproval")}`
                    : mission.completed && mission.rewardStatus === "approved"
                      ? ` · ${t("done")}`
                      : mission.completed && mission.rewardStatus === "rejected"
                        ? ` · ${t("rejected")}`
                        : mission.completed
                          ? ` · ${t("done")}`
                          : ""}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#534AB7,#B07D2B,#E4B84D)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </section>
  );
}
