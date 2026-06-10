"use client";

import { useTranslations } from "next-intl";
import { HubPreviewKit } from "../hub-preview/HubPreviewKit";

export function CinemaSceneEarn() {
  const t = useTranslations("Creators.public.cinema.scenes.earn");

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-t from-[#0a0612] to-[#150a20]">
      <div className="flex flex-1 flex-col justify-end p-4">
        <div className="mb-3 flex items-end gap-1">
          {[35, 58, 42, 72, 48, 88, 64].map((h, i) => (
            <div
              key={i}
              className="fc-service-bar flex-1 rounded-t-md bg-gradient-to-t from-emerald-600/70 via-emerald-500/40 to-amber-400/50"
              style={{ height: `${h}%`, maxHeight: "4.5rem", animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
        <p className="font-[family-name:var(--font-cairo)] text-lg font-black text-[var(--creator-secondary)]">{t("headline")}</p>
        <p className="text-[10px] text-white/45">{t("sub")}</p>
      </div>
      <div className="h-[42%] border-t border-white/10 bg-black/40">
        <HubPreviewKit />
      </div>
    </div>
  );
}
