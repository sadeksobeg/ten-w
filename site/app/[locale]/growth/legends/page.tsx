import { getTranslations } from "next-intl/server";
import { listHallOfLegends, emptyLegendSlots } from "@/lib/growth/hall-of-legends";
import { Link } from "@/i18n/navigation";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { PartnerCard } from "@/components/growth/cards/PartnerCard";

type Props = { params: Promise<{ locale: string }> };

export default async function HallOfLegendsPage({ params }: Props) {
  const { locale } = await params;
  const [entries, t, tDna] = await Promise.all([
    listHallOfLegends(),
    getTranslations("Growth.legends"),
    getTranslations("Growth.dna.archetypes"),
  ]);
  const empty = emptyLegendSlots(entries.length);
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-6">
      <header className="text-center">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold text-gold sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-white/50">{t("since", { year })}</p>
        <hr className="mx-auto mt-6 w-48 border-gold/30" />
      </header>

      <div className="space-y-8">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className={`rounded-2xl border border-gold/25 bg-white/[0.03] p-6 ${entry.rank === 1 ? "ring-1 ring-gold/40" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-sm font-bold text-gold">
                #{String(entry.rank).padStart(3, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                {entry.monthAdded}
              </span>
            </div>

            {entry.rank === 1 ? (
              <p className="mt-2 text-center text-xs font-bold text-gold">{t("founding")}</p>
            ) : null}

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <GrowthAvatar
                name={entry.partner.name}
                email={entry.partner.userId}
                avatarUrl={entry.partner.avatarUrl}
                avatarPreset={entry.partner.avatarPreset}
                size="lg"
              />
              <div className="min-w-0 flex-1 text-center sm:text-start">
                <h2 className="text-xl font-extrabold text-white">{entry.partner.name}</h2>
                <p className="mt-1 text-sm text-gold/80">
                  «{tDna(entry.partner.dnaArchetype)}» · {entry.partner.levelName}
                </p>
                <p className="mt-2 text-sm text-white/70">{entry.achievement}</p>
                {entry.quote ? (
                  <blockquote className="mt-3 border-s-2 border-gold/30 ps-3 text-sm italic text-white/55">
                    {entry.quote}
                  </blockquote>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex justify-center scale-75 sm:scale-90">
              <PartnerCard
                name={entry.partner.name}
                email={entry.partner.userId}
                displayTitle={null}
                levelCode={entry.partner.levelCode}
                levelName={entry.partner.levelName}
                cardNumber={entry.partner.cardNumber ?? 0}
                totalXp={0}
                closedDeals={entry.partner.closedDeals}
                badgeCount={0}
                showcasedBadges={[]}
                dnaDimensions={{ sales: 50, network: 50, content: 50, speed: 50 }}
                archetype={entry.partner.dnaArchetype as import("@/lib/growth/dna-score").DnaArchetype}
                avatarUrl={entry.partner.avatarUrl}
                avatarPreset={entry.partner.avatarPreset}
              />
            </div>
          </article>
        ))}

        {empty.map((slot) => (
          <div
            key={slot}
            className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"
          >
            <p className="font-mono text-sm text-white/35">{t("empty_slot", { n: slot })}</p>
          </div>
        ))}
      </div>

      <footer className="rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
        <h3 className="font-bold text-gold">{t("how_to_join")}</h3>
        <p className="mt-2 text-sm text-white/55">{t("how_to_join_body")}</p>
        <Link
          href="/growth/register"
          className="mt-4 inline-block text-sm font-bold text-sky-300 hover:underline"
        >
          {t("join_cta")}
        </Link>
      </footer>
    </div>
  );
}
