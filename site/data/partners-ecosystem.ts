import type { Localized } from "@/lib/fallback-data";

export type EcosystemPartner = {
  id: string;
  name: string;
  category: Localized;
};

/** Technologies and clouds we design for — compatibility, not reseller claims. */
export const ecosystemPartners: EcosystemPartner[] = [
  { id: "aws", name: "Amazon Web Services", category: { ar: "سحابة", en: "Cloud", fr: "Cloud" } },
  { id: "azure", name: "Microsoft Azure", category: { ar: "سحابة", en: "Cloud", fr: "Cloud" } },
  { id: "gcp", name: "Google Cloud", category: { ar: "سحابة", en: "Cloud", fr: "Cloud" } },
  { id: "openai", name: "OpenAI API", category: { ar: "نماذج لغوية", en: "LLM APIs", fr: "API LLM" } },
  { id: "postgres", name: "PostgreSQL", category: { ar: "بيانات", en: "Data", fr: "Données" } },
  { id: "k8s", name: "Kubernetes", category: { ar: "تشغيل", en: "Runtime", fr: "Runtime" } },
  { id: "next", name: "Next.js", category: { ar: "واجهات", en: "Web", fr: "Web" } },
  { id: "pytorch", name: "PyTorch", category: { ar: "ذكاء اصطناعي", en: "AI/ML", fr: "IA/ML" } },
  { id: "cloudflare", name: "Cloudflare", category: { ar: "حافة وأمن", en: "Edge & security", fr: "Edge & sécurité" } },
  { id: "sentry", name: "Sentry", category: { ar: "مراقبة", en: "Observability", fr: "Observabilité" } },
];
