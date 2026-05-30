export type Localized = { ar: string; en: string; fr?: string };

export type ProjectCard = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  challenge: Localized;
  solution: Localized;
  results: Localized;
  metrics?: Localized;
};

export type BlogPostCard = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  date: string;
  body?: Localized;
};

export type CaseStudyCard = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  problem: Localized;
  approach: Localized;
  architecture: Localized;
  results: Localized;
};

export type TeamMember = {
  name: Localized;
  role: Localized;
  highlight: Localized;
  /** Public path under `/images/team/…` when you add a caricature file */
  portraitSrc?: string;
  portraitAlt: Localized;
};

export type JobOpening = {
  id: string;
  title: Localized;
  location: Localized;
  type: Localized;
};

export { fallbackProjects } from "@/lib/projects-data";

export const fallbackPosts: BlogPostCard[] = [
  {
    slug: "smart-farming-sustainability",
    title: {
      ar: "الزراعة الذكية والاستدامة",
      en: "Smart farming and sustainability",
    },
    excerpt: {
      ar: "كيف تدعم البيانات قرارات أكثر استدامة في المزرعة.",
      en: "How data supports more sustainable farm decisions.",
    },
    date: "2026-03-01",
    body: {
      ar: "تساعد منصات الاستشعار والتنبؤ على تحسين توقيت الري والتغذية، ما يقلل الهدر ويزيد جودة المحصول. تبدأ الرحلة بتوحيد مصادر البيانات ثم بناء مؤشرات أداء واضحة للمزارع والإدارة.",
      en: "Sensing and forecasting platforms improve irrigation and nutrition timing, cutting waste and improving crop quality. Start by unifying data sources, then define clear KPIs for field and management teams.",
    },
  },
  {
    slug: "cyber-hygiene-enterprises",
    title: {
      ar: "النظافة السيبرانية للمؤسسات",
      en: "Cyber hygiene for enterprises",
    },
    excerpt: {
      ar: "أساسيات تقليل المخاطر دون تعقيد تشغيلي.",
      en: "Basics to reduce risk without operational drag.",
    },
    date: "2026-02-15",
    body: {
      ar: "اعتماد المصادقة متعددة العوامل، تجزئة الشبكات، والنسخ الاحتياطي المختبر يقلل احتمالية التوقف. ركّز على أصولك الحرجة أولاً ثم وسّع التغطية تدريجياً.",
      en: "MFA, network segmentation, and tested backups reduce outage risk. Prioritize critical assets first, then expand coverage iteratively.",
    },
  },
];

export const fallbackTeam: TeamMember[] = [
  {
    name: { ar: "صادق العتر", en: "Sadek Al-Atr" },
    role: {
      ar: "مهندس ذكاء اصطناعي، خبير أمن سيبراني، مدير الشركة",
      en: "AI engineer, cybersecurity expert, company director",
    },
    highlight: {
      ar: "القيادة الفنية والأمنية والاستراتيجية لـ T.E.N.E.G.T.A",
      en: "Technical, security, and strategic leadership at T.E.N.E.G.T.A",
    },
    portraitAlt: {
      ar: "تمثيل بصري متحرك للقيادة التقنية في T.E.N.E.G.T.A",
      en: "Animated visual for technical leadership at T.E.N.E.G.T.A",
    },
  },
];

export const fallbackCaseStudies: CaseStudyCard[] = [
  {
    slug: "smart-operations",
    title: {
      ar: "منصة عمليات ذكية",
      en: "Smart operations platform",
    },
    excerpt: {
      ar: "من بيانات متفرقة إلى رؤية تشغيلية أوضح وقرارات أسرع.",
      en: "From fragmented data to clearer operational visibility and faster decisions.",
    },
    problem: {
      ar: "بيانات متفرقة وصعوبة في رؤية الأداء بوضوح.",
      en: "Fragmented data and limited visibility into performance.",
    },
    approach: {
      ar: "تجميع البيانات في طبقة موحدة مع لوحات ومؤشرات قابلة للقياس.",
      en: "Unified data layer with dashboards and measurable KPIs.",
    },
    architecture: {
      ar: "تدفقات جمع، تخزين تحليلي، لوحات تفاعلية، وقواعد تنبيه حسب السياسات.",
      en: "Ingest pipelines, analytical store, interactive dashboards, and policy-based alerting.",
    },
    results: {
      ar: "رؤية تشغيلية أوضح وقرارات أسرع.",
      en: "Clearer operational visibility and faster decisions.",
    },
  },
  {
    slug: "security-analytics",
    title: {
      ar: "تحليلات أمنية موحدة",
      en: "Unified security analytics",
    },
    excerpt: {
      ar: "تقليل الضجيج وتحسين سرعة الاستجابة عبر تحليل موحّد للسجلات.",
      en: "Less noise and faster response through unified log analytics.",
    },
    problem: {
      ar: "تنبيهات كثيرة بلا سياق كافٍ.",
      en: "High alert volume without enough context.",
    },
    approach: {
      ar: "ربط السجلات وتحليلها وتحديد الأولويات آليًا.",
      en: "Correlate and analyze logs with automated prioritization.",
    },
    architecture: {
      ar: "جمع سجلات، تطبيع، تخزين بحثي، وتكامل مع أدوات الاستجابة.",
      en: "Log collection, normalization, searchable store, and response tool hooks.",
    },
    results: {
      ar: "تقليل الضجيج وتحسين سرعة الاستجابة.",
      en: "Reduced noise and improved response speed.",
    },
  },
  {
    slug: "agriculture-intelligence",
    title: {
      ar: "ذكاء زراعي ميداني",
      en: "Field agricultural intelligence",
    },
    excerpt: {
      ar: "رؤية أدق للتربة والري والتوقيت الزراعي من الاستشعار والتحليل.",
      en: "Sharper visibility on soil, irrigation, and timing from sensing and analytics.",
    },
    problem: {
      ar: "القرار الزراعي يعتمد على الخبرة الجزئية أكثر من البيانات.",
      en: "Field decisions leaned on partial experience more than data.",
    },
    approach: {
      ar: "استشعار ميداني وتحليل موسمي ولوحات متابعة.",
      en: "Field sensing, seasonal analytics, and monitoring dashboards.",
    },
    architecture: {
      ar: "حافة خفيفة للجمع، تخزين سلاسل زمنية، ولوحات للمهندس الميداني.",
      en: "Light edge ingest, time-series storage, and agronomist-facing dashboards.",
    },
    results: {
      ar: "رؤية أدق للتربة والري والتوقيت الزراعي.",
      en: "Sharper insight into soil, irrigation, and crop timing.",
    },
  },
  {
    slug: "customer-triage",
    title: {
      ar: "فرز خدمة العملاء بنهج قابل للقياس",
      en: "Measurable customer triage",
    },
    excerpt: {
      ar: "تحويل تراكم التذاكر إلى مسار فرز وتعلم مستمر.",
      en: "Turning backlog into a triage flow with continuous learning.",
    },
    problem: {
      ar: "تذاكر كثيرة مع غياب أولوية واضحة وتباين في جودة الردود.",
      en: "High ticket volume without clear prioritization and inconsistent response quality.",
    },
    approach: {
      ar: "تعريف فئات وأسباب، تدريب مصنف، وربط النتائج بإجراءات واضحة للفريق.",
      en: "Define categories and reasons, train a classifier, and tie outcomes to clear operator actions.",
    },
    architecture: {
      ar: "تكامل قنوات، تخزين أحداث، نماذج + قواعد، ولوحات جودة وسرعة استجابة.",
      en: "Channel integrations, event store, hybrid models + rules, and dashboards for quality and speed.",
    },
    results: {
      ar: "تحسن زمن المعالجة وزيادة وضوح الأسباب المتكررة التي تحتاج إصلاحاً جذرياً.",
      en: "Improved handling time and clearer recurring causes requiring systemic fixes.",
    },
  },
  {
    slug: "secure-delivery",
    title: {
      ar: "تسليم برمجي آمن من الفكرة إلى الإنتاج",
      en: "Secure delivery from idea to production",
    },
    excerpt: {
      ar: "تقليل المخاطر عبر خطوط تسليم قابلة للتتبع ومراقبة تشغيلية.",
      en: "Reducing risk through traceable pipelines and operational visibility.",
    },
    problem: {
      ar: "نشر يدوي وتغييرات غير موثقة تزيد احتمال انقطاع الخدمة.",
      en: "Manual releases and undocumented changes increased outage likelihood.",
    },
    approach: {
      ar: "معايير إصدار، أتمتة نشر، وفحوصات جودة/أمن قبل الإنتاج.",
      en: "Release standards, automated deployments, and quality/security gates before production.",
    },
    architecture: {
      ar: "CI/CD مع فحص أمني، بيئات متطابقة، وربط بالمقاييس والسجلات والمسارات.",
      en: "CI/CD with security scanning, reproducible environments, and metrics/logs/traces wiring.",
    },
    results: {
      ar: "إصدارات أسرع بثقة أعلى وحوادث أقل مرتبطة بالنشر.",
      en: "Faster, safer releases with fewer deployment-related incidents.",
    },
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudyCard | undefined {
  return fallbackCaseStudies.find((c) => c.slug === slug);
}

export const fallbackJobs: JobOpening[] = [
  {
    id: "fe-1",
    title: { ar: "مطوّر واجهات (Next.js)", en: "Frontend engineer (Next.js)" },
    location: { ar: "عن بُعد / هجين", en: "Remote / hybrid" },
    type: { ar: "دوام كامل", en: "Full-time" },
  },
  {
    id: "ml-1",
    title: { ar: "مهندس تعلم آلي", en: "ML engineer" },
    location: { ar: "المكتب الرئيسي", en: "HQ" },
    type: { ar: "دوام كامل", en: "Full-time" },
  },
];

export type TechStackItem = { name: string; category: Localized };

/** English `category.en` is the grouping key (UI + TechStackShowcase). */
export const techStackCategoryOrder = [
  "Experience",
  "Languages & runtimes",
  "AI & machine learning",
  "Data & messaging",
  "Cloud, platform & delivery",
] as const;

export const techStackItems: TechStackItem[] = [
  { name: "Next.js", category: { ar: "تجربة وواجهات", en: "Experience" } },
  { name: "React", category: { ar: "تجربة وواجهات", en: "Experience" } },
  { name: "TypeScript", category: { ar: "لغات وبيئات تشغيل", en: "Languages & runtimes" } },
  { name: "Python", category: { ar: "لغات وبيئات تشغيل", en: "Languages & runtimes" } },
  { name: "Node.js", category: { ar: "لغات وبيئات تشغيل", en: "Languages & runtimes" } },
  { name: "Go", category: { ar: "لغات وبيئات تشغيل", en: "Languages & runtimes" } },
  { name: "TensorFlow", category: { ar: "ذكاء اصطناعي وتعلم آلي", en: "AI & machine learning" } },
  { name: "PyTorch", category: { ar: "ذكاء اصطناعي وتعلم آلي", en: "AI & machine learning" } },
  { name: "ONNX", category: { ar: "ذكاء اصطناعي وتعلم آلي", en: "AI & machine learning" } },
  { name: "PostgreSQL", category: { ar: "بيانات ورسائل", en: "Data & messaging" } },
  { name: "Redis", category: { ar: "بيانات ورسائل", en: "Data & messaging" } },
  { name: "Kafka", category: { ar: "بيانات ورسائل", en: "Data & messaging" } },
  { name: "Docker", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "Kubernetes", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "Terraform", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "GitHub Actions", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "Prometheus", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "Grafana", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
  { name: "OpenTelemetry", category: { ar: "سحابة ومنصة وتسليم", en: "Cloud, platform & delivery" } },
];
