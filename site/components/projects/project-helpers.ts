import type { Locale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/locale-content";
import type { DeepProject, ProjectFormat, ProjectMetric } from "@/lib/projects-data";

export function getPrimaryMetric(project: DeepProject): ProjectMetric | undefined {
  return project.metrics[0];
}

export function getOutcomeHeadline(project: DeepProject, locale: string): string {
  const m = project.metrics[0];
  if (!m) return pickLocalized(project.excerpt, locale);
  return `${m.value} · ${pickLocalized(m.label, locale)}`;
}

const serviceByFormat: Record<ProjectFormat, { ar: string; en: string; fr: string }> = {
  system: {
    ar: "هندسة أنظمة",
    en: "Systems engineering",
    fr: "Ingénierie systèmes",
  },
  website: {
    ar: "تطوير مواقع ويب",
    en: "Web development",
    fr: "Développement web",
  },
  mobile: {
    ar: "تطبيقات موبايل",
    en: "Mobile applications",
    fr: "Applications mobile",
  },
};

export function getProjectServices(project: DeepProject, locale: string): string[] {
  return project.formats.map((f) => pickLocalized(serviceByFormat[f], locale));
}

const pillarService: Record<
  DeepProject["pillar"],
  { ar: string; en: string; fr: string }
> = {
  ai: { ar: "ذكاء اصطناعي", en: "AI & data", fr: "IA & data" },
  cyber: { ar: "أمن سيبراني", en: "Cybersecurity", fr: "Cybersécurité" },
  software: { ar: "منتجات رقمية", en: "Digital products", fr: "Produits digitaux" },
  infra: { ar: "بنية وDevOps", en: "Platform & DevOps", fr: "Plateforme & DevOps" },
};

export function getPillarService(project: DeepProject, locale: string): string {
  return pickLocalized(pillarService[project.pillar], locale);
}

export function groupProjectsByFormat(
  projects: DeepProject[],
): { format: ProjectFormat; items: DeepProject[] }[] {
  const order: ProjectFormat[] = ["website", "mobile", "system"];
  return order.map((format) => ({
    format,
    items: projects.filter((p) => p.formats.includes(format)),
  }));
}

export function previewLines(text: string, max = 120): string {
  const line = text.split("\n")[0]?.replace(/^•\s*/, "").trim() ?? text;
  if (line.length <= max) return line;
  return `${line.slice(0, max).trim()}…`;
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
