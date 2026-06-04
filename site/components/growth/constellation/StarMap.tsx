"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ConstellationStar } from "@/lib/growth/constellation";

type Props = {
  stars: ConstellationStar[];
  locale: string;
};

function starField(seed: number) {
  const dots: { x: number; y: number; o: number }[] = [];
  for (let i = 0; i < 50; i++) {
    const h = ((seed + i) * 9301 + 49297) % 233280;
    dots.push({
      x: (h % 1000) / 10,
      y: ((h * 7) % 1000) / 10,
      o: 0.15 + (h % 40) / 100,
    });
  }
  return dots;
}

export function StarMap({ stars, locale }: Props) {
  const t = useTranslations("Growth.constellation");
  const [scale, setScale] = useState(1);
  const [tip, setTip] = useState<ConstellationStar | null>(null);
  const dots = useMemo(() => starField(stars.length), [stars.length]);

  const realStars = stars.filter((s) => s.name);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#000008]">
      <div
        className="origin-center transition-transform motion-reduce:transition-none"
        style={{ transform: `scale(${scale})` }}
      >
        <svg viewBox="0 0 100 100" className="h-[min(70vh,520px)] w-full touch-pan-x">
          <defs>
            <radialGradient id="milky" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(200,220,255,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse cx="50" cy="50" rx="45" ry="30" fill="url(#milky)" />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={0.15} fill="white" opacity={d.o} />
          ))}
          {realStars.flatMap((a) =>
            a.connections
              .map((cid) => realStars.find((b) => b.partnerId === cid))
              .filter(Boolean)
              .map((b) => (
                <line
                  key={`${a.partnerId}-${b!.partnerId}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b!.x}
                  y2={b!.y}
                  stroke="rgba(176,125,43,0.25)"
                  strokeWidth={0.3}
                  strokeDasharray="1 2"
                  className="motion-safe:animate-[dash_12s_linear_infinite] motion-reduce:animate-none"
                />
              )),
          )}
          {realStars.map((star) => (
            <g
              key={star.partnerId}
              className="cursor-pointer"
              onClick={() => setTip(star)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setTip(star)}
            >
              <circle
                cx={star.x}
                cy={star.y}
                r={star.radius * 1.8}
                fill={star.color}
                opacity={0.08}
                className={star.isMe ? "growth-badge-pulse" : ""}
              />
              <circle
                cx={star.x}
                cy={star.y}
                r={star.radius}
                fill={star.color}
                opacity={0.9}
                filter="url(#starGlow)"
                className={star.isRival ? "star-twinkle" : star.isMe ? "" : "star-twinkle"}
                style={{ animationDelay: `${(star.x % 3) * 0.4}s` }}
              />
              {star.name ? (
                <text
                  x={star.x}
                  y={star.y + star.radius + 3}
                  textAnchor="middle"
                  fontSize={2}
                  fill="rgba(255,255,255,0.55)"
                >
                  {star.name.length > 12 ? `${star.name.slice(0, 10)}…` : star.name}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute bottom-3 start-3 end-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/50">
        <span>{t("legendMe")}</span>
        <span>{t("legendRival")}</span>
        <span>{t("legendNetwork")}</span>
        <input
          type="range"
          min={0.8}
          max={1.6}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-24"
          aria-label={t("zoom")}
        />
      </div>
      {tip ? (
        <div className="absolute top-3 end-3 rounded-xl border border-gold/30 bg-black/80 p-3 text-xs">
          <p className="font-bold text-white">{tip.name}</p>
          <p className="text-white/60">
            {tip.levelCode} · {tip.closedDeals} {t("dealsShort")}
          </p>
          {tip.slug ? (
            <Link href={`/growth/profile/${tip.slug}`} className="mt-2 inline-block text-gold hover:underline">
              {t("viewProfile")}
            </Link>
          ) : null}
          <button type="button" className="ms-2 text-white/40" onClick={() => setTip(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
