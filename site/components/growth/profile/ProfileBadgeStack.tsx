"use client";

import { BadgeIcon, type BadgeIconSize } from "@/components/growth/badges/BadgeIcon";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";

type Props = {
  locale: string;
  keys: string[];
  earnedBadges: { key: string; name: string }[];
  size?: BadgeIconSize;
  compact?: boolean;
};

const ROTATIONS = [-16, -8, 0, 8, 16] as const;
const OFFSETS = [-72, -36, 0, 36, 72] as const;

export function ProfileBadgeStack({
  locale,
  keys,
  earnedBadges,
  size = "hero",
  compact = false,
}: Props) {
  const earnedSet = new Set(earnedBadges.map((b) => b.key));
  const visible = keys.filter((k) => earnedSet.has(k)).slice(0, 5);
  if (visible.length === 0) return null;

  const center = Math.floor(visible.length / 2);

  return (
    <div
      className={`growth-badge-stack relative mx-auto flex items-end justify-center ${
        compact ? "h-[140px] max-w-[280px]" : "h-[240px] max-w-full"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-[10%] bottom-2 h-20 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(228,184,77,0.35),transparent_70%)] blur-xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-1 w-[min(100%,420px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        aria-hidden
      />

      {visible.map((key, i) => {
        const meta = earnedBadges.find((b) => b.key === key);
        const copy = resolveBadgeCopy(key, locale, { name: meta?.name ?? key });
        const isCenter = i === center;
        const offset = OFFSETS[i] ?? 0;
        const rotate = ROTATIONS[i] ?? 0;

        return (
          <div
            key={key}
            className={`absolute bottom-0 flex flex-col items-center transition-all duration-300 motion-safe:hover:z-50 ${
              isCenter ? "z-30" : "z-20"
            }`}
            style={{
              transform: `translateX(${offset}px) rotate(${rotate}deg)`,
              zIndex: isCenter ? 30 : 10 + i,
            }}
          >
            <div className={isCenter ? "growth-badge-stack-item--center" : ""}>
              <div
                className={`rounded-[2rem] border bg-gradient-to-b from-white/[0.08] to-transparent p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-transform motion-safe:group-hover:scale-[1.08] ${
                  key === "verified_partner" || key === "founding_partner"
                    ? "border-gold/50 ring-2 ring-gold/30"
                    : "border-white/15"
                }`}
              >
                <BadgeIcon
                  badgeKey={key}
                  earned
                  size={isCenter && !compact ? size : compact ? "lg" : "xxl"}
                  showGlow
                  animate={isCenter}
                />
              </div>
            </div>
            {!compact ? (
              <span className="mt-2 max-w-[5.5rem] truncate text-center text-[10px] font-bold text-gold/90 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                {copy.name}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
