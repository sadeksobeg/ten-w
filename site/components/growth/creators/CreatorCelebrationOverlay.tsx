"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GoldButton } from "@/components/growth/ui/GoldButton";

export type CelebrationPayload =
  | { type: "badge"; badgeName: string }
  | { type: "rank"; oldRank: number; newRank: number }
  | { type: "battle"; rivalName: string };

type Props = {
  payload: CelebrationPayload | null;
  onDismiss: () => void;
};

export function CreatorCelebrationOverlay({ payload, onDismiss }: Props) {
  const t = useTranslations("Creators.hub.celebration");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!payload) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const id = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 3000);
    return () => clearTimeout(id);
  }, [payload, onDismiss]);

  if (!visible || !payload) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="creator-card max-w-sm p-8 text-center shadow-2xl">
        {payload.type === "badge" ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--creator-secondary)]">{t("badgeTitle")}</p>
            <p className="mt-3 font-[family-name:var(--font-cairo)] text-xl font-black text-white">{payload.badgeName}</p>
          </>
        ) : null}
        {payload.type === "rank" ? (
          <>
            <p className="text-xs font-bold text-[var(--creator-secondary)]">{t("rankTitle")}</p>
            <p className="mt-3 text-2xl font-black text-white">
              #{payload.oldRank} → #{payload.newRank}
            </p>
          </>
        ) : null}
        {payload.type === "battle" ? (
          <>
            <p className="text-xs font-bold text-rose-200">{t("battleTitle")}</p>
            <p className="mt-3 text-lg font-bold text-white">{payload.rivalName}</p>
          </>
        ) : null}
        <GoldButton type="button" className="mt-6 text-xs" onClick={onDismiss}>
          {t("continue")}
        </GoldButton>
      </div>
    </div>
  );
}
