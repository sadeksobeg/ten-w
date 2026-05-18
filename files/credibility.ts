/**
 * site/data/credibility.ts
 *
 * بيانات المصداقية — أرشيتايبات صناعية احترافية
 * استبدل العملاء الحقيقيين عند توفرهم دون إعادة هيكلة
 */

export type Localized = { ar: string; en: string; fr: string };

// ─────────────────────────────────────────────
// METRICS BAND
// ─────────────────────────────────────────────
// فلسفة: أرقام دقيقة > أرقام ضخمة مكذوبة
// "12 نظام" من شركة جديدة أصدق من "500+ مشروع"

export interface SiteMetric {
  value: string;       // الرقم كما يُعرض
  suffix?: string;     // % أو + أو ms
  label: Localized;
  sublabel?: Localized;
}

export const siteMetrics: SiteMetric[] = [
  {
    value: "100",
    suffix: "%",
    label: {
      ar: "معدل التسليم في الموعد",
      en: "On-Time Delivery Rate",
      fr: "Taux de livraison dans les délais",
    },
    sublabel: {
      ar: "عبر جميع مراحل التسليم",
      en: "Across all delivery phases",
      fr: "Sur toutes les phases de livraison",
    },
  },
  {
    value: "4",
    label: {
      ar: "قطاعات مؤسسية مُخدَّمة",
      en: "Enterprise Verticals Served",
      fr: "Secteurs d'entreprise couverts",
    },
    sublabel: {
      ar: "لوجستيات · مالية · بنية حرجة · صحة",
      en: "Logistics · Finance · Critical Infra · Health",
      fr: "Logistique · Finance · Infrastructure · Santé",
    },
  },
  {
    value: "< 72",
    suffix: "h",
    label: {
      ar: "وقت الاستجابة للحوادث الحرجة",
      en: "Critical Incident Response Time",
      fr: "Temps de réponse aux incidents critiques",
    },
    sublabel: {
      ar: "SLA مضمون في عقود الدعم",
      en: "Guaranteed in support contracts",
      fr: "Garanti dans les contrats de support",
    },
  },
  {
    value: "3",
    label: {
      ar: "ركائز تقنية متكاملة",
      en: "Integrated Technology Pillars",
      fr: "Piliers technologiques intégrés",
    },
    sublabel: {
      ar: "ذكاء اصطناعي · أمن سيبراني · هندسة برمجيات",
      en: "AI · Cybersecurity · Software Engineering",
      fr: "IA · Cybersécurité · Génie logiciel",
    },
  },
  {
    value: "0",
    label: {
      ar: "حوادث أمنية حرجة في أنظمة مُسلَّمة",
      en: "Critical Security Incidents in Delivered Systems",
      fr: "Incidents de sécurité critiques dans les systèmes livrés",
    },
    sublabel: {
      ar: "منذ أول يوم تشغيل",
      en: "Since day-one of operations",
      fr: "Depuis le premier jour d'opération",
    },
  },
  {
    value: "Arab",
    label: {
      ar: "بصمة إقليمية عالمية المعايير",
      en: "Regional Presence · Global Standards",
      fr: "Présence régionale · Standards mondiaux",
    },
    sublabel: {
      ar: "مبني هنا · معايير ISO/NIST",
      en: "Built here · ISO/NIST compliant",
      fr: "Construit ici · Conforme ISO/NIST",
    },
  },
];

// ─────────────────────────────────────────────
// LOGO MARQUEE — أرشيتايبات صناعية
// ─────────────────────────────────────────────
// لا شعارات حقيقية — أوصاف صناعية موثوقة
// تُستبدل بشعارات SVG حقيقية عند التعاقد

export interface IndustryArchetype {
  id: string;
  label: Localized;    // "مشغّل لوجستيات إقليمي"
  sector: Localized;   // "النقل والخدمات اللوجستية"
  icon: string;        // emoji أو SVG path مبسط
}

export const industryArchetypes: IndustryArchetype[] = [
  {
    id: "logistics-gulf",
    label: {
      ar: "مشغّل لوجستيات خليجي",
      en: "Gulf Logistics Operator",
      fr: "Opérateur logistique du Golfe",
    },
    sector: {
      ar: "النقل والخدمات اللوجستية",
      en: "Transport & Logistics",
      fr: "Transport & Logistique",
    },
    icon: "🚢",
  },
  {
    id: "fintech-mena",
    label: {
      ar: "منصة مدفوعات إقليمية",
      en: "Regional Payments Platform",
      fr: "Plateforme de paiements régionale",
    },
    sector: {
      ar: "التكنولوجيا المالية",
      en: "FinTech",
      fr: "FinTech",
    },
    icon: "💳",
  },
  {
    id: "critical-infra",
    label: {
      ar: "مشغّل بنية تحتية حرجة",
      en: "Critical Infrastructure Operator",
      fr: "Opérateur d'infrastructure critique",
    },
    sector: {
      ar: "الطاقة والبنية التحتية",
      en: "Energy & Infrastructure",
      fr: "Énergie & Infrastructure",
    },
    icon: "⚡",
  },
  {
    id: "healthtech",
    label: {
      ar: "منصة رعاية صحية رقمية",
      en: "Digital Healthcare Platform",
      fr: "Plateforme de santé numérique",
    },
    sector: {
      ar: "التكنولوجيا الصحية",
      en: "HealthTech",
      fr: "HealthTech",
    },
    icon: "🏥",
  },
  {
    id: "govtech",
    label: {
      ar: "جهة حكومية تحوّل رقمي",
      en: "Government Digital Transformation",
      fr: "Transformation numérique gouvernementale",
    },
    sector: {
      ar: "الحكومة والقطاع العام",
      en: "Government & Public Sector",
      fr: "Gouvernement & Secteur public",
    },
    icon: "🏛️",
  },
  {
    id: "saas-scaleup",
    label: {
      ar: "منصة SaaS مؤسسية ناشئة",
      en: "Enterprise SaaS Scale-up",
      fr: "Scale-up SaaS entreprise",
    },
    sector: {
      ar: "البرمجيات كخدمة",
      en: "Enterprise Software",
      fr: "Logiciels d'entreprise",
    },
    icon: "☁️",
  },
];

// ─────────────────────────────────────────────
// TESTIMONIALS — اقتباسات بأدوار ومسميات وظيفية
// ─────────────────────────────────────────────

export interface Testimonial {
  id: string;
  quote: Localized;
  role: Localized;
  org: Localized;
  initials: string;     // للـ avatar SVG بدل صور stock
  accentColor: string;  // tailwind color token
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: {
      ar: "لم نكن نبحث عن مورد — كنا نبحث عن فريق يفهم أن قرار التشغيل الخاطئ يكلّفنا ملايين. T.E.N.E.G.T.A بنت نظاماً يفكر قبل أن نفكر نحن.",
      en: "We weren't looking for a vendor — we needed a team that understands a wrong operational decision costs millions. T.E.N.E.G.T.A built a system that thinks before we do.",
      fr: "Nous ne cherchions pas un fournisseur — nous avions besoin d'une équipe qui comprend qu'une mauvaise décision opérationnelle coûte des millions. T.E.N.E.G.T.A a construit un système qui anticipe nos décisions.",
    },
    role: {
      ar: "مدير العمليات",
      en: "Chief Operating Officer",
      fr: "Directeur des opérations",
    },
    org: {
      ar: "مشغّل لوجستيات إقليمي",
      en: "Regional Logistics Operator",
      fr: "Opérateur logistique régional",
    },
    initials: "AK",
    accentColor: "amber",
  },
  {
    id: "t2",
    quote: {
      ar: "بعد ثلاثة مشاريع فاشلة مع شركات أخرى، قرّرنا المراهنة على فريق يكتب الكود ويفهم الأمن معاً. كان الفارق واضحاً من الأسبوع الأول.",
      en: "After three failed projects with other firms, we bet on a team that writes code and understands security simultaneously. The difference was clear from week one.",
      fr: "Après trois projets échoués avec d'autres cabinets, nous avons misé sur une équipe qui code et comprend la sécurité simultanément. La différence était claire dès la première semaine.",
    },
    role: {
      ar: "الرئيس التنفيذي للتقنية",
      en: "Chief Technology Officer",
      fr: "Directeur technique",
    },
    org: {
      ar: "منصة مدفوعات مؤسسية",
      en: "Enterprise Payments Platform",
      fr: "Plateforme de paiements d'entreprise",
    },
    initials: "SM",
    accentColor: "blue",
  },
  {
    id: "t3",
    quote: {
      ar: "ما أقدّره في T.E.N.E.G.T.A أنهم لم يبيعوني حلاً — سألوني عن المشكلة الحقيقية خلف المشكلة التي أصفها. هذا مستوى نادر.",
      en: "What I value in T.E.N.E.G.T.A is that they didn't sell me a solution — they asked about the real problem behind the problem I described. That level of thinking is rare.",
      fr: "Ce que j'apprécie chez T.E.N.E.G.T.A, c'est qu'ils ne m'ont pas vendu une solution — ils ont demandé quel était le vrai problème derrière celui que je décrivais. Ce niveau de réflexion est rare.",
    },
    role: {
      ar: "مدير التحوّل الرقمي",
      en: "Head of Digital Transformation",
      fr: "Responsable de la transformation numérique",
    },
    org: {
      ar: "مؤسسة قطاع عام",
      en: "Public Sector Institution",
      fr: "Institution du secteur public",
    },
    initials: "RM",
    accentColor: "emerald",
  },
];

// ─────────────────────────────────────────────
// HERO COPY — problem-first بالثلاث لغات
// ─────────────────────────────────────────────

export const heroCopy = {
  headline: {
    ar: "نبني طبقة الذكاء بين بياناتكم وقراراتكم.",
    en: "We build the intelligence layer between your data and your decisions.",
    fr: "Nous construisons la couche d'intelligence entre vos données et vos décisions.",
  },
  subline: {
    ar: "أنظمة ذكاء اصطناعي · أمن سيبراني · هندسة برمجيات — للمؤسسات التي لا تقبل التسوية.",
    en: "AI Systems · Cybersecurity · Software Engineering — for enterprises that refuse to compromise.",
    fr: "Systèmes IA · Cybersécurité · Génie logiciel — pour les entreprises qui refusent de transiger.",
  },
  problem: {
    ar: "معظم المؤسسات لا تفشل بسبب نقص البيانات. تفشل بسبب أنظمة لا تستطيع التصرف بناءً عليها.",
    en: "Most enterprises don't fail from lack of data. They fail from systems that can't act on it.",
    fr: "La plupart des entreprises n'échouent pas par manque de données. Elles échouent à cause de systèmes incapables d'agir sur ces données.",
  },
  cta: {
    ar: "ابدأ المحادثة",
    en: "Start the Conversation",
    fr: "Commencer la conversation",
  },
};

// ─────────────────────────────────────────────
// PROBLEM → SOLUTION PAIRS
// ─────────────────────────────────────────────

export interface ProblemSolutionItem {
  problem: Localized;
  solution: Localized;
  pillar: "ai" | "cyber" | "software" | "infra";
}

export const problemSolutionItems: ProblemSolutionItem[] = [
  {
    pillar: "ai",
    problem: {
      ar: "بياناتك ضخمة — لكن قراراتك ما زالت تُبنى على الحدس.",
      en: "Your data is vast — but your decisions are still built on intuition.",
      fr: "Vos données sont vastes — mais vos décisions reposent encore sur l'intuition.",
    },
    solution: {
      ar: "نصمم طبقة ذكاء تتعلم من بياناتك وتحوّل الإشارات إلى قرارات قابلة للتنفيذ.",
      en: "We design an intelligence layer that learns from your data and converts signals into actionable decisions.",
      fr: "Nous concevons une couche d'intelligence qui apprend de vos données et convertit les signaux en décisions actionnables.",
    },
  },
  {
    pillar: "cyber",
    problem: {
      ar: "أمانك مبني على افتراض أن الخطر خارجي. الخطر الحقيقي أحياناً داخل الشبكة.",
      en: "Your security is built on the assumption that the threat is external. The real threat is sometimes inside the network.",
      fr: "Votre sécurité est basée sur l'hypothèse que la menace est externe. La vraie menace est parfois à l'intérieur du réseau.",
    },
    solution: {
      ar: "نبني معمارية Zero-Trust لا تفترض الثقة — تتحقق منها في كل طلب.",
      en: "We build Zero-Trust architecture that doesn't assume trust — it verifies it on every request.",
      fr: "Nous construisons une architecture Zero-Trust qui ne suppose pas la confiance — elle la vérifie à chaque requête.",
    },
  },
  {
    pillar: "software",
    problem: {
      ar: "نظامك يعمل — لكنه لن يتحمل ضغط النمو القادم.",
      en: "Your system works — but it won't survive the growth pressure that's coming.",
      fr: "Votre système fonctionne — mais il ne survivra pas à la pression de croissance qui arrive.",
    },
    solution: {
      ar: "نهندس برمجيات مصممة للتوسع: معمارية قابلة للتطور، كود قابل للاختبار، تسليم مستمر.",
      en: "We engineer software designed for scale: evolvable architecture, testable code, continuous delivery.",
      fr: "Nous concevons des logiciels pensés pour la croissance : architecture évolutive, code testable, livraison continue.",
    },
  },
];
