export type Localized = { ar: string; en: string };

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

export const fallbackProjects: ProjectCard[] = [
  {
    slug: "ai-operations-platform",
    title: {
      ar: "منصة عمليات بالذكاء الاصطناعي",
      en: "AI operations platform",
    },
    excerpt: {
      ar: "تنسيق موارد ومهام عبر أنظمة متعددة مع تنبيهات وتنبؤ بالحمولة.",
      en: "Orchestrate resources and tasks across systems with alerts and load forecasting.",
    },
    challenge: {
      ar: "تفرق البيانات التشغيلية وغياب صورة موحّدة للأداء.",
      en: "Fragmented operational data and no single view of performance.",
    },
    solution: {
      ar: "منصة موحّدة للبيانات، لوحات قياس، وتكامل مع أنظمة التذاكر والمراقبة.",
      en: "Unified data layer, KPI dashboards, and integrations with ticketing and monitoring.",
    },
    results: {
      ar: "تقليل زمن الاكتشاف وتحسين استخدام الطاقة البشرية على المهام ذات القيمة.",
      en: "Reduced time-to-detect and better use of human effort on high-value work.",
    },
    metrics: {
      ar: "−35% زمن استجابة · رؤية موحّدة",
      en: "−35% response time · unified visibility",
    },
  },
  {
    slug: "security-analytics-hub",
    title: {
      ar: "مركز تحليلات أمنية موحّد",
      en: "Unified security analytics hub",
    },
    excerpt: {
      ar: "ارتباط السجلات والتهديدات في مسار تحليل واحد للاستجابة.",
      en: "Correlate logs and signals in one analytics path for response.",
    },
    challenge: {
      ar: "ضجيج تنبيهات وصعوبة أولوية الحوادث.",
      en: "Alert noise and difficulty prioritizing incidents.",
    },
    solution: {
      ar: "تطبيع السجلات، قواعد اكتشاف، ولوحات للفرق الزرقاء والحمراء.",
      en: "Log normalization, detection rules, and blue/red team views.",
    },
    results: {
      ar: "خفض الإنذارات الكاذبة وتحسين زمن الاحتواء.",
      en: "Fewer false positives and faster containment.",
    },
  },
  {
    slug: "smart-field-hama",
    title: {
      ar: "حقل زراعي ذكي – حماة",
      en: "Smart field pilot – Hama",
    },
    excerpt: {
      ar: "زيادة المحصول مع تقليل استهلاك المياه عبر استشعار وتنبؤ.",
      en: "Yield uplift with lower water use via sensing and forecasting.",
    },
    challenge: {
      ar: "تفاوت رطوبة التربة وتكاليف الري المرتفعة.",
      en: "Soil moisture variance and high irrigation cost.",
    },
    solution: {
      ar: "منصة تحليلات ميدانية مع نماذج تنبؤ وري موجه.",
      en: "Field analytics platform with predictive models and guided irrigation.",
    },
    results: {
      ar: "تحسن المحصول ~30% وتوفير مياه ~20% في الموسم التجريبي.",
      en: "~30% yield improvement and ~20% water savings in the pilot season.",
    },
    metrics: {
      ar: "+30% محصول · −20% مياه",
      en: "+30% yield · −20% water",
    },
  },
  {
    slug: "industrial-soc",
    title: {
      ar: "مركز عمليات أمن لشركة صناعية",
      en: "Industrial security operations center",
    },
    excerpt: {
      ar: "تقليل الحوادث عبر مراقبة موحدة واستجابة أسرع.",
      en: "Fewer incidents via unified monitoring and faster response.",
    },
    challenge: {
      ar: "أنظمة متفرقة وصعوبة اكتشاف التهديدات مبكراً.",
      en: "Fragmented tooling and late threat detection.",
    },
    solution: {
      ar: "تكامل سجلات، قواعد اكتشاف، وتدريب فرق الاستجابة.",
      en: "Log integration, detection rules, and response playbooks.",
    },
    results: {
      ar: "خفض زمن الاكتشاف والاحتواء بشكل ملحوظ خلال أشهر.",
      en: "Materially reduced detection and containment time within months.",
    },
  },
];

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
