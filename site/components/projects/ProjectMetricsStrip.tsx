import { pickLocalized } from "@/lib/locale-content";
import type { DeepProject } from "@/lib/projects-data";

type Props = {
  project: DeepProject;
  locale: string;
};

export function ProjectMetricsStrip({ project, locale }: Props) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {project.metrics.map((m, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-surface-elevated/60 px-4 py-5 text-center backdrop-blur-sm"
        >
          <div
            className={`font-[family-name:var(--font-cairo)] text-3xl font-bold tracking-tight sm:text-4xl ${
              m.direction === "down"
                ? "text-emerald-400"
                : m.direction === "up"
                  ? "text-gold"
                  : "text-foreground"
            }`}
          >
            {m.value}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">
            {pickLocalized(m.label, locale)}
          </p>
        </div>
      ))}
    </div>
  );
}
