import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  GROWTH_DESKTOP_NAV_ICONS,
} from "@/components/growth/icons/GrowthIcons";

const EXPLORE_KEYS = [
  "deals",
  "events",
  "map",
  "chronicle",
  "constellation",
  "vault",
  "battles",
  "mentors",
  "earnings",
  "network",
  "leaderboard",
  "chat",
  "legends",
] as const;

const FEATURED_KEYS = new Set<string>([
  "chronicle",
  "constellation",
  "vault",
  "battles",
  "mentors",
  "map",
]);

const HREF: Record<(typeof EXPLORE_KEYS)[number], string> = {
  deals: "/growth/deals",
  events: "/growth/events",
  map: "/growth/map",
  chronicle: "/growth/chronicle",
  constellation: "/growth/constellation",
  vault: "/growth/vault",
  battles: "/growth/battles",
  mentors: "/growth/mentors",
  earnings: "/growth/earnings",
  network: "/growth/network",
  leaderboard: "/growth/leaderboard",
  chat: "/growth/chat",
  legends: "/growth/legends",
};

export async function GrowthHubExploreNav() {
  const tNav = await getTranslations("Growth.nav");
  const tDesc = await getTranslations("Growth.navDesc");

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-gold">{tDesc("sectionTitle")}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {EXPLORE_KEYS.map((key) => {
          const Icon = GROWTH_DESKTOP_NAV_ICONS[key];
          const featured = FEATURED_KEYS.has(key);
          return (
            <Link
              key={key}
              href={HREF[key]}
              className={`group relative overflow-hidden rounded-2xl border p-3 transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
                featured
                  ? "border-gold/35 bg-gradient-to-br from-gold/15 via-violet-500/10 to-cyan-500/5 hover:border-gold/55 hover:shadow-[0_0_32px_-8px_rgba(228,184,77,0.45)]"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/25 hover:bg-white/[0.06]"
              }`}
            >
              {featured ? (
                <div
                  className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-gold/20 blur-2xl motion-safe:animate-pulse motion-reduce:animate-none"
                  aria-hidden
                />
              ) : null}
              <div className="relative flex items-start gap-2.5">
                {Icon ? (
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${
                      featured
                        ? "border-gold/30 bg-gold/10 text-gold"
                        : "border-white/10 bg-white/[0.04] text-white/70 group-hover:border-gold/25 group-hover:text-gold"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className={`truncate text-xs font-bold ${featured ? "text-gold" : "text-white"}`}>
                    {tNav(key)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/50">
                    {tDesc(key)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
