"use client";

import { industryArchetypes } from "@/data/credibility";
import { pickLocalized } from "@/lib/locale-content";
import { useLocale, useTranslations } from "next-intl";

export function LogoMarquee() {
  const locale = useLocale();
  const t = useTranslations("HomePage.credibility");
  const items = [...industryArchetypes, ...industryArchetypes];

  return (
    <section className="border-b border-white/10 py-8 md:py-10" aria-label={t("logosAria")}>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
        {t("trustedBy")}
      </p>
      <div className="relative overflow-hidden mask-linear-fade">
        <div className="flex w-max animate-marquee gap-6 px-4 motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {items.map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-[10px] font-bold tracking-wide text-gold"
              >
                {item.icon}
              </span>
              <span className="font-medium text-white/80">
                {pickLocalized(item.label, locale)}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/50">{pickLocalized(item.sector, locale)}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
