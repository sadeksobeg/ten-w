import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";

type Props = {
  locale: string;
  keys: string[];
  earnedBadges: { key: string; name: string }[];
  title: string;
};

export function ProfileShowcaseStrip({ locale, keys, earnedBadges, title }: Props) {
  if (keys.length === 0) return null;
  const earnedSet = new Set(earnedBadges.map((b) => b.key));
  const visible = keys.filter((k) => earnedSet.has(k)).slice(0, 5);
  if (visible.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-gold/90">{title}</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((key) => {
          const meta = earnedBadges.find((b) => b.key === key);
          const copy = resolveBadgeCopy(key, locale, { name: meta?.name ?? key });
          return (
            <div
              key={key}
              className="flex min-w-[9rem] shrink-0 flex-col items-center gap-2 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent px-4 py-4 shadow-[0_0_32px_-12px_rgba(228,184,77,0.45)]"
              title={copy.name}
            >
              <BadgeIcon badgeKey={key} earned size="xl" showGlow />
              <span className="max-w-[7rem] truncate text-center text-[11px] font-semibold text-white/80">
                {copy.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
