export type SystemType =
  | "ai"
  | "cyber"
  | "software"
  | "infra"
  | "fintech"
  | "health"
  | "logistics"
  | "iot"
  | "data"
  | "ecommerce";

export interface VisualizationConfig {
  type: SystemType;
  title: { ar: string; en: string; fr: string };
  nodes: { id: string; label: { ar: string; en: string }; role: string }[];
  flows: {
    from: string;
    to: string;
    label?: string;
    bidirectional?: boolean;
  }[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animationStyle: "particles" | "pulse" | "wave" | "radar" | "orbit";
  complexity: "simple" | "medium" | "complex";
}

type KeywordGroup = { terms: string[]; weight: number };

const KEYWORD_MAP: Record<SystemType, KeywordGroup[]> = {
  ai: [
    {
      weight: 3,
      terms: [
        "ذكاء",
        "اصطناعي",
        "تعلم",
        "آلة",
        "نموذج",
        "تنبؤ",
        "تصنيف",
        "رؤية",
        "حاسوبية",
        "توصية",
        "كشف",
        "شذوذ",
        "معالجة",
        "لغة",
        "بيانات",
        "تحليل",
        "تدريب",
        "خوارزمية",
        "تنبؤي",
        "بوت",
        "محادثة",
        "ai",
        "ml",
        "machine learning",
        "neural",
        "predict",
        "classify",
        "vision",
        "recommend",
        "anomaly",
        "nlp",
        "model",
        "training",
        "inference",
        "detection",
        "computer vision",
        "deep learning",
        "transformer",
        "llm",
        "chatbot",
        "intelligence",
        "artificielle",
        "apprentissage",
        "prédiction",
        "modèle",
        "classification",
        "détection",
        "recommandation",
      ],
    },
  ],
  cyber: [
    {
      weight: 3,
      terms: [
        "أمن",
        "سيبراني",
        "حماية",
        "اختراق",
        "هجوم",
        "ثغرة",
        "جدار",
        "ناري",
        "تشفير",
        "مصادقة",
        "صلاحيات",
        "مراقبة",
        "تهديد",
        "فيروس",
        "احتيال",
        "ثقة",
        "security",
        "cyber",
        "firewall",
        "threat",
        "vulnerability",
        "pentest",
        "zero-trust",
        "siem",
        "soc",
        "encryption",
        "authentication",
        "authorization",
        "intrusion",
        "malware",
        "attack",
        "phishing",
        "compliance",
        "audit",
        "sécurité",
        "protection",
        "menace",
        "pare-feu",
        "authentification",
        "chiffrement",
      ],
    },
  ],
  software: [
    {
      weight: 2,
      terms: [
        "تطبيق",
        "برمجيات",
        "منصة",
        "مستخدمين",
        "واجهة",
        "api",
        "قاعدة بيانات",
        "مستأجر",
        "اشتراك",
        "dashboard",
        "لوحة",
        "نشر",
        "تكامل",
        "خدمات",
        "saas",
        "app",
        "platform",
        "users",
        "database",
        "multi-tenant",
        "subscription",
        "microservices",
        "backend",
        "frontend",
        "deploy",
        "integration",
        "cloud",
        "devops",
        "ci/cd",
        "application",
        "plateforme",
        "utilisateurs",
        "abonnement",
        "déploiement",
      ],
    },
  ],
  infra: [
    {
      weight: 2,
      terms: [
        "خوادم",
        "سحابة",
        "حاويات",
        "توزيع",
        "شبكة",
        "استضافة",
        "نسخ احتياطي",
        "متاحية",
        "أداء",
        "توسع",
        "kubernetes",
        "docker",
        "server",
        "cloud",
        "container",
        "network",
        "load balancer",
        "scaling",
        "infrastructure",
        "hosting",
        "availability",
        "backup",
        "monitoring",
        "observability",
        "serveur",
        "réseau",
        "conteneur",
        "disponibilité",
      ],
    },
  ],
  fintech: [
    {
      weight: 3,
      terms: [
        "مدفوعات",
        "بنك",
        "مالي",
        "تحويل",
        "عملة",
        "بطاقة",
        "رصيد",
        "فاتورة",
        "تداول",
        "استثمار",
        "محفظة",
        "ائتمان",
        "قرض",
        "تأمين",
        "ضريبة",
        "payment",
        "bank",
        "finance",
        "transfer",
        "currency",
        "card",
        "balance",
        "invoice",
        "trading",
        "investment",
        "wallet",
        "credit",
        "loan",
        "insurance",
        "fintech",
        "transaction",
        "ledger",
        "accounting",
        "paiement",
        "banque",
        "finance",
        "transfert",
        "monnaie",
        "investissement",
      ],
    },
  ],
  health: [
    {
      weight: 3,
      terms: [
        "صحة",
        "مريض",
        "طبي",
        "مستشفى",
        "سجلات",
        "تشخيص",
        "دواء",
        "عيادة",
        "رعاية",
        "تمريض",
        "مختبر",
        "أشعة",
        "وصفة",
        "health",
        "patient",
        "medical",
        "hospital",
        "clinic",
        "diagnosis",
        "medicine",
        "ehr",
        "emr",
        "telemedicine",
        "pharmacy",
        "lab",
        "treatment",
        "healthcare",
        "doctor",
        "nurse",
        "appointment",
        "santé",
        "patient",
        "médical",
        "hôpital",
        "diagnostic",
        "traitement",
      ],
    },
  ],
  logistics: [
    {
      weight: 3,
      terms: [
        "لوجستيات",
        "شحن",
        "توصيل",
        "أسطول",
        "مستودع",
        "مخزون",
        "تتبع",
        "سلسلة توريد",
        "شاحنة",
        "طلبية",
        "توزيع",
        "مسار",
        "logistics",
        "shipping",
        "delivery",
        "fleet",
        "warehouse",
        "inventory",
        "tracking",
        "supply chain",
        "route",
        "dispatch",
        "cargo",
        "freight",
        "truck",
        "logistique",
        "livraison",
        "flotte",
        "entrepôt",
        "inventaire",
        "traçage",
      ],
    },
  ],
  iot: [
    {
      weight: 3,
      terms: [
        "إنترنت الأشياء",
        "حساسات",
        "أجهزة",
        "استشعار",
        "ذكي",
        "منزل ذكي",
        "بث",
        "في الوقت الحقيقي",
        "اتصال",
        "بروتوكول",
        "mqtt",
        "iot",
        "sensor",
        "device",
        "smart",
        "real-time",
        "stream",
        "raspberry",
        "arduino",
        "embedded",
        "telemetry",
        "actuator",
        "gateway",
        "capteur",
        "appareils",
        "intelligent",
        "temps réel",
        "télémétrie",
      ],
    },
  ],
  data: [
    {
      weight: 2,
      terms: [
        "تقارير",
        "احصاءات",
        "مؤشرات",
        "تحليل",
        "بيانات ضخمة",
        "لوحة تحكم",
        "رسوم بيانية",
        "استخراج",
        "تنقيب",
        "خزانة بيانات",
        "analytics",
        "report",
        "kpi",
        "metrics",
        "bigdata",
        "warehouse",
        "etl",
        "bi",
        "visualization",
        "insight",
        "statistics",
        "analytique",
        "rapport",
        "tableau de bord",
        "statistiques",
        "indicateurs",
      ],
    },
  ],
  ecommerce: [
    {
      weight: 2,
      terms: [
        "تجارة",
        "متجر",
        "منتجات",
        "طلبات",
        "سلة",
        "دفع",
        "عملاء",
        "كتالوج",
        "موردين",
        "تقييمات",
        "مرتجعات",
        "خصومات",
        "ecommerce",
        "store",
        "shop",
        "product",
        "order",
        "cart",
        "checkout",
        "catalog",
        "vendor",
        "marketplace",
        "discount",
        "review",
        "return",
        "commerce",
        "boutique",
        "produit",
        "commande",
        "panier",
        "catalogue",
      ],
    },
  ],
};

type DomainOverride = {
  terms: string[];
  nodeIndex: number;
  label: { ar: string; en: string };
};

const DOMAIN_OVERRIDES: DomainOverride[] = [
  {
    terms: ["شاحنات", "شاحنة", "أسطول", "truck", "fleet", "flotte"],
    nodeIndex: 2,
    label: { ar: "إدارة الأسطول", en: "Fleet Manager" },
  },
  {
    terms: ["مخزون", "inventory", "stock", "inventaire"],
    nodeIndex: 3,
    label: { ar: "المخزون", en: "Inventory" },
  },
  {
    terms: ["عملاء", "customer", "client", "utilisateur"],
    nodeIndex: 0,
    label: { ar: "العملاء", en: "Clients" },
  },
  {
    terms: ["مدفوعات", "payment", "paiement", "دفع"],
    nodeIndex: 1,
    label: { ar: "الدفع", en: "Payment" },
  },
  {
    terms: ["مستودع", "warehouse", "entrepôt"],
    nodeIndex: 3,
    label: { ar: "المستودع", en: "Warehouse" },
  },
  {
    terms: ["مريض", "patient", "ehr", "emr"],
    nodeIndex: 0,
    label: { ar: "بوابة المريض", en: "Patient Portal" },
  },
  {
    terms: ["حساسات", "sensor", "capteur", "mqtt"],
    nodeIndex: 0,
    label: { ar: "الحساسات", en: "Sensors" },
  },
  {
    terms: ["احتيال", "fraud", "fraude"],
    nodeIndex: 2,
    label: { ar: "محرك المخاطر", en: "Risk Engine" },
  },
  {
    terms: ["تنبؤ", "predict", "prédiction", "forecast"],
    nodeIndex: 2,
    label: { ar: "نموذج التنبؤ", en: "Predictive Model" },
  },
  {
    terms: ["تهديد", "threat", "menace", "siem"],
    nodeIndex: 2,
    label: { ar: "SIEM", en: "SIEM" },
  },
];

type TemplateNode = {
  id: string;
  label: { ar: string; en: string };
  role: string;
};

const BASE_TEMPLATES: Record<SystemType, TemplateNode[]> = {
  ai: [
    { id: "data_source", label: { ar: "مصدر البيانات", en: "Data Source" }, role: "ingest" },
    { id: "preprocessing", label: { ar: "معالجة مسبقة", en: "Preprocessing" }, role: "transform" },
    { id: "ml_model", label: { ar: "نموذج ML", en: "ML Model" }, role: "train" },
    { id: "inference", label: { ar: "استدلال", en: "Inference" }, role: "serve" },
    { id: "action_layer", label: { ar: "طبقة التنفيذ", en: "Action Layer" }, role: "act" },
  ],
  cyber: [
    { id: "traffic", label: { ar: "حركة الشبكة", en: "Traffic" }, role: "ingress" },
    { id: "zero_trust", label: { ar: "صفر ثقة", en: "Zero Trust" }, role: "policy" },
    { id: "siem", label: { ar: "SIEM", en: "SIEM" }, role: "detect" },
    { id: "analyst", label: { ar: "محلل الأمن", en: "Analyst" }, role: "respond" },
    { id: "audit_log", label: { ar: "سجل التدقيق", en: "Audit Log" }, role: "record" },
  ],
  software: [
    { id: "auth", label: { ar: "المصادقة", en: "Auth" }, role: "identity" },
    { id: "api_gateway", label: { ar: "بوابة API", en: "API Gateway" }, role: "gateway" },
    { id: "core_service", label: { ar: "الخدمة الأساسية", en: "Core Service" }, role: "logic" },
    { id: "database", label: { ar: "قاعدة البيانات", en: "Database" }, role: "store" },
    { id: "frontend", label: { ar: "الواجهة", en: "Frontend" }, role: "ui" },
  ],
  infra: [
    { id: "load_balancer", label: { ar: "موازن الحمل", en: "Load Balancer" }, role: "route" },
    { id: "app_cluster", label: { ar: "مجموعة التطبيق", en: "App Cluster" }, role: "compute" },
    { id: "database", label: { ar: "قاعدة البيانات", en: "Database" }, role: "store" },
    { id: "cache", label: { ar: "ذاكرة التخزين", en: "Cache" }, role: "cache" },
    { id: "monitoring", label: { ar: "المراقبة", en: "Monitoring" }, role: "observe" },
  ],
  fintech: [
    { id: "client_app", label: { ar: "تطبيق العميل", en: "Client App" }, role: "ui" },
    { id: "payment_gateway", label: { ar: "بوابة الدفع", en: "Payment Gateway" }, role: "pay" },
    { id: "risk_engine", label: { ar: "محرك المخاطر", en: "Risk Engine" }, role: "risk" },
    { id: "ledger", label: { ar: "دفتر الأستاذ", en: "Ledger" }, role: "ledger" },
    { id: "compliance", label: { ar: "الامتثال", en: "Compliance" }, role: "audit" },
  ],
  health: [
    { id: "patient_portal", label: { ar: "بوابة المريض", en: "Patient Portal" }, role: "ui" },
    { id: "ehr_system", label: { ar: "السجل الطبي", en: "EHR System" }, role: "record" },
    { id: "clinical_engine", label: { ar: "المحرك السريري", en: "Clinical Engine" }, role: "clinical" },
    { id: "pharmacy", label: { ar: "الصيدلية", en: "Pharmacy" }, role: "rx" },
    { id: "billing", label: { ar: "الفوترة", en: "Billing" }, role: "billing" },
  ],
  logistics: [
    { id: "order_system", label: { ar: "نظام الطلبات", en: "Order System" }, role: "orders" },
    { id: "route_engine", label: { ar: "محرك المسارات", en: "Route Engine" }, role: "route" },
    { id: "fleet_manager", label: { ar: "إدارة الأسطول", en: "Fleet Manager" }, role: "fleet" },
    { id: "warehouse", label: { ar: "المستودع", en: "Warehouse" }, role: "warehouse" },
    { id: "delivery", label: { ar: "التوصيل", en: "Delivery" }, role: "deliver" },
  ],
  iot: [
    { id: "sensors", label: { ar: "الحساسات", en: "Sensors" }, role: "sense" },
    { id: "gateway", label: { ar: "البوابة", en: "Gateway" }, role: "gateway" },
    { id: "stream_processor", label: { ar: "معالج البث", en: "Stream Processor" }, role: "stream" },
    { id: "ai_layer", label: { ar: "طبقة الذكاء", en: "AI Layer" }, role: "analyze" },
    { id: "dashboard", label: { ar: "لوحة التحكم", en: "Dashboard" }, role: "visualize" },
  ],
  data: [
    { id: "data_sources", label: { ar: "مصادر البيانات", en: "Data Sources" }, role: "source" },
    { id: "etl_pipeline", label: { ar: "خط ETL", en: "ETL Pipeline" }, role: "etl" },
    { id: "data_warehouse", label: { ar: "مستودع البيانات", en: "Data Warehouse" }, role: "warehouse" },
    { id: "analytics", label: { ar: "التحليلات", en: "Analytics" }, role: "analyze" },
    { id: "reports", label: { ar: "التقارير", en: "Reports" }, role: "report" },
  ],
  ecommerce: [
    { id: "catalog", label: { ar: "الكتالوج", en: "Catalog" }, role: "catalog" },
    { id: "cart_engine", label: { ar: "محرك السلة", en: "Cart Engine" }, role: "cart" },
    { id: "payment_service", label: { ar: "خدمة الدفع", en: "Payment Service" }, role: "pay" },
    { id: "fulfillment", label: { ar: "التنفيذ", en: "Fulfillment" }, role: "fulfill" },
    { id: "analytics", label: { ar: "التحليلات", en: "Analytics" }, role: "insights" },
  ],
};

const TYPE_TITLES: Record<
  SystemType,
  { ar: string; en: string; fr: string }
> = {
  ai: {
    ar: "نظام ذكاء اصطناعي",
    en: "AI System Architecture",
    fr: "Architecture système IA",
  },
  cyber: {
    ar: "نظام أمن سيبراني",
    en: "Cybersecurity Architecture",
    fr: "Architecture cybersécurité",
  },
  software: {
    ar: "منصة برمجيات",
    en: "Software Platform Architecture",
    fr: "Architecture plateforme logicielle",
  },
  infra: {
    ar: "بنية تحتية سحابية",
    en: "Cloud Infrastructure Architecture",
    fr: "Architecture infrastructure cloud",
  },
  fintech: {
    ar: "نظام مالي رقمي",
    en: "Fintech Architecture",
    fr: "Architecture fintech",
  },
  health: {
    ar: "نظام صحة رقمية",
    en: "Digital Health Architecture",
    fr: "Architecture santé numérique",
  },
  logistics: {
    ar: "نظام لوجستيات",
    en: "Logistics Architecture",
    fr: "Architecture logistique",
  },
  iot: {
    ar: "شبكة إنترنت الأشياء",
    en: "IoT Network Architecture",
    fr: "Architecture réseau IoT",
  },
  data: {
    ar: "منصة تحليل بيانات",
    en: "Data Analytics Architecture",
    fr: "Architecture analytique",
  },
  ecommerce: {
    ar: "منصة تجارة إلكترونية",
    en: "E-Commerce Architecture",
    fr: "Architecture e-commerce",
  },
};

const PALETTES: Record<
  SystemType,
  { primary: string; secondary: string; accent: string }
> = {
  ai: { primary: "#534AB7", secondary: "#AFA9EC", accent: "#7F77DD" },
  cyber: { primary: "#A32D2D", secondary: "#F09595", accent: "#E24B4A" },
  software: { primary: "#3B6D11", secondary: "#97C459", accent: "#639922" },
  infra: { primary: "#854F0B", secondary: "#EF9F27", accent: "#BA7517" },
  fintech: { primary: "#185FA5", secondary: "#85B7EB", accent: "#378ADD" },
  health: { primary: "#0F6E56", secondary: "#5DCAA5", accent: "#1D9E75" },
  logistics: { primary: "#633806", secondary: "#FAC775", accent: "#EF9F27" },
  iot: { primary: "#3C3489", secondary: "#AFA9EC", accent: "#534AB7" },
  data: { primary: "#185FA5", secondary: "#B5D4F4", accent: "#378ADD" },
  ecommerce: { primary: "#993556", secondary: "#ED93B1", accent: "#D4537E" },
};

const ANIMATION_STYLES: Record<
  SystemType,
  VisualizationConfig["animationStyle"]
> = {
  ai: "particles",
  cyber: "radar",
  software: "pulse",
  infra: "wave",
  fintech: "particles",
  health: "pulse",
  logistics: "particles",
  iot: "wave",
  data: "particles",
  ecommerce: "pulse",
};

const EXTRA_NODES: Partial<
  Record<SystemType, { id: string; label: { ar: string; en: string }; role: string }>
> = {
  ai: {
    id: "monitoring",
    label: { ar: "مراقبة النموذج", en: "Model Monitoring" },
    role: "monitor",
  },
  cyber: {
    id: "threat_intel",
    label: { ar: "استخبارات التهديد", en: "Threat Intel" },
    role: "intel",
  },
  software: {
    id: "notifications",
    label: { ar: "الإشعارات", en: "Notifications" },
    role: "notify",
  },
  logistics: {
    id: "tracking",
    label: { ar: "التتبع الحي", en: "Live Tracking" },
    role: "track",
  },
  fintech: {
    id: "reconciliation",
    label: { ar: "التسوية", en: "Reconciliation" },
    role: "reconcile",
  },
};

const BIDIRECTIONAL_FLOWS: Partial<
  Record<SystemType, { from: string; to: string; label?: string }[]>
> = {
  ai: [{ from: "inference", to: "data_source", label: "feedback" }],
  cyber: [{ from: "siem", to: "zero_trust", label: "policy" }],
  software: [{ from: "frontend", to: "api_gateway", label: "actions" }],
};

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreTypes(normalized: string): Record<SystemType, number> {
  const scores = {} as Record<SystemType, number>;
  const types = Object.keys(KEYWORD_MAP) as SystemType[];
  for (const type of types) {
    scores[type] = 0;
    for (const group of KEYWORD_MAP[type]) {
      for (const term of group.terms) {
        if (term.length < 2) continue;
        if (normalized.includes(term.toLowerCase())) {
          scores[type] += group.weight;
        }
      }
    }
  }
  return scores;
}

function pickType(scores: Record<SystemType, number>): SystemType {
  let best: SystemType = "software";
  let bestScore = 0;
  for (const [type, score] of Object.entries(scores) as [SystemType, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = type;
    }
  }
  if (bestScore < 2) return "software";
  return best;
}

function applyDomainOverrides(
  nodes: TemplateNode[],
  normalized: string,
): TemplateNode[] {
  const result = nodes.map((n) => ({ ...n, label: { ...n.label } }));
  for (const override of DOMAIN_OVERRIDES) {
    const matched = override.terms.some((t) =>
      normalized.includes(t.toLowerCase()),
    );
    if (matched && override.nodeIndex < result.length) {
      result[override.nodeIndex] = {
        ...result[override.nodeIndex],
        label: override.label,
      };
    }
  }
  return result;
}

function maybeAddExtraNode(
  type: SystemType,
  nodes: TemplateNode[],
  normalized: string,
): TemplateNode[] {
  const extra = EXTRA_NODES[type];
  if (!extra) return nodes;
  const highComplexity =
    normalized.split(" ").length > 12 ||
    ["متعدد", "multi", "distributed", "موزع", "real-time", "حي"].some((k) =>
      normalized.includes(k),
    );
  if (!highComplexity) return nodes;
  return [...nodes, extra];
}

function buildFlows(
  type: SystemType,
  nodes: { id: string }[],
): VisualizationConfig["flows"] {
  const flows: VisualizationConfig["flows"] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    flows.push({ from: nodes[i].id, to: nodes[i + 1].id });
  }
  const extra = BIDIRECTIONAL_FLOWS[type];
  if (extra) {
    for (const f of extra) {
      const fromExists = nodes.some((n) => n.id === f.from);
      const toExists = nodes.some((n) => n.id === f.to);
      if (fromExists && toExists) {
        flows.push({ ...f, bidirectional: true });
      }
    }
  }
  return flows;
}

function getComplexity(
  nodeCount: number,
): VisualizationConfig["complexity"] {
  if (nodeCount <= 5) return "simple";
  if (nodeCount === 6) return "medium";
  return "complex";
}

export function analyzeDescription(text: string): VisualizationConfig {
  const normalized = normalizeText(text);
  const scores = scoreTypes(normalized);
  const type = pickType(scores);

  let templateNodes = [...BASE_TEMPLATES[type]];
  templateNodes = applyDomainOverrides(templateNodes, normalized);
  templateNodes = maybeAddExtraNode(type, templateNodes, normalized);

  const nodes = templateNodes.map((n) => ({
    id: n.id,
    label: n.label,
    role: n.role,
  }));

  const flows = buildFlows(type, nodes);

  return {
    type,
    title: TYPE_TITLES[type],
    nodes,
    flows,
    palette: PALETTES[type],
    animationStyle: ANIMATION_STYLES[type],
    complexity: getComplexity(nodes.length),
  };
}
