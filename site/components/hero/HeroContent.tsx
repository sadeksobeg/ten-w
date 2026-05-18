import { HeroRotatingHeadline } from "@/components/hero/HeroRotatingHeadline";
import { MagneticLink } from "@/components/ui/MagneticLink";

type Props = {
  brandLabel: string;
  title: string;
  subtitle: string;
  lead?: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryHref: string;
  ctaSecondaryHref: string;
};

/** Static hero copy — no entrance animation (LCP-friendly). */
export function HeroContent({
  brandLabel,
  title,
  subtitle,
  lead,
  ctaPrimary,
  ctaSecondary,
  ctaPrimaryHref,
  ctaSecondaryHref,
}: Props) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/90 sm:text-sm">
        {brandLabel}
      </p>
      <h1 className="mt-5 font-[family-name:var(--font-cairo)] text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.4rem]">
        {title}
      </h1>
      <HeroRotatingHeadline />
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        {subtitle}
      </p>
      {lead ? (
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted/90 md:text-base">
          {lead}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-4">
        <MagneticLink
          href={ctaPrimaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-bg shadow-[0_0_42px_-12px_rgba(201,160,97,0.7)] transition-shadow hover:shadow-[0_0_56px_-10px_rgba(255,215,0,0.5)]"
        >
          {ctaPrimary}
        </MagneticLink>
        <MagneticLink
          href={ctaSecondaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-gold/45 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-gold backdrop-blur-md transition-colors hover:border-gold hover:bg-gold-dim/35"
        >
          {ctaSecondary}
        </MagneticLink>
      </div>
    </div>
  );
}
