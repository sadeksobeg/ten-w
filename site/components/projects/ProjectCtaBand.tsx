import { TrackedLink } from "@/components/ui/TrackedLink";

type Props = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  slug: string;
  pillar: string;
};

export function ProjectCtaBand({
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  slug,
  pillar,
}: Props) {
  return (
    <section className="border-y border-gold/20 bg-gradient-to-r from-gold-dim/30 via-surface-elevated/50 to-gold-dim/20 py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <TrackedLink
            href="/contact?intent=project"
            eventName="project_cta_contact"
            eventParams={{ slug }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {primaryLabel}
          </TrackedLink>
          <TrackedLink
            href={`/solutions/${pillar}`}
            eventName="project_cta_pillar"
            eventParams={{ slug, pillar }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim/40"
          >
            {secondaryLabel}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
