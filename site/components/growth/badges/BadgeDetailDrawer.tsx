"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import type { BadgeProgress } from "@/lib/growth/badge-progress";

type Props = {
  badgeKey: string;
  name: string;
  description?: string;
  howTo?: string;
  earned: boolean;
  progress: BadgeProgress | null;
  onClose: () => void;
};

export function BadgeDetailDrawer({
  badgeKey,
  name,
  description,
  howTo,
  earned,
  progress,
  onClose,
}: Props) {
  const t = useTranslations("Growth.badges");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const pct =
    progress && progress.target > 0
      ? Math.min(100, Math.round((progress.current / progress.target) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 lg:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("close")} onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#12121a] p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <BadgeIcon badgeKey={badgeKey} earned={earned} size="lg" lockedLabel={t("locked")} />
          <h3 className="mt-4 text-lg font-bold text-white">{name}</h3>
          {description ? <p className="mt-2 text-sm text-white/65">{description}</p> : null}
          {howTo ? (
            <p className="mt-3 text-xs text-gold/90">
              {t("howTo")}: {howTo}
            </p>
          ) : null}
          {!earned && progress ? (
            <div className="mt-4 w-full">
              <p className="text-xs text-white/55">
                {t(`progress.${progress.labelKey}`, {
                  current: progress.current,
                  target: progress.target,
                })}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ) : earned ? (
            <p className="mt-3 text-xs font-semibold text-emerald-400">{t("earned")}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/80"
          onClick={() => {
            setOpen(false);
            onClose();
          }}
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
