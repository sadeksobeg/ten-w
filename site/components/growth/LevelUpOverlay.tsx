"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { IconChevronRight, IconStarFilled } from "@/components/growth/icons/GrowthIcons";

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
        <ParticleEffect />
        <IconStarFilled size={48} className="mx-auto text-gold" aria-hidden />
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{t("subtitle")}</p>
        <div className="mt-4 flex justify-center">
          <LevelBadge levelName={levelName} size="xl" />
        </div>
        {previousName ? (
          <p className="mt-3 inline-flex items-center justify-center gap-2 text-xs text-gold">
            <span>{previousName}</span>
            <IconChevronRight size={14} className="text-gold/80" aria-hidden />
            <span>{levelName}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
