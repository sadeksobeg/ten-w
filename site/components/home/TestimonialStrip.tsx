"use client";

import { testimonials } from "@/data/credibility";
import { pickLocalized } from "@/lib/locale-content";
import { useLocale } from "next-intl";

export function TestimonialStrip() {
  const locale = useLocale();
  const primary = testimonials[0];
  if (!primary) return null;

  return (
    <section className="border-b border-white/10 py-12 md:py-14">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <blockquote className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
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
            <span className="text-white/40"> · </span>
            {pickLocalized(primary.org, locale)}
          </div>
        </footer>
      </div>
    </section>
  );
}
