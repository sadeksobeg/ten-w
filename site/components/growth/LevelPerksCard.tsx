import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { DashboardLevelInfo } from "@/lib/growth/get-dashboard";

type Props = {
  current: DashboardLevelInfo;
  next: DashboardLevelInfo | null;
};

export async function LevelPerksCard({ current, next }: Props) {
  const t = await getTranslations("Growth.levelPerks");

  return (
    <GlassCard className="p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">{t("title")}</h2>
      <p className="mt-1 text-sm text-white/60">{t("currentLevel", { name: current.name })}</p>
      {current.salaryUsd != null ? (
        <p className="mt-2 text-sm text-gold">
          {t("salary", { amount: current.salaryUsd })}
        </p>
      ) : null}
      {current.perks.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {current.perks.map((perk) => (
            <li
              key={perk}
              className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold"
            >
              {perk}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-white/45">{t("noPerks")}</p>
      )}
      {next ? (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-white/50">{t("nextLevel")}</p>
          <p className="mt-1 text-sm font-semibold text-white">{next.name}</p>
          {next.perks.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {next.perks.map((perk) => (
                <li
                  key={perk}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70"
                >
                  {perk}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </GlassCard>
  );
}
