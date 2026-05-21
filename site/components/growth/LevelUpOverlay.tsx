"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";

type Props = {
  levelName: string;
  previousName?: string;
  onDone: () => void;
};

export function LevelUpOverlay({ levelName, previousName, onDone }: Props) {
  const t = useTranslations("Growth.celebration.levelUp");
  const [show, setShow] = useState(true);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 800 : 2000;
    const id = window.setTimeout(() => {
      setShow(false);
      onDone();
    }, ms);
    return () => window.clearTimeout(id);
  }, [onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="growth-page-enter relative max-w-md rounded-2xl border border-gold/40 bg-[var(--growth-surface-2)] p-8 text-center">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute size-2 rounded-full bg-gold/60"
            style={{
              left: `${10 + (i * 17) % 80}%`,
              top: `${5 + (i * 23) % 70}%`,
              animation: `growthBadgeEarn ${1 + (i % 5) * 0.2}s ease-out infinite`,
            }}
            aria-hidden
          />
        ))}
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{t("subtitle")}</p>
        <div className="mt-4 flex justify-center">
          <LevelBadge levelName={levelName} size="xl" />
        </div>
        {previousName ? (
          <p className="mt-3 text-xs text-gold">
            {previousName} → {levelName}
          </p>
        ) : null}
      </div>
    </div>
  );
}
