"use client";

import { useTranslations } from "next-intl";

export function HubPreviewKit() {
  const t = useTranslations("Creators.public.bento.hubPreview");

  return (
    <div className="flex h-full flex-col justify-between p-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/80">{t("kit")}</p>
        <p className="mt-1 text-xs text-white/55">{t("kitBody")}</p>
      </div>
      <div className="rounded-lg border border-dashed border-[var(--creator-secondary)]/35 bg-[var(--creator-secondary)]/5 p-2">
        <p className="font-mono text-[10px] text-[var(--creator-secondary)]">tenegta.com/r/CREATOR42</p>
        <p className="mt-1 text-[8px] text-white/40">{t("clicks")}: 1,284 · {t("conv")}: 8.2%</p>
      </div>
    </div>
  );
}
