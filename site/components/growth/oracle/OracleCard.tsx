"use client";

import { useTranslations } from "next-intl";
import type { OraclePrediction } from "@/lib/growth/oracle";
import { formatUsdFromCents } from "@/lib/growth/format-money";
import { IconOracle } from "@/components/growth/icons/GrowthIcons";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  oracle: OraclePrediction;
  locale?: string;
};

const URGENCY_CLASS = {
  high: "border-rose-400/40 bg-rose-950/30",
  medium: "border-gold/35 bg-gold/10",
  low: "border-white/15 bg-white/[0.04]",
} as const;

export function OracleCard({ oracle, locale = "en" }: Props) {
  const t = useTranslations("Growth.oracle");
  const dealsPct = Math.min(
    100,
    Math.round((oracle.weeklyProgress.deals / Math.max(oracle.weeklyTarget.deals, 1)) * 100),
  );
  const xpPct = Math.min(
    100,
    Math.round((oracle.weeklyProgress.xp / Math.max(oracle.weeklyTarget.xp, 1)) * 100),
  );
  const weeklyPct = Math.round((dealsPct + xpPct) / 2);

  return (
    <GlassCard variant="elevated" className="relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -end-10 -top-10 size-36 rounded-full bg-violet-500/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconOracle className="text-violet-300" size={22} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">
              {t("eyebrow")}
            </p>
            <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
              {t("title")}
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold capitalize text-white/70">
          {t(`momentum.${oracle.momentum}`)}
        </span>
      </div>

      <div
        className={`relative mt-4 rounded-xl border p-3 ${URGENCY_CLASS[oracle.insight.urgency]}`}
      >
        <p className="text-sm font-bold text-white">
          {t(oracle.insight.titleKey, oracle.insight.titleParams)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/65">
          {t(oracle.insight.bodyKey, oracle.insight.bodyParams)}
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center">
          <p className="text-[10px] text-white/45">{t("daysToLevel")}</p>
          <p className="text-sm font-black tabular-nums text-gold">
            {oracle.daysToNextLevel ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center">
          <p className="text-[10px] text-white/45">{t("monthlyEarnings")}</p>
          <p className="text-sm font-black tabular-nums text-white">
            {formatUsdFromCents(oracle.estimatedMonthlyEarnings, locale)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center">
          <p className="text-[10px] text-white/45">{t("top3Chance")}</p>
          <p className="text-sm font-black tabular-nums text-emerald-300">
            {oracle.top3Probability}%
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center">
          <p className="text-[10px] text-white/45">{t("deals30d")}</p>
          <p className="text-sm font-black tabular-nums text-white">{oracle.dealsPrediction30d}</p>
        </div>
      </div>

      <hr className="my-4 border-white/10" />

      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-white/75">{t("weeklyProgress")}</span>
          <span className="tabular-nums text-white/55">
            {oracle.weeklyProgress.deals}/{oracle.weeklyTarget.deals} · {oracle.weeklyProgress.xp}
            /{oracle.weeklyTarget.xp} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="growth-shimmer h-full rounded-full motion-reduce:!transition-none"
            style={{
              width: `${weeklyPct}%`,
              background: "linear-gradient(90deg, #7C3AED, #A78BFA, #E4B84D)",
              transition: "width 1s ease-out",
            }}
          />
        </div>
        <p className="mt-2 text-end text-[10px] text-white/40">{t("refreshes")}</p>
      </div>
    </GlassCard>
  );
}
