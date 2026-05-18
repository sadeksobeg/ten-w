"use client";

import { testimonials } from "@/data/credibility";
import { pickLocalized } from "@/lib/locale-content";
import { useLocale, useTranslations } from "next-intl";

export function TestimonialStrip() {
  const locale = useLocale();
  const t = useTranslations("HomePage.credibility");
  const primary = testimonials[0];
  if (!primary) return null;

  return (
    <section className="border-b border-white/10 py-12 md:py-14" aria-labelledby="testimonial-heading">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p
          id="testimonial-heading"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
        >
          {t("testimonialEyebrow")}
        </p>
        <blockquote className="mt-4 text-lg font-medium leading-relaxed text-foreground md:text-xl">
          &ldquo;{pickLocalized(primary.quote, locale)}&rdquo;
        </blockquote>
        <footer className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <span
            className="flex size-10 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold"
            aria-hidden
          >
            {primary.initials}
          </span>
          <div className="text-sm text-muted">
            <cite className="not-italic font-semibold text-foreground">
              {pickLocalized(primary.role, locale)}
            </cite>
            <span className="text-muted"> · </span>
            {pickLocalized(primary.org, locale)}
          </div>
        </footer>
        <p className="mt-6 text-xs leading-relaxed text-muted">{t("testimonialDisclaimer")}</p>
      </div>
    </section>
  );
}
