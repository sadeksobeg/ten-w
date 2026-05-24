"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import type { DnaArchetype, DnaDimensions } from "@/lib/growth/dna-score";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { IconBadge, IconDeals, IconXp } from "@/components/growth/icons/GrowthIcons";

type Props = {
  name: string;
  email: string;
  levelCode: string;
  levelName: string;
  locale?: string;
  cardNumber: number;
  totalXp: number;
  closedDeals: number;
  badgeCount: number;
  showcasedBadges: string[];
  dnaDimensions: DnaDimensions;
  archetype: DnaArchetype;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  displayTitle?: string | null;
};

const DIM_COLORS: Record<keyof DnaDimensions, string> = {
  sales: "#E4B84D",
  network: "#38BDF8",
  content: "#A78BFA",
  speed: "#34D399",
};

const DIM_KEYS: (keyof DnaDimensions)[] = ["sales", "network", "content", "speed"];

export function PartnerCard({
  name,
  email,
  levelCode,
  levelName,
  locale = "en",
  cardNumber,
  totalXp,
  closedDeals,
  badgeCount,
  showcasedBadges,
  dnaDimensions,
  archetype,
  avatarUrl,
  avatarPreset,
  displayTitle,
}: Props) {
  const t = useTranslations("Growth.partnerCard");
  const tDna = useTranslations("Growth.dna");
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ ry: x * 10, rx: -y * 10 });
  }, []);

  const handleLeave = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  const formattedNumber = String(cardNumber).padStart(6, "0");

  return (
    <div className="inline-block" style={{ perspective: "900px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative overflow-hidden rounded-2xl border border-gold/40 shadow-[0_12px_40px_rgba(0,0,0,0.55)] motion-reduce:transform-none"
        style={{
          width: 300,
          height: 420,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.15s ease-out",
          background:
            "linear-gradient(145deg, #1a1208 0%, #0a0a0f 40%, #12121a 70%, #2a1f0a 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30 motion-safe:animate-[pulse_6s_ease-in-out_infinite] motion-reduce:animate-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(228,184,77,0.12) 50%, transparent 65%)",
            backgroundSize: "200% 100%",
            animation: "growthShimmer 3s linear infinite",
          }}
        />
        <div className="relative flex h-full flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[9px] font-bold tracking-[0.2em] text-gold/70">T.E.N.E.G.T.A</span>
            <span className="font-mono text-[10px] tabular-nums text-white/40">
              #{formattedNumber}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <GrowthAvatar
              name={name}
              email={email}
              avatarUrl={avatarUrl}
              avatarPreset={avatarPreset}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
                {name}
              </p>
              {displayTitle ? (
                <p className="truncate text-[11px] text-white/55">{displayTitle}</p>
              ) : null}
              <div className="mt-1">
                <LevelBadge levelName={levelName} levelCode={levelCode} locale={locale} size="sm" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-white/70">
              <IconXp size={14} className="text-gold" />
              <span className="font-bold tabular-nums">{totalXp}</span>
            </span>
            <span className="flex items-center gap-1 text-white/70">
              <IconDeals size={14} />
              <span className="font-bold tabular-nums">{closedDeals}</span>
            </span>
            <span className="flex items-center gap-1 text-white/70">
              <IconBadge size={14} />
              <span className="font-bold tabular-nums">{badgeCount}</span>
            </span>
          </div>

          {showcasedBadges.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {showcasedBadges.slice(0, 3).map((key) => (
                <BadgeIcon key={key} badgeKey={key} earned size="xs" />
              ))}
            </div>
          ) : null}

          <hr className="my-3 border-white/10" />

          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {tDna("title")}
          </p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/[0.08]">
            {DIM_KEYS.map((key) => (
              <div
                key={key}
                className="h-full min-w-[2px]"
                style={{
                  flex: Math.max(1, dnaDimensions[key]),
                  background: DIM_COLORS[key],
                }}
                title={tDna(key)}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] font-bold text-gold">
            «{tDna(`archetypes.${archetype}`)}»
          </p>

          <p className="mt-auto text-center text-[9px] tracking-widest text-white/30">
            {t("certified")}
          </p>
        </div>
      </div>
    </div>
  );
}
