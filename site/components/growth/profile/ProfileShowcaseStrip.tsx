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
    <section className="mt-6">
      <h2 className="text-sm font-bold text-gold/90">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {visible.map((key) => {
          const meta = earnedBadges.find((b) => b.key === key);
          const copy = resolveBadgeCopy(key, locale, { name: meta?.name ?? key });
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-1 rounded-2xl border border-gold/25 bg-gold/5 px-3 py-2"
              title={copy.name}
            >
              <BadgeIcon badgeKey={key} earned size="md" showGlow />
              <span className="max-w-[5rem] truncate text-[10px] font-semibold text-white/70">
                {copy.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
