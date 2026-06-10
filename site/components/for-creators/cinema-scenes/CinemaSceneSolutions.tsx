"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CinemaSceneSolutions() {
  const t = useTranslations("Creators.public.cinema.scenes.solutions");
  const cards = ["ai", "cyber", "software"] as const;

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4 sm:p-5">
      <p className="text-center font-[family-name:var(--font-cairo)] text-sm font-black text-white">{t("title")}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {cards.map((key) => (
          <Link
            key={key}
            href="/solutions/intelligent-systems"
            className="fc-cinema-solution-card group rounded-xl border border-white/12 bg-black/45 p-3 text-center backdrop-blur-sm transition hover:border-[var(--creator-secondary)]/45 hover:bg-[var(--creator-secondary)]/10"
          >
            <p className="text-[10px] font-bold text-[var(--creator-secondary)] group-hover:text-white">{t(`cards.${key}`)}</p>
            <p className="mt-1 text-[8px] text-white/40">{t("tap")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
