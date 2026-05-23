import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  seasonName: string;
  weightDeals: number;
  weightXp: number;
  weightStreak: number;
  weeklyRank: number | null;
};

export async function SeasonPassCard({
  seasonName,
  weightDeals,
  weightXp,
  weightStreak,
  weeklyRank,
}: Props) {
  const t = await getTranslations("Growth.seasonPass");

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-gold/80">{t("eyebrow")}</p>
          <h3 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold">{seasonName}</h3>
          <p className="mt-1 text-xs text-white/50">
            {t("weights", { deals: weightDeals, xp: weightXp, streak: weightStreak })}
          </p>
          {weeklyRank != null ? (
            <p className="mt-2 text-sm text-white/70">{t("yourRank", { rank: weeklyRank })}</p>
          ) : null}
        </div>
        <Link
          href="/growth/leaderboard"
          className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-center text-sm font-semibold text-gold hover:border-gold/50"
        >
          {t("cta")}
        </Link>
      </div>
    </GlassCard>
  );
}
