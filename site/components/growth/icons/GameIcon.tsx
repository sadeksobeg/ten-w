"use client";

import { getGameIcon } from "@/lib/growth/game-icons/registry";

type Props = {
  slug: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
  glow?: boolean;
  ariaHidden?: boolean;
};

export function GameIcon({
  slug,
  size = 24,
  color = "currentColor",
  secondaryColor,
  className = "",
  glow = false,
  ariaHidden = true,
}: Props) {
  const def = getGameIcon(slug);
  const filterId = glow ? `gi-glow-${slug.replace(/\W/g, "")}-${size}` : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox ?? "0 0 512 512"}
      className={className}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
    >
      {glow ? (
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.75" />
          </filter>
        </defs>
      ) : null}
      <path
        fill={color}
        d={def.d}
        filter={filterId ? `url(#${filterId})` : undefined}
      />
      {def.d2 ? (
        <path fill={secondaryColor ?? color} fillOpacity={0.55} d={def.d2} />
      ) : null}
    </svg>
  );
}
