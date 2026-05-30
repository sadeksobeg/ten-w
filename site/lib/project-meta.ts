/** Portfolio metadata for filters, featured layout, and visual accents. */

export type ProjectIndustryKey =
  | "government"
  | "fintech"
  | "healthcare"
  | "logistics"
  | "agriculture"
  | "manufacturing"
  | "telecom"
  | "energy"
  | "holding"
  | "education"
  | "retail"
  | "cyber";

export type ProjectAccent =
  | "gold"
  | "emerald"
  | "violet"
  | "cyan"
  | "rose"
  | "amber";

export type ProjectMeta = {
  industryKey: ProjectIndustryKey;
  featured: boolean;
  accent: ProjectAccent;
};

export const projectMetaBySlug: Record<string, ProjectMeta> = {
  "identity-access-modernization": { industryKey: "government", featured: true, accent: "violet" },
  "secure-delivery-pipeline": { industryKey: "fintech", featured: true, accent: "cyan" },
  "data-platform-governance": { industryKey: "healthcare", featured: false, accent: "emerald" },
  "customer-ops-triage": { industryKey: "telecom", featured: false, accent: "gold" },
  "corporate-web-ecosystem": { industryKey: "holding", featured: false, accent: "amber" },
  "field-mobile-platform": { industryKey: "energy", featured: true, accent: "rose" },
  "ai-operations-platform": { industryKey: "logistics", featured: false, accent: "gold" },
  "smart-field-hama": { industryKey: "agriculture", featured: false, accent: "emerald" },
  "security-analytics-hub": { industryKey: "fintech", featured: false, accent: "violet" },
  "predictive-maintenance": { industryKey: "manufacturing", featured: false, accent: "cyan" },
  "industrial-soc": { industryKey: "manufacturing", featured: false, accent: "amber" },
  "genai-knowledge-assistant": { industryKey: "fintech", featured: true, accent: "violet" },
  "realtime-payment-platform": { industryKey: "fintech", featured: false, accent: "cyan" },
  "edtech-learning-platform": { industryKey: "education", featured: false, accent: "rose" },
  "b2b-marketplace-platform": { industryKey: "retail", featured: false, accent: "gold" },
  "smart-city-citizen-platform": { industryKey: "government", featured: false, accent: "emerald" },
  "telemedicine-care-platform": { industryKey: "healthcare", featured: false, accent: "cyan" },
};

export const accentGradients: Record<ProjectAccent, string> = {
  gold: "from-gold/25 via-gold-dim/10 to-transparent",
  emerald: "from-emerald-500/20 via-emerald-900/10 to-transparent",
  violet: "from-violet-500/20 via-violet-900/10 to-transparent",
  cyan: "from-cyan-500/20 via-cyan-900/10 to-transparent",
  rose: "from-rose-500/20 via-rose-900/10 to-transparent",
  amber: "from-amber-500/20 via-amber-900/10 to-transparent",
};

export const accentCardHeader: Record<ProjectAccent, string> = {
  gold: "from-gold-dim/30 via-gold/8 to-transparent",
  emerald: "from-emerald-500/25 via-emerald-900/8 to-transparent",
  violet: "from-violet-500/25 via-violet-900/8 to-transparent",
  cyan: "from-cyan-500/25 via-cyan-900/8 to-transparent",
  rose: "from-rose-500/25 via-rose-900/8 to-transparent",
  amber: "from-amber-500/25 via-amber-900/8 to-transparent",
};

export const accentRing: Record<ProjectAccent, string> = {
  gold: "ring-gold/20",
  emerald: "ring-emerald-500/20",
  violet: "ring-violet-500/20",
  cyan: "ring-cyan-500/20",
  rose: "ring-rose-500/20",
  amber: "ring-amber-500/20",
};

export function getProjectMeta(slug: string): ProjectMeta {
  return (
    projectMetaBySlug[slug] ?? {
      industryKey: "government" as ProjectIndustryKey,
      featured: false,
      accent: "gold" as ProjectAccent,
    }
  );
}
