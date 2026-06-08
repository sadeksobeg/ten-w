"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const FAQ_KEYS = ["who", "badge", "utm", "payout", "support"] as const;

export function StudioFaq() {
  const t = useTranslations("Creators.studio");
  const [openKey, setOpenKey] = useState<string | null>(FAQ_KEYS[0]);

  return (
    <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
          {t("faq.title")}
        </h2>

        <div className="mt-10 space-y-3">
          {FAQ_KEYS.map((key) => {
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/25"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-white transition hover:bg-white/[0.03]"
                  aria-expanded={isOpen}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                >
                  <span>{t(`faq.items.${key}.q`)}</span>
                  <span
                    aria-hidden
                    className={`shrink-0 text-gold transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/65">
                    {t(`faq.items.${key}.a`)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
