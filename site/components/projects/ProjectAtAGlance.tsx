import { pickLocalized } from "@/lib/locale-content";
import type { DeepProject } from "@/lib/projects-data";
import { formatLabels } from "@/lib/projects-data";
import { getPillarService, getProjectServices } from "./project-helpers";

type Props = {
  project: DeepProject;
  locale: string;
  labels: {
    title: string;
    industry: string;
    client: string;
    timeline: string;
    scope: string;
    services: string;
    delivery: string;
    technologies: string;
  };
};

export function ProjectAtAGlance({ project, locale, labels }: Props) {
  const services = getProjectServices(project, locale);
  const pillar = getPillarService(project, locale);

  return (
    <aside className="rounded-2xl border border-white/12 bg-surface-elevated/40 p-5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gold">
        {labels.title}
      </h2>
      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.industry}
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {pickLocalized(project.industry, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.client}
          </dt>
          <dd className="mt-1 text-muted">{pickLocalized(project.clientContext, locale)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.timeline}
          </dt>
          <dd className="mt-1 text-muted">{pickLocalized(project.timeline, locale)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.scope}
          </dt>
          <dd className="mt-1 text-muted">{pickLocalized(project.scope, locale)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.services}
          </dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {[pillar, ...services].map((s) => (
              <span
                key={s}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-white/75"
              >
                {s}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.delivery}
          </dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {project.formats.map((f) => (
              <span
                key={f}
                className="rounded-md border border-gold/25 bg-gold-dim/20 px-2 py-0.5 text-xs font-medium text-gold"
              >
                {pickLocalized(formatLabels[f], locale)}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">
            {labels.technologies}
          </dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 8).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-muted"
              >
                {tech}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
