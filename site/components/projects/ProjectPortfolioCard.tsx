import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { pickLocalized } from "@/lib/locale-content";
import { accentCardHeader, getProjectMeta } from "@/lib/project-meta";
import type { DeepProject } from "@/lib/projects-data";
import { formatLabels } from "@/lib/projects-data";
import { getOutcomeHeadline, previewLines } from "./project-helpers";

type Props = {
  project: DeepProject;
  locale: string;
  labels: {
    challenge: string;
    approach: string;
    outcome: string;
    readCase: string;
  };
  pillarLabel: string;
};

export function ProjectPortfolioCard({ project, locale, labels, pillarLabel }: Props) {
  const meta = getProjectMeta(project.slug);
  const headline = getOutcomeHeadline(project, locale);
  const primary = project.metrics[0];

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-white/12 transition-colors hover:border-gold/45">
      <div
        className={`border-b border-white/10 bg-gradient-to-br ${accentCardHeader[meta.accent]} px-5 py-4 sm:px-6`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gold/90">
            {pickLocalized(project.industry, locale)}
          </span>
          <span className="text-white/25">·</span>
          <span className="text-white/50">{pillarLabel}</span>
        </div>
        {primary ? (
          <p className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold sm:text-3xl">
            {primary.value}
            <span className="ms-2 text-sm font-medium text-muted">
              {pickLocalized(primary.label, locale)}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-1.5">
          {project.formats.map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/60"
            >
              {pickLocalized(formatLabels[f], locale)}
            </span>
          ))}
        </div>

        <h2 className="mt-3 font-[family-name:var(--font-cairo)] text-xl font-semibold leading-snug text-foreground group-hover:text-gold sm:text-2xl">
          {pickLocalized(project.title, locale)}
        </h2>
        <p className="mt-1 text-xs text-white/40">{headline}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">
          {pickLocalized(project.excerpt, locale)}
        </p>

        <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-gold/70">
              {labels.challenge}
            </dt>
            <dd className="mt-1 line-clamp-2 text-muted">
              {previewLines(pickLocalized(project.challenge, locale))}
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-gold/70">
              {labels.approach}
            </dt>
            <dd className="mt-1 line-clamp-2 text-muted">
              {previewLines(pickLocalized(project.solution, locale))}
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-gold/70">
              {labels.outcome}
            </dt>
            <dd className="mt-1 line-clamp-2 text-muted">
              {previewLines(pickLocalized(project.results, locale))}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs text-white/40">
            {pickLocalized(project.timeline, locale)}
          </span>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-gold transition-colors hover:text-gold-bright"
          >
            {labels.readCase}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
              →
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
