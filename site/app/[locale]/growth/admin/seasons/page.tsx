import { getTranslations } from "next-intl/server";
import { listEndedSeasons } from "@/lib/growth/season-archive";
import { prisma } from "@/lib/prisma";
import { adminCloseSeasonFormAction } from "@/lib/growth/actions";

export default async function GrowthAdminSeasonsPage() {
  const t = await getTranslations("Growth.admin.seasonsPage");
  const [active, ended] = await Promise.all([
    prisma.leaderboardSeason.findMany({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
    listEndedSeasons(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
      <section>
        <h2 className="text-sm font-bold text-gold">{t("active")}</h2>
        <ul className="mt-3 space-y-2">
          {active.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 p-4 text-sm">
              <span>
                {s.name} · {s.weightDeals}/{s.weightXp}/{s.weightStreak}
              </span>
              <form action={adminCloseSeasonFormAction}>
                <input type="hidden" name="seasonId" value={s.id} />
                <button type="submit" className="rounded-lg border border-gold/30 px-3 py-1 text-xs font-semibold text-gold">
                  {t("closeSeason")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-bold text-white/70">{t("archive")}</h2>
        <ul className="mt-3 space-y-2">
          {ended.length === 0 ? (
            <li className="text-sm text-white/50">{t("empty")}</li>
          ) : (
            ended.map((s) => (
              <li key={s.id} className="rounded-xl border border-white/10 p-4 text-sm text-white/70">
                {s.name} · {s.endsAt?.toLocaleDateString() ?? "—"}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
