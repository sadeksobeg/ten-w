"use client";

import { useTranslations } from "next-intl";

export function CinemaSceneFilm() {
  const t = useTranslations("Creators.public.cinema.scenes.film");

  const items = ["shot1", "shot2", "shot3"] as const;

  return (
    <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.28em] text-rose-300/90">{t("tag")}</p>
        <p className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-black text-white sm:text-xl">{t("title")}</p>
        <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
      </div>
      <ul className="space-y-2">
        {items.map((key, i) => (
          <li
            key={key}
            className="fc-cinema-check-item flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--creator-primary)]/20 text-[10px] font-black text-rose-200">
              {i + 1}
            </span>
            <span className="text-xs font-semibold text-white/85">{t(`checklist.${key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
