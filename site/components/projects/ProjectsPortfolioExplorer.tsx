"use client";

import { useMemo, useState } from "react";
import { ProjectPortfolioCard } from "./ProjectPortfolioCard";
import type { DeepProject, ProjectFormat } from "@/lib/projects-data";
import type { ProjectIndustryKey } from "@/lib/project-meta";

type FilterLabels = {
  allIndustries: string;
  allFormats: string;
  industry: string;
  format: string;
  showing: string;
  clear: string;
};

type Props = {
  groups: { format: ProjectFormat; items: DeepProject[] }[];
  locale: string;
  cardLabels: {
    challenge: string;
    approach: string;
    outcome: string;
    readCase: string;
  };
  pillarLabels: Record<string, string>;
  industryLabels: Record<ProjectIndustryKey, string>;
  formatLabels: Record<ProjectFormat, string>;
  sectionLabels: Record<ProjectFormat, { title: string; desc: string }>;
  filterLabels: FilterLabels;
  industryBySlug: Record<string, ProjectIndustryKey>;
};

export function ProjectsPortfolioExplorer({
  groups,
  locale,
  cardLabels,
  pillarLabels,
  industryLabels,
  formatLabels,
  sectionLabels,
  filterLabels,
  industryBySlug,
}: Props) {
  const [industry, setIndustry] = useState<ProjectIndustryKey | "all">("all");
  const [format, setFormat] = useState<ProjectFormat | "all">("all");

  const allProjects = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups],
  );

  const visibleCount = useMemo(() => {
    return allProjects.filter((p) => {
      const matchIndustry = industry === "all" || industryBySlug[p.slug] === industry;
      const matchFormat = format === "all" || p.formats.includes(format);
      return matchIndustry && matchFormat;
    }).length;
  }, [allProjects, industry, format, industryBySlug]);

  const industries = useMemo(() => {
    const keys = new Set(allProjects.map((p) => industryBySlug[p.slug]).filter(Boolean));
    return Array.from(keys) as ProjectIndustryKey[];
  }, [allProjects, industryBySlug]);

  function matches(p: DeepProject) {
    const matchIndustry = industry === "all" || industryBySlug[p.slug] === industry;
    const matchFormat = format === "all" || p.formats.includes(format);
    return matchIndustry && matchFormat;
  }

  return (
    <>
      <div className="sticky top-[4.5rem] z-20 -mx-4 border-b border-white/10 bg-background/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold/80">
              {filterLabels.industry}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterChip active={industry === "all"} onClick={() => setIndustry("all")}>
                {filterLabels.allIndustries}
              </FilterChip>
              {industries.map((key) => (
                <FilterChip key={key} active={industry === key} onClick={() => setIndustry(key)}>
                  {industryLabels[key]}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold/80">
              {filterLabels.format}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterChip active={format === "all"} onClick={() => setFormat("all")}>
                {filterLabels.allFormats}
              </FilterChip>
              {(["website", "mobile", "system"] as ProjectFormat[]).map((f) => (
                <FilterChip key={f} active={format === f} onClick={() => setFormat(f)}>
                  {formatLabels[f]}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/45">
          {filterLabels.showing.replace("{count}", String(visibleCount))}
          {industry !== "all" || format !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setIndustry("all");
                setFormat("all");
              }}
              className="ms-2 font-medium text-gold hover:underline"
            >
              {filterLabels.clear}
            </button>
          ) : null}
        </p>
      </div>

      {groups.map(({ format: groupFormat, items }) => {
        const visible = items.filter(matches);
        if (visible.length === 0) return null;
        const section = sectionLabels[groupFormat];
        return (
          <section key={groupFormat} className="border-b border-white/10 py-12 md:py-16">
            <div className="mb-8 max-w-2xl">
              <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{section.desc}</p>
            </div>
            <ul className="grid gap-6 lg:grid-cols-2">
              {visible.map((p) => (
                <li key={p.slug}>
                  <ProjectPortfolioCard
                    project={p}
                    locale={locale}
                    labels={cardLabels}
                    pillarLabel={pillarLabels[p.pillar] ?? p.pillar}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-gold/50 bg-gold/15 text-gold"
          : "border-white/12 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
