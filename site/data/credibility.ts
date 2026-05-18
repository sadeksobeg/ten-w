import type { Localized } from "@/lib/fallback-data";

export type SiteMetric = {
  value: string;
  suffix?: string;
  label: Localized;
  sublabel?: Localized;
};

export type IndustryArchetype = {
  id: string;
  label: Localized;
  sector: Localized;
  icon: string;
};

/** @deprecated use industryArchetypes */
export type ClientLogo = { id: string; label: Localized };

export type Testimonial = {
  id: string;
  quote: Localized;
  role: Localized;
  org: Localized;
  initials: string;
  accentColor: string;
};

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

/** Logo marquee — label only for backward compatibility */
export const clientLogos: ClientLogo[] = industryArchetypes.map(({ id, label }) => ({
  id,
  label,
}));

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

export const metricsDisclaimer: Localized = {
  ar: "مؤشرات من برامج التسليم والعقود — استبدلها بأرقامكم المعتمدة عند النشر الرسمي.",
  en: "Indicators from delivery programs and contracts — replace with your audited figures at official launch.",
  fr: "Indicateurs issus des programmes de livraison et des contrats — remplacez par vos chiffres audités au lancement officiel.",
};
