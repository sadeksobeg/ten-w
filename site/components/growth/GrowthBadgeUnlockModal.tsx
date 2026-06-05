"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { getBadgeDef, RARITY_LABEL_KEYS } from "@/lib/growth/badge-visual";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";

type Props = {
  badgeKey: string;
  badgeName?: string;
  onDismiss: () => void;
};

export function GrowthBadgeUnlockModal({ badgeKey, badgeName, onDismiss }: Props) {
  const t = useTranslations("Growth.badges");
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);
  const def = getBadgeDef(badgeKey);
  const displayName = badgeName ?? badgeKey;

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="badge-unlock-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg sm:p-6"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 24 }}
        animate={show && !reduceMotion ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="badge-earn-reveal relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/35 p-8 text-center shadow-[0_0_100px_-20px_rgba(228,184,77,0.55)] sm:p-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${def.glowColor}22, transparent 55%), linear-gradient(165deg, #14141f 0%, #0a0a0f 100%)`,
        }}
      >
        <div className="badge-earn-reveal-rays" aria-hidden />
        <ParticleEffect />
        <div className="badge-earn-reveal-pedestal" aria-hidden />

        <motion.div
          initial={reduceMotion ? false : { scale: 0.6, rotateY: -18 }}
          animate={show && !reduceMotion ? { scale: 1, rotateY: 0 } : undefined}
          transition={{ delay: 0.12, duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative mx-auto flex justify-center"
        >
          <BadgeIcon badgeKey={badgeKey} earned size="hero" showGlow animate />
        </motion.div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/90">
          {t("unlockTitle")}
        </p>
        <p
          id="badge-unlock-title"
          className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white sm:text-3xl"
        >
          {displayName}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/45">
          {t(RARITY_LABEL_KEYS[def.rarity])}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{t("unlockSubtitle", { key: badgeKey })}</p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <GoldButton type="button" className="w-full sm:min-w-[160px]" onClick={onDismiss}>
            {t("unlockCta")}
          </GoldButton>
          <Link
            href="/growth/vault"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white/70 transition hover:border-gold/30 hover:text-white sm:min-w-[160px]"
            onClick={onDismiss}
          >
            {t("unlockVaultCta")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
