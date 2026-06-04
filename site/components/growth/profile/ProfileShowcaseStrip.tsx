import { ProfileBadgeStack } from "@/components/growth/profile/ProfileBadgeStack";

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
    <section className="relative mt-8 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-b from-gold/[0.08] via-[#0a0c14] to-[#050810] px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(228,184,77,0.12),transparent_55%)]" />
      <div className="relative text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold/70">Showcase</p>
        <h2 className="mt-1 font-[family-name:var(--font-cairo)] text-xl font-bold text-gold">{title}</h2>
      </div>
      <ProfileBadgeStack
        locale={locale}
        keys={keys}
        earnedBadges={earnedBadges}
        size="hero"
      />
    </section>
  );
}
