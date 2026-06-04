"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { GhostData } from "@/lib/growth/ghost";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconLightbulb } from "@/components/growth/icons/GrowthIcons";

type Props = {
  ghost: GhostData | null;
  ghostRow?: React.ReactNode;
};

export function GhostModePanel({ ghost, ghostRow }: Props) {
  const t = useTranslations("Growth.ghost");
  const [on, setOn] = useState(false);

  if (!ghost) return null;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
          on
            ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
            : "border-white/15 text-white/60 hover:border-gold/30"
        }`}
      >
        {t("toggle")}
      </button>
      {on ? (
        <GlassCard className="growth-ghost-row border-dashed border-violet-400/30 bg-violet-500/5 p-5">
          <h3 className="font-bold text-violet-200">{t("racing", { name: ghost.legendName })}</h3>
          <p className="mt-1 text-xs text-white/55">{t("sameStage")}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-white/50">{t("deals")}</dt>
              <dd>
                {t("vs", { mine: ghost.myDeals, ghost: ghost.ghostDeals })}
              </dd>
            </div>
            <div>
              <dt className="text-white/50">XP</dt>
              <dd>{t("vs", { mine: ghost.myXp, ghost: ghost.ghostXp })}</dd>
            </div>
            <div>
              <dt className="text-white/50">{t("streak")}</dt>
              <dd>{t("vs", { mine: ghost.myStreak, ghost: ghost.ghostStreak })}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 text-sm text-gold">
            <IconLightbulb size={18} className="mt-0.5 shrink-0 text-gold/90" />
            <span>{ghost.catchUpTip}</span>
          </p>
        </GlassCard>
      ) : null}
      {on && ghostRow ? <div className="mt-2">{ghostRow}</div> : null}
    </div>
  );
}
