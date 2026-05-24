"use client";

import { useTranslations } from "next-intl";
import type { WarMapData } from "@/lib/growth/territory-service";
import { TERRITORY_COORDS, type TerritoryKey } from "@/lib/growth/territories";

type Props = {
  data: WarMapData;
  locale: string;
  onClaim?: (key: TerritoryKey) => void;
};

function cityRadius(partnerCount: number): number {
  if (partnerCount === 0) return 10;
  if (partnerCount === 1) return 14;
  return 18;
}

function cityFill(city: WarMapData["cities"][number]): string {
  if (city.isMine) return "#E4B84D";
  if (city.isRival) return "#F43F5E";
  if (city.isUnclaimed) return "rgba(255,255,255,0.25)";
  return "#38BDF8";
}

function buildTooltip(
  label: string,
  city: WarMapData["cities"][number],
  unclaimedHint: string,
): string {
  if (city.isUnclaimed) return `${label} — ${unclaimedHint}`;
  const top = city.controllers.sort((a, b) => b.deals - a.deals)[0];
  const names = city.controllers
    .slice(0, 3)
    .map((c) => c.name)
    .join(", ");
  const extra = city.partnerCount > 3 ? ` +${city.partnerCount - 3}` : "";
  const leader = top ? ` · ${top.name} (${top.deals})` : "";
  return `${label} · ${city.partnerCount} — ${names}${extra}${leader}`;
}

export function WarMap({ data, locale: _locale, onClaim }: Props) {
  const t = useTranslations("Growth.map");

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#06080f] p-2 sm:p-3">
      <svg
        viewBox="0 0 800 500"
        width="800"
        height="500"
        className="mx-auto h-auto max-w-full"
        role="img"
        aria-label={t("ariaLabel")}
      >
        <defs>
          <radialGradient id="warMapGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill="url(#warMapGlow)" rx="12" />

        {data.networkLines.map((line) => {
          const from = TERRITORY_COORDS[line.from];
          const to = TERRITORY_COORDS[line.to];
          return (
            <line
              key={`${line.from}-${line.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(228,184,77,0.35)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          );
        })}

        {data.cities.map((city) => {
          const r = cityRadius(city.partnerCount);
          const label = t(`cities.${city.key}`);
          const title = buildTooltip(label, city, t("claimHint"));
          const pulse =
            city.isMine || city.isRival
              ? "motion-safe:animate-pulse motion-reduce:animate-none"
              : "";

          return (
            <g
              key={city.key}
              className={city.isUnclaimed && onClaim ? "cursor-pointer" : undefined}
              onClick={() => {
                if (city.isUnclaimed && onClaim) onClaim(city.key);
              }}
              onKeyDown={(e) => {
                if (city.isUnclaimed && onClaim && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onClaim(city.key);
                }
              }}
              role={city.isUnclaimed && onClaim ? "button" : undefined}
              tabIndex={city.isUnclaimed && onClaim ? 0 : undefined}
            >
              {(city.isMine || city.isRival) && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={r + 8}
                  fill="none"
                  stroke={city.isMine ? "#E4B84D" : "#F43F5E"}
                  strokeWidth={2}
                  opacity={0.35}
                  className={pulse}
                />
              )}
              <circle
                cx={city.x}
                cy={city.y}
                r={r}
                fill={cityFill(city)}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
                className={pulse}
              >
                <title>{title}</title>
              </circle>
              <text
                x={city.x}
                y={city.y + r + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.75)"
                fontSize={11}
                fontWeight={600}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
