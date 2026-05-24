"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { WarMapData } from "@/lib/growth/territory-service";
import {
  SYRIA_MAP_VIEWBOX,
  SYRIA_OUTLINE_PATH,
  TERRITORY_COORDS,
  type TerritoryKey,
} from "@/lib/growth/territories";

type Props = {
  data: WarMapData;
  locale: string;
  onClaim?: (key: TerritoryKey) => void;
};

function nodeRadius(partnerCount: number): number {
  if (partnerCount === 0) return 9;
  if (partnerCount === 1) return 13;
  return 16;
}

function buildTooltip(
  label: string,
  city: WarMapData["cities"][number],
  unclaimedHint: string,
): string {
  if (city.isUnclaimed) return `${label} — ${unclaimedHint}`;
  const top = [...city.controllers].sort((a, b) => b.deals - a.deals)[0];
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
  const [focused, setFocused] = useState<TerritoryKey | null>(data.myTerritory);

  const focusedCity = useMemo(
    () => data.cities.find((c) => c.key === focused) ?? null,
    [data.cities, focused],
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-[#030508] shadow-[0_0_120px_-30px_rgba(228,184,77,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 motion-safe:animate-[pulse_12s_ease-in-out_infinite] motion-reduce:opacity-40 motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(228,184,77,0.12), transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(56,189,248,0.08), transparent)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        aria-hidden
      />

      {focusedCity ? (
        <div className="relative z-10 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gold/80">
            {focusedCity.isMine
              ? t("my_territory")
              : focusedCity.isRival
                ? t("rival_territory")
                : focusedCity.isUnclaimed
                  ? t("unclaimed")
                  : t("controlled_by", {
                      name:
                        [...focusedCity.controllers].sort((a, b) => b.deals - a.deals)[0]?.name ??
                        "—",
                    })}
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
            {t(`territories.${focusedCity.key}`)}
          </p>
          {!focusedCity.isUnclaimed ? (
            <p className="mt-1 text-xs text-white/55">
              {t("partnersHere", { count: focusedCity.partnerCount })}
            </p>
          ) : onClaim ? (
            <button
              type="button"
              onClick={() => onClaim(focusedCity.key)}
              className="mt-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold motion-safe:transition hover:bg-gold/25"
            >
              {t("claim")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="relative w-full overflow-x-auto overscroll-x-contain p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${SYRIA_MAP_VIEWBOX.width} ${SYRIA_MAP_VIEWBOX.height}`}
          className="mx-auto h-auto w-full min-w-[320px] max-w-[720px] touch-pan-x"
          role="img"
          aria-label={t("ariaLabel")}
        >
          <defs>
            <radialGradient id="wmBg" cx="48%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#1a2744" />
              <stop offset="55%" stopColor="#0c1018" />
              <stop offset="100%" stopColor="#030508" />
            </radialGradient>
            <linearGradient id="wmSyriaFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(228,184,77,0.14)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.06)" />
            </linearGradient>
            <linearGradient id="wmSyriaStroke" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E4B84D" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#B07D2B" stopOpacity="0.45" />
            </linearGradient>
            <filter id="wmGlowGold" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="wmGlowRival" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="wmGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect width={SYRIA_MAP_VIEWBOX.width} height={SYRIA_MAP_VIEWBOX.height} fill="url(#wmBg)" />
          <rect width={SYRIA_MAP_VIEWBOX.width} height={SYRIA_MAP_VIEWBOX.height} fill="url(#wmGrid)" />

          <path
            d={SYRIA_OUTLINE_PATH}
            fill="url(#wmSyriaFill)"
            stroke="url(#wmSyriaStroke)"
            strokeWidth={3}
            filter="url(#wmGlowGold)"
          />
          <path
            d={SYRIA_OUTLINE_PATH}
            fill="none"
            stroke="rgba(228,184,77,0.15)"
            strokeWidth={8}
            className="motion-safe:animate-[pulse_10s_ease-in-out_infinite] motion-reduce:animate-none"
          />

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
                stroke="rgba(228,184,77,0.45)"
                strokeWidth={2}
                strokeDasharray="8 6"
                className="war-map-network-line motion-reduce:animate-none"
              />
            );
          })}

          {data.cities.map((city) => {
            const coords = TERRITORY_COORDS[city.key];
            const r = nodeRadius(city.partnerCount);
            const label = t(`territories.${city.key}`);
            const title = buildTooltip(label, city, t("claim"));
            const isFocused = focused === city.key;
            const fill = city.isMine
              ? "#E4B84D"
              : city.isRival
                ? "#FB7185"
                : city.isUnclaimed
                  ? "rgba(255,255,255,0.2)"
                  : "#38BDF8";
            const filter = city.isMine
              ? "url(#wmGlowGold)"
              : city.isRival
                ? "url(#wmGlowRival)"
                : undefined;
            const interactive = city.isUnclaimed && onClaim;

            return (
              <g
                key={city.key}
                className={interactive ? "cursor-pointer" : "cursor-default"}
                onClick={() => setFocused(city.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFocused(city.key);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={title}
              >
                {isFocused ? (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={r + 14}
                    fill="none"
                    stroke={city.isMine ? "#E4B84D" : city.isRival ? "#FB7185" : "#38BDF8"}
                    strokeWidth={1.5}
                    opacity={0.5}
                    className="motion-safe:animate-pulse motion-reduce:animate-none"
                  />
                ) : null}
                {(city.isMine || city.isRival) && !isFocused ? (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={r + 8}
                    fill="none"
                    stroke={city.isMine ? "#E4B84D" : "#FB7185"}
                    strokeWidth={1}
                    opacity={0.3}
                    className="motion-safe:animate-pulse motion-reduce:animate-none"
                  />
                ) : null}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={r}
                  fill={fill}
                  stroke={isFocused ? "#fff" : "rgba(255,255,255,0.4)"}
                  strokeWidth={isFocused ? 2.5 : 1.5}
                  filter={filter}
                >
                  <title>{title}</title>
                </circle>
                {city.partnerCount > 0 ? (
                  <text
                    x={coords.x}
                    y={coords.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={city.isMine ? "#1a1208" : "#fff"}
                    fontSize={city.partnerCount > 9 ? 8 : 9}
                    fontWeight={800}
                    pointerEvents="none"
                  >
                    {city.partnerCount}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
}
