import { pickLocalized } from "@/lib/locale-content";
import type { ProjectClientQuote } from "@/lib/projects-data";

type Props = {
  quote: ProjectClientQuote;
  locale: string;
  disclaimer: string;
};

export function ProjectQuoteBlock({ quote, locale, disclaimer }: Props) {
  return (
    <blockquote className="relative my-10 rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-transparent to-transparent p-6 sm:p-8">
      <span
        className="absolute start-6 top-4 font-serif text-5xl leading-none text-gold/30"
        aria-hidden
      >
        "
      </span>
      <p className="relative pt-6 text-lg leading-8 text-foreground sm:text-xl">
        {pickLocalized(quote.quote, locale)}
      </p>
      <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold">
          {quote.initials}
        </span>
        <div>
          <cite className="not-italic font-semibold text-foreground">
            {pickLocalized(quote.role, locale)}
          </cite>
          <p className="text-sm text-muted">{pickLocalized(quote.org, locale)}</p>
        </div>
      </footer>
      <p className="mt-4 text-xs text-white/40">{disclaimer}</p>
    </blockquote>
  );
}
