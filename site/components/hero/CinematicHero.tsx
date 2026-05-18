import { CinematicHeroShell } from "@/components/hero/CinematicHeroShell";
import { HeroContent } from "@/components/hero/HeroContent";

export type CinematicHeroProps = {
  brandLabel: string;
  title: string;
  subtitle: string;
  lead?: string;
  rotateFallback: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryHref: string;
  ctaSecondaryHref: string;
};

export function CinematicHero(props: CinematicHeroProps) {
  return (
    <CinematicHeroShell>
      <HeroContent {...props} />
    </CinematicHeroShell>
  );
}
