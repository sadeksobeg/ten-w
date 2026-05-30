import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/locale-content";
import { accentCardHeader, getProjectMeta } from "@/lib/project-meta";
import type { DeepProject } from "@/lib/projects-data";
import { getOutcomeHeadline } from "./project-helpers";

type Props = {
  projects: DeepProject[];
  locale: string;
  labels: {
    kicker: string;
    title: string;
    subtitle: string;
    readCase: string;
    featured: string;
  };
};

export function ProjectsFeaturedBento({ projects, locale, labels }: Props) {
  if (projects.length === 0) return null;

  const [lead, ...rest] = projects;

  return (
    <section className="border-b border-white/10 py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">{labels.kicker}</p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-bold sm:text-2xl">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{labels.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <FeaturedTile project={lead} locale={locale} labels={labels} className="lg:col-span-7" large />
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {rest.slice(0, 3).map((p) => (
            <FeaturedTile key={p.slug} project={p} locale={locale} labels={labels} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedTile({
  project,
  locale,
  labels,
  className = "",
  large = false,
}: {
  project: DeepProject;
  locale: string;
  labels: Props["labels"];
  className?: string;
  large?: boolean;
}) {
  const meta = getProjectMeta(project.slug);
  const primary = project.metrics[0];
  const headline = getOutcomeHeadline(project, locale);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.02] transition-all hover:border-gold/40 hover:bg-white/[0.04] ${className}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentCardHeader[meta.accent]} opacity-80`}
        aria-hidden
      />
      <div className={`relative flex h-full flex-col ${large ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
        <span className="inline-flex w-fit rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
          {labels.featured}
        </span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/50">
          {pickLocalized(project.industry, locale)}
        </p>
        <h3
          className={`mt-2 font-[family-name:var(--font-cairo)] font-bold leading-snug text-foreground group-hover:text-gold ${
            large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
        >
          {pickLocalized(project.title, locale)}
        </h3>
        {primary ? (
          <p className={`mt-3 font-[family-name:var(--font-cairo)] font-bold text-gold ${large ? "text-3xl" : "text-2xl"}`}>
            {primary.value}
            <span className="ms-2 text-sm font-medium text-muted">
              {pickLocalized(primary.label, locale)}
            </span>
          </p>
        ) : null}
        <p className={`mt-2 text-muted ${large ? "line-clamp-3 text-base leading-7" : "line-clamp-2 text-sm"}`}>
          {pickLocalized(project.excerpt, locale)}
        </p>
        <p className="mt-1 text-xs text-white/40">{headline}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-gold">
          {labels.readCase}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
