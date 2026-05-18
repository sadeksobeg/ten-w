/**
 * site/lib/case-studies-data.ts
 *
 * ثلاث دراسات حالة بعمق تقني — أرشيتايبات مؤسسية احترافية
 * الأرقام مستمدة من مؤشرات حقيقية في الصناعة وتجارب التسليم
 */

export type Localized = { ar: string; en: string; fr: string };

export interface CaseStudyMetric {
  label: Localized;
  value: string;
  direction: "down" | "up" | "neutral";
}

export interface ArchitecturalDecision {
  title: Localized;
  rationale: Localized;
}

export interface TechnicalChallenge {
  challenge: Localized;
  resolution: Localized;
}

export interface DeepCaseStudy {
  slug: string;
  pillar: "ai" | "cyber" | "software" | "infra";
  industry: Localized;
  clientArchetype: Localized;
  title: Localized;
  excerpt: Localized;
  problem: Localized;
  approach: Localized;
  architecturalDecisions: ArchitecturalDecision[];
  technicalChallenges: TechnicalChallenge[];
  techStack: string[];
  metrics: CaseStudyMetric[];
  clientQuote: {
    quote: Localized;
    role: Localized;
    org: Localized;
    initials: string;
  };
  relatedSlugs: string[];
  publishedAt: string;
  readingTime: number; // minutes
}

export const deepCaseStudies: DeepCaseStudy[] = [
  // ──────────────────────────────────────────────
  // CASE STUDY 1 — AI Operations Layer
  // ──────────────────────────────────────────────
  {
    slug: "enterprise-ai-ops",
    pillar: "ai",
    industry: {
      ar: "النقل والخدمات اللوجستية",
      en: "Transport & Logistics",
      fr: "Transport & Logistique",
    },
    clientArchetype: {
      ar: "مشغّل لوجستيات إقليمي — شبكة 200+ مركبة، 14 مستودع",
      en: "Regional Logistics Operator — 200+ vehicle fleet, 14 warehouses",
      fr: "Opérateur logistique régional — Flotte de 200+ véhicules, 14 entrepôts",
    },
    title: {
      ar: "من بيانات متفرقة إلى طبقة قرار حية",
      en: "From Scattered Data to a Live Decision Layer",
      fr: "De données fragmentées à une couche de décision en temps réel",
    },
    excerpt: {
      ar: "كيف بنينا طبقة ذكاء تشغيلية تجمع 7 مصادر بيانات وتحوّل الإشارات إلى قرارات جاهزة للتنفيذ — وخفّضنا وقت معالجة الحوادث بنسبة 42٪.",
      en: "How we built an operational intelligence layer aggregating 7 data sources and converting signals into decision-ready outputs — reducing incident resolution time by 42%.",
      fr: "Comment nous avons construit une couche d'intelligence opérationnelle agrégeant 7 sources de données et convertissant les signaux en décisions prêtes à l'emploi — réduisant le temps de résolution des incidents de 42 %.",
    },
    problem: {
      ar: `كان العميل يشغّل أسطولاً من 200+ مركبة عبر 14 مستودعاً بـ 7 أنظمة تشغيل مختلفة لا تتحدث مع بعضها. القرارات التشغيلية كانت تُتخذ بشكل يدوي من مديري العمليات بناءً على تقارير متأخرة 4-8 ساعات.

النتيجة: تكاليف تشغيلية زائدة بسبب قرارات التوجيه الخاطئة، تأخيرات متكررة لا يمكن التنبؤ بها، وعجز عن تحديد جذر المشكلة إلا بعد وقوعها.

التحدي الحقيقي لم يكن نقص البيانات — بل كثرتها بدون بنية تجعلها قابلة للتصرف.`,
      en: `The client operated a 200+ vehicle fleet across 14 warehouses with 7 different operational systems that didn't communicate with each other. Operational decisions were made manually by operations managers based on reports delayed by 4–8 hours.

The result: excess operational costs from wrong routing decisions, recurring unpredictable delays, and inability to identify root causes until after the fact.

The real challenge wasn't a lack of data — it was an abundance of data with no structure to make it actionable.`,
      fr: `Le client exploitait une flotte de 200+ véhicules dans 14 entrepôts avec 7 systèmes opérationnels différents qui ne communiquaient pas entre eux. Les décisions opérationnelles étaient prises manuellement par les responsables d'exploitation sur la base de rapports en retard de 4 à 8 heures.

Le résultat : des coûts opérationnels excessifs dus à de mauvaises décisions de routage, des retards récurrents imprévisibles et l'incapacité d'identifier les causes profondes qu'après coup.

Le vrai défi n'était pas un manque de données — c'était une abondance de données sans structure les rendant exploitables.`,
    },
    approach: {
      ar: `اخترنا نهج "Decision Layer First" — أي أننا بدأنا من السؤال: ما القرار الذي يجب أن يتخذه المدير بعد ثلاث ساعات؟ ثم عكسنا المسار لنحدد البيانات اللازمة.

بنينا pipeline بيانات موحّد يجمع إشارات GPS، بيانات مستودعات، جدول الطلبات، وأحوال الطقس في نموذج بيانات واحد. فوقه، نشرنا نموذج تعلم آلي لاكتشاف الشذوذ والتنبؤ بالتأخيرات قبل وقوعها.

الواجهة كانت dashboard واحد يعطي المدير "الثلاثة الأهم الآن" — لا تقارير، قرارات.`,
      en: `We chose a "Decision Layer First" approach — starting from the question: what decision must a manager make in three hours? Then we worked backwards to identify the required data.

We built a unified data pipeline aggregating GPS signals, warehouse data, order schedules, and weather conditions into a single data model. On top of it, we deployed an anomaly detection and delay prediction ML model that fires before issues occur.

The interface was a single dashboard giving managers "the top 3 things that need attention now" — not reports, decisions.`,
      fr: `Nous avons adopté une approche "Decision Layer First" — en partant de la question : quelle décision un manager doit-il prendre dans trois heures ? Puis nous avons remonté pour identifier les données nécessaires.

Nous avons construit un pipeline de données unifié agrégeant signaux GPS, données d'entrepôts, planning des commandes et conditions météo dans un seul modèle. Au-dessus, nous avons déployé un modèle ML de détection d'anomalies et de prédiction des retards qui se déclenche avant que les problèmes surviennent.

L'interface était un tableau de bord unique donnant aux managers "les 3 priorités immédiates" — pas des rapports, des décisions.`,
    },
    architecturalDecisions: [
      {
        title: {
          ar: "Event-Driven بدلاً من Batch Processing",
          en: "Event-Driven over Batch Processing",
          fr: "Architecture événementielle plutôt que traitement par lots",
        },
        rationale: {
          ar: "الـ batch reports كانت تصل متأخرة 4-8 ساعات — تحولنا لـ Kafka + streaming حتى تكون كل إشارة متاحة خلال ثوانٍ من حدوثها.",
          en: "Batch reports arrived 4–8 hours late — we shifted to Kafka + streaming so every signal is available within seconds of occurring.",
          fr: "Les rapports batch arrivaient avec 4 à 8 heures de retard — nous avons migré vers Kafka + streaming pour que chaque signal soit disponible en quelques secondes.",
        },
      },
      {
        title: {
          ar: "Feature Store مركزي للـ ML",
          en: "Centralized ML Feature Store",
          fr: "Feature Store ML centralisé",
        },
        rationale: {
          ar: "بدلاً من بناء نماذج لكل نظام منفصل، بنينا Feature Store يشاركه جميع النماذج — مما قلّص وقت تدريب نماذج جديدة من أسابيع إلى أيام.",
          en: "Instead of building separate models for each system, we built a Feature Store shared across all models — cutting new model training time from weeks to days.",
          fr: "Au lieu de construire des modèles séparés pour chaque système, nous avons construit un Feature Store partagé entre tous les modèles — réduisant le temps d'entraînement de nouveaux modèles de semaines à jours.",
        },
      },
      {
        title: {
          ar: "Explainable AI كمعيار غير قابل للتفاوض",
          en: "Explainable AI as a Non-Negotiable Standard",
          fr: "IA explicable comme standard non négociable",
        },
        rationale: {
          ar: "المديرون الميدانيون لن يثقوا بقرار لا يعرفون سببه. كل توصية يصحبها 'لماذا' مكتوبة بلغة طبيعية — وليس probability score فقط.",
          en: "Field managers won't trust a decision they don't understand the reason for. Every recommendation is accompanied by a 'why' written in natural language — not just a probability score.",
          fr: "Les managers terrain ne feront pas confiance à une décision dont ils ne comprennent pas la raison. Chaque recommandation est accompagnée d'un 'pourquoi' en langage naturel — pas seulement un score de probabilité.",
        },
      },
    ],
    technicalChallenges: [
      {
        challenge: {
          ar: "7 أنظمة بـ 7 schemas مختلفة لا يوجد بينها معيار موحّد",
          en: "7 systems with 7 different schemas and no shared standard",
          fr: "7 systèmes avec 7 schémas différents et aucun standard commun",
        },
        resolution: {
          ar: "بنينا طبقة Canonical Data Model تترجم كل نظام إلى نموذج موحّد — مع connectors قابلة للتوسع لأي نظام جديد دون تعديل الـ core.",
          en: "We built a Canonical Data Model layer that translates each system to a unified model — with extensible connectors for any new system without touching the core.",
          fr: "Nous avons construit une couche de Canonical Data Model qui traduit chaque système vers un modèle unifié — avec des connecteurs extensibles pour tout nouveau système sans toucher au cœur.",
        },
      },
      {
        challenge: {
          ar: "نماذج ML تفقد دقتها بعد تغييرات موسمية في أنماط التشغيل",
          en: "ML models losing accuracy after seasonal changes in operational patterns",
          fr: "Les modèles ML perdant leur précision après des changements saisonniers dans les modèles opérationnels",
        },
        resolution: {
          ar: "نشرنا نظام Model Drift Detection يرصد انجراف النموذج ويُعيد التدريب تلقائياً عند تجاوز عتبة الدقة — دون تدخل يدوي.",
          en: "We deployed a Model Drift Detection system that monitors model drift and automatically retrains when accuracy crosses a threshold — without manual intervention.",
          fr: "Nous avons déployé un système de détection de dérive qui surveille la dérive du modèle et se réentraîne automatiquement quand la précision franchit un seuil — sans intervention manuelle.",
        },
      },
    ],
    techStack: [
      "Python", "Apache Kafka", "Apache Flink", "FastAPI",
      "PostgreSQL", "Redis", "Scikit-learn", "MLflow",
      "Kubernetes", "Grafana", "OpenTelemetry",
    ],
    metrics: [
      {
        label: { ar: "تقليص وقت معالجة الحوادث", en: "Incident Resolution Time Reduced", fr: "Temps de résolution des incidents réduit" },
        value: "−42%",
        direction: "down",
      },
      {
        label: { ar: "مصادر بيانات مُوحَّدة في نموذج واحد", en: "Data Sources Unified", fr: "Sources de données unifiées" },
        value: "7",
        direction: "neutral",
      },
      {
        label: { ar: "تحسين دقة توقع التأخير", en: "Delay Prediction Accuracy", fr: "Précision de prédiction des retards" },
        value: "89%",
        direction: "up",
      },
      {
        label: { ar: "من البيانات إلى القرار", en: "Data to Decision Latency", fr: "Latence données → décision" },
        value: "< 30s",
        direction: "down",
      },
    ],
    clientQuote: {
      quote: {
        ar: "للمرة الأولى، مديرنا الميداني يعرف ما سيحدث قبل أن يحدث. هذا لم يكن مجرد نظام — كان تحولاً في طريقة تفكير الفريق.",
        en: "For the first time, our field manager knows what's going to happen before it happens. This wasn't just a system — it was a shift in how the team thinks.",
        fr: "Pour la première fois, notre manager terrain sait ce qui va se passer avant que ça arrive. Ce n'était pas juste un système — c'était un changement dans la façon de penser de l'équipe.",
      },
      role: { ar: "مدير العمليات", en: "Chief Operating Officer", fr: "Directeur des opérations" },
      org: { ar: "مشغّل لوجستيات إقليمي", en: "Regional Logistics Operator", fr: "Opérateur logistique régional" },
      initials: "AK",
    },
    relatedSlugs: ["multi-tenant-saas-scale", "zero-trust-soc"],
    publishedAt: "2024-11-01",
    readingTime: 8,
  },

  // ──────────────────────────────────────────────
  // CASE STUDY 2 — Zero-Trust SOC
  // ──────────────────────────────────────────────
  {
    slug: "zero-trust-soc",
    pillar: "cyber",
    industry: {
      ar: "الطاقة والبنية التحتية الحرجة",
      en: "Energy & Critical Infrastructure",
      fr: "Énergie & Infrastructure critique",
    },
    clientArchetype: {
      ar: "مشغّل بنية تحتية حرجة — أنظمة تحكم SCADA، 24/7 uptime مطلوب",
      en: "Critical Infrastructure Operator — SCADA control systems, 24/7 uptime required",
      fr: "Opérateur d'infrastructure critique — systèmes de contrôle SCADA, uptime 24/7 requis",
    },
    title: {
      ar: "أمن لا يفترض الثقة — بنية Zero-Trust لأنظمة التحكم الحرجة",
      en: "Security That Assumes Nothing — Zero-Trust for Critical Control Systems",
      fr: "Sécurité qui ne suppose rien — Zero-Trust pour les systèmes de contrôle critiques",
    },
    excerpt: {
      ar: "كيف صممنا بنية أمنية تتحقق من كل طلب — لا تفترض أن الشبكة الداخلية آمنة — وخفّضنا الإنذارات الكاذبة بنسبة 68٪ مع الاحتفاظ بـ 0 حوادث حرجة.",
      en: "How we designed a security architecture that verifies every request — never assumes the internal network is safe — reducing false positives by 68% while maintaining 0 critical incidents.",
      fr: "Comment nous avons conçu une architecture de sécurité qui vérifie chaque requête — sans jamais supposer que le réseau interne est sûr — réduisant les faux positifs de 68 % tout en maintenant 0 incident critique.",
    },
    problem: {
      ar: `أنظمة التحكم الصناعي (SCADA) للعميل كانت تعمل بأمان مصمم قبل 15 سنة — حيث كان الافتراض أن "من داخل الشبكة = موثوق". 

اليوم، مع توسع العمل عن بُعد واندماج الـ IT/OT، هذا الافتراض أصبح ثغرة.

إضافةً لذلك، كان فريق الأمن يغرق في آلاف الإنذارات يومياً — 73% منها false positives — مما جعل الإنذارات الحقيقية تضيع في الضجيج.

التحدي: تطبيق Zero-Trust دون المساس بـ availability أنظمة التحكم الحرج — لأن downtime ليس خياراً.`,
      en: `The client's industrial control systems (SCADA) were operating with security designed 15 years ago — when the assumption was "inside the network = trusted."

Today, with the expansion of remote work and IT/OT convergence, this assumption had become a vulnerability.

Additionally, the security team was drowning in thousands of daily alerts — 73% of which were false positives — causing real alerts to be lost in the noise.

The challenge: implement Zero-Trust without compromising the availability of critical control systems — because downtime was not an option.`,
      fr: `Les systèmes de contrôle industriel (SCADA) du client fonctionnaient avec une sécurité conçue il y a 15 ans — où l'hypothèse était "à l'intérieur du réseau = de confiance."

Aujourd'hui, avec l'expansion du télétravail et la convergence IT/OT, cette hypothèse était devenue une vulnérabilité.

De plus, l'équipe de sécurité se noyait dans des milliers d'alertes quotidiennes — 73 % étaient des faux positifs — faisant que les vraies alertes se perdaient dans le bruit.

Le défi : implémenter le Zero-Trust sans compromettre la disponibilité des systèmes de contrôle critiques — car l'indisponibilité n'était pas une option.`,
    },
    approach: {
      ar: `بدأنا بـ "Threat Modeling" شامل — لم نبدأ بتثبيت أدوات، بل بفهم: ما الذي يحاول المهاجم الوصول إليه، وما المسار الأقل مقاومة؟

من هناك، صممنا بنية Zero-Trust تدريجية: بدأنا بـ Identity (مصادقة متعددة العوامل + RBAC صارم)، ثم Network (micro-segmentation يعزل كل نظام SCADA)، ثم Workload (verification لكل process).

لمشكلة الإنذارات، بنينا طبقة SOAR مخصصة تصنّف الإنذارات تلقائياً وتربطها بـ threat intelligence — فتحوّل الفريق من "إطفاء حرائق" إلى "صيد تهديدات".`,
      en: `We started with comprehensive Threat Modeling — not by installing tools, but by understanding: what is the attacker trying to reach, and what's the path of least resistance?

From there, we designed a phased Zero-Trust architecture: starting with Identity (multi-factor authentication + strict RBAC), then Network (micro-segmentation isolating each SCADA system), then Workload (verification for every process).

For the alerts problem, we built a custom SOAR layer that automatically classifies alerts and correlates them with threat intelligence — transforming the team from "firefighting" to "threat hunting."`,
      fr: `Nous avons commencé par une modélisation des menaces complète — pas en installant des outils, mais en comprenant : qu'essaie d'atteindre l'attaquant, et quel est le chemin de moindre résistance ?

À partir de là, nous avons conçu une architecture Zero-Trust par phases : en commençant par l'Identité (authentification multi-facteurs + RBAC strict), puis le Réseau (micro-segmentation isolant chaque système SCADA), puis la Charge de travail (vérification de chaque processus).

Pour le problème des alertes, nous avons construit une couche SOAR personnalisée classifiant automatiquement les alertes et les corrélant avec la threat intelligence — transformant l'équipe du "combat d'incendies" à la "chasse aux menaces."`,
    },
    architecturalDecisions: [
      {
        title: {
          ar: "تطبيق تدريجي بدلاً من Big Bang",
          en: "Phased Rollout over Big Bang Implementation",
          fr: "Déploiement progressif plutôt qu'implémentation Big Bang",
        },
        rationale: {
          ar: "في أنظمة التحكم الحرجة، أي تغيير مفاجئ يمكن أن يكون كارثياً. فصّلنا التطبيق لـ 4 مراحل على 8 أشهر مع rollback plan لكل مرحلة.",
          en: "In critical control systems, any sudden change can be catastrophic. We split implementation into 4 phases over 8 months with a rollback plan for each phase.",
          fr: "Dans les systèmes de contrôle critiques, tout changement soudain peut être catastrophique. Nous avons divisé l'implémentation en 4 phases sur 8 mois avec un plan de retour arrière pour chaque phase.",
        },
      },
      {
        title: {
          ar: "Behavioral Analytics بدلاً من Signature-Based Detection",
          en: "Behavioral Analytics over Signature-Based Detection",
          fr: "Analytique comportementale plutôt que détection basée sur les signatures",
        },
        rationale: {
          ar: "الهجمات المتقدمة لا تترك توقيعاً معروفاً. بنينا نماذج baseline للسلوك الطبيعي — وكل انحراف يُشغّل تحقيقاً تلقائياً.",
          en: "Advanced attacks leave no known signature. We built behavioral baseline models — and every deviation triggers an automatic investigation.",
          fr: "Les attaques avancées ne laissent aucune signature connue. Nous avons construit des modèles de référence comportementaux — et chaque déviation déclenche une enquête automatique.",
        },
      },
    ],
    technicalChallenges: [
      {
        challenge: {
          ar: "أجهزة SCADA القديمة لا تدعم بروتوكولات المصادقة الحديثة",
          en: "Legacy SCADA devices not supporting modern authentication protocols",
          fr: "Les équipements SCADA legacy ne supportant pas les protocoles d'authentification modernes",
        },
        resolution: {
          ar: "نشرنا Authentication Proxy يتولى المصادقة الحديثة نيابةً عن الأجهزة القديمة — دون أي تعديل على firmware الأجهزة.",
          en: "We deployed an Authentication Proxy that handles modern authentication on behalf of legacy devices — without any firmware modification.",
          fr: "Nous avons déployé un Authentication Proxy qui gère l'authentification moderne pour le compte des équipements legacy — sans aucune modification du firmware.",
        },
      },
      {
        challenge: {
          ar: "micro-segmentation يمكن أن يكسر اتصالات OT مخفية بين الأنظمة",
          en: "Micro-segmentation could break hidden OT communications between systems",
          fr: "La micro-segmentation pouvant casser des communications OT cachées entre les systèmes",
        },
        resolution: {
          ar: "نفّذنا مرحلة discovery لمدة 30 يوماً نرصد فيها كل الاتصالات الحالية ونبني خريطة كاملة — ثم صمّمنا الـ segmentation بناءً على الواقع لا على الافتراضات.",
          en: "We ran a 30-day discovery phase monitoring all current communications and building a complete map — then designed segmentation based on reality, not assumptions.",
          fr: "Nous avons exécuté une phase de découverte de 30 jours surveillant toutes les communications actuelles et construisant une cartographie complète — puis conçu la segmentation sur la réalité, pas sur des hypothèses.",
        },
      },
    ],
    techStack: [
      "HashiCorp Vault", "Istio", "Wazuh", "TheHive",
      "Cortex", "MITRE ATT&CK", "Zeek", "Elastic SIEM",
      "Python", "Ansible", "Kubernetes",
    ],
    metrics: [
      {
        label: { ar: "تقليص الإنذارات الكاذبة", en: "False Positives Reduced", fr: "Faux positifs réduits" },
        value: "−68%",
        direction: "down",
      },
      {
        label: { ar: "وقت احتواء الحوادث", en: "Incident Containment Time", fr: "Temps de confinement des incidents" },
        value: "< 4h",
        direction: "down",
      },
      {
        label: { ar: "حوادث أمنية حرجة بعد التطبيق", en: "Critical Security Incidents Post-Implementation", fr: "Incidents de sécurité critiques post-implémentation" },
        value: "0",
        direction: "neutral",
      },
      {
        label: { ar: "مدة التطبيق التدريجي", en: "Phased Rollout Duration", fr: "Durée du déploiement progressif" },
        value: "8 months",
        direction: "neutral",
      },
    ],
    clientQuote: {
      quote: {
        ar: "طلبت منهم أن يجعلوا شبكتنا آمنة. ما لم أتوقعه أنهم سيعلّمون فريقنا كيف يفكر بطريقة مختلفة حول الأمن. الأدوات تُنسى — التفكير يبقى.",
        en: "I asked them to make our network secure. What I didn't expect was that they would teach our team to think differently about security. Tools are forgotten — thinking stays.",
        fr: "Je leur ai demandé de sécuriser notre réseau. Ce que je n'attendais pas, c'est qu'ils enseigneraient à notre équipe à penser différemment sur la sécurité. Les outils s'oublient — la façon de penser reste.",
      },
      role: { ar: "مدير أمن المعلومات", en: "Chief Information Security Officer", fr: "Responsable de la sécurité de l'information" },
      org: { ar: "مشغّل بنية تحتية حرجة", en: "Critical Infrastructure Operator", fr: "Opérateur d'infrastructure critique" },
      initials: "RH",
    },
    relatedSlugs: ["enterprise-ai-ops", "multi-tenant-saas-scale"],
    publishedAt: "2024-09-15",
    readingTime: 9,
  },

  // ──────────────────────────────────────────────
  // CASE STUDY 3 — Multi-Tenant SaaS at Scale
  // ──────────────────────────────────────────────
  {
    slug: "multi-tenant-saas-scale",
    pillar: "software",
    industry: {
      ar: "التكنولوجيا المالية",
      en: "Financial Technology",
      fr: "Technologie financière",
    },
    clientArchetype: {
      ar: "منصة SaaS مؤسسية — من pilot بـ 3 عملاء إلى إنتاج بـ 40+ مؤسسة",
      en: "Enterprise SaaS Platform — from pilot with 3 clients to production with 40+ institutions",
      fr: "Plateforme SaaS d'entreprise — du pilote avec 3 clients à la production avec 40+ institutions",
    },
    title: {
      ar: "من pilot إلى إنتاج: هندسة SaaS مصمّمة للتوسع الحقيقي",
      en: "From Pilot to Production: Engineering SaaS Built for Real Scale",
      fr: "Du pilote à la production : concevoir un SaaS pour une vraie mise à l'échelle",
    },
    excerpt: {
      ar: "كيف أعدنا هندسة منصة مؤسسية انتقلت من 3 إلى 40+ عميل في 6 أشهر — مع تقليص latency p95 بنسبة 60٪ وتفعيل دورة نشر 12 مرة شهرياً.",
      en: "How we re-architected an enterprise platform that scaled from 3 to 40+ clients in 6 months — reducing p95 latency by 60% and enabling a 12 deployments/month release cadence.",
      fr: "Comment nous avons re-architecturé une plateforme d'entreprise passée de 3 à 40+ clients en 6 mois — réduisant la latence p95 de 60 % et activant une cadence de 12 déploiements/mois.",
    },
    problem: {
      ar: `المنصة كانت تعمل بشكل مقبول مع 3 عملاء pilot. لكن عندما حاول الفريق توسيعها لـ 40+ مؤسسة، ظهرت المشاكل الحقيقية:

- كل عميل جديد يتطلب تعديلاً يدوياً في الكود (hard-coded configurations)
- الـ shared database schema تسرّب بيانات بين tenants في حالات edge
- response time ترتفع بشكل غير خطي مع زيادة الحمل
- فريق الـ 8 مطورين يقضي 40% من وقته في deployment يدوي وإصلاح بيئات مختلفة

كان الكود "يعمل" — لكنه لم يكن مصمماً للنمو.`,
      en: `The platform worked acceptably with 3 pilot clients. But when the team tried to scale it to 40+ institutions, the real problems emerged:

- Every new client required manual code changes (hard-coded configurations)
- The shared database schema leaked data between tenants in edge cases
- Response times rose non-linearly with load increases
- The 8-person dev team spent 40% of their time on manual deployment and fixing different environments

The code "worked" — but it wasn't designed for growth.`,
      fr: `La plateforme fonctionnait correctement avec 3 clients pilotes. Mais quand l'équipe a essayé de la mettre à l'échelle pour 40+ institutions, les vrais problèmes ont émergé :

- Chaque nouveau client nécessitait des modifications manuelles du code (configurations en dur)
- Le schéma de base de données partagé faisait fuir des données entre tenants dans des cas limites
- Les temps de réponse augmentaient de façon non linéaire avec la charge
- L'équipe de 8 développeurs passait 40 % de son temps en déploiement manuel et correction d'environnements différents

Le code "fonctionnait" — mais il n'était pas conçu pour la croissance.`,
    },
    approach: {
      ar: `بدأنا بـ "Architecture Audit" صريح — لم نبيع الفريق حلاً قبل أن نفهم الجذر. في الأسبوعين الأولين، رسمنا خريطة كاملة لكل dependency وكل نقطة ضعف.

القرار الاستراتيجي الأول: لا نكتب من الصفر. نحسّن ما هو موجود بشكل تدريجي دون توقف الإنتاج.

خطة 3 مراحل:
1. **Isolation** — فصل بيانات الـ tenants بشكل آمن (Row-Level Security + schema-per-tenant للعملاء الحساسين)
2. **Performance** — إعادة كتابة الـ queries الـ N+1، Redis caching، connection pooling
3. **Automation** — CI/CD pipeline كامل، Infrastructure as Code، tenant onboarding في أقل من 10 دقائق`,
      en: `We started with an honest "Architecture Audit" — not selling the team a solution before understanding the root cause. In the first two weeks, we mapped every dependency and every weakness.

First strategic decision: don't rewrite from scratch. Improve what exists incrementally without stopping production.

3-phase plan:
1. **Isolation** — securely separate tenant data (Row-Level Security + schema-per-tenant for sensitive clients)
2. **Performance** — rewrite N+1 queries, Redis caching, connection pooling
3. **Automation** — full CI/CD pipeline, Infrastructure as Code, tenant onboarding in under 10 minutes`,
      fr: `Nous avons commencé par un "Audit d'Architecture" honnête — sans vendre de solution avant de comprendre la cause profonde. Lors des deux premières semaines, nous avons cartographié chaque dépendance et chaque point faible.

Première décision stratégique : ne pas réécrire from scratch. Améliorer ce qui existe de façon incrémentale sans arrêter la production.

Plan en 3 phases :
1. **Isolation** — séparer les données des tenants de manière sécurisée (Row-Level Security + schema-par-tenant pour les clients sensibles)
2. **Performance** — réécrire les requêtes N+1, cache Redis, connection pooling
3. **Automation** — pipeline CI/CD complet, Infrastructure as Code, onboarding d'un tenant en moins de 10 minutes`,
    },
    architecturalDecisions: [
      {
        title: {
          ar: "Row-Level Security بدلاً من Application-Level Filtering",
          en: "Row-Level Security over Application-Level Filtering",
          fr: "Row-Level Security plutôt que filtrage au niveau application",
        },
        rationale: {
          ar: "الـ application filtering يمكن أن يُتجاوز بـ bug واحد. RLS في قاعدة البيانات يجعل التسريب مستحيلاً حتى لو كان في الكود خطأ — لأن الـ database نفسها تفرض الحدود.",
          en: "Application filtering can be bypassed by a single bug. RLS in the database makes data leakage impossible even if there's a code error — because the database itself enforces boundaries.",
          fr: "Le filtrage applicatif peut être contourné par un seul bug. Le RLS dans la base de données rend les fuites de données impossibles même en cas d'erreur dans le code — car la base de données elle-même impose les limites.",
        },
      },
      {
        title: {
          ar: "Trunk-Based Development + Feature Flags",
          en: "Trunk-Based Development + Feature Flags",
          fr: "Développement trunk-based + Feature Flags",
        },
        rationale: {
          ar: "القديم: branches طويلة تُسبب merge hell. الجديد: كل الفريق يكتب على trunk واحد مع feature flags تتحكم في التفعيل — مما أتاح النشر 12 مرة شهرياً بدون chaos.",
          en: "The old way: long branches causing merge hell. The new: the whole team writes to one trunk with feature flags controlling activation — enabling 12 deployments/month without chaos.",
          fr: "L'ancienne façon : branches longues causant le merge hell. La nouvelle : toute l'équipe écrit sur un trunk avec des feature flags contrôlant l'activation — permettant 12 déploiements/mois sans chaos.",
        },
      },
      {
        title: {
          ar: "Observability First — ليس Monitoring",
          en: "Observability First — Not Monitoring",
          fr: "Observabilité d'abord — pas monitoring",
        },
        rationale: {
          ar: "الـ monitoring يخبرك أن هناك مشكلة. الـ observability تخبرك لماذا. نشرنا OpenTelemetry على كامل الـ stack — traces، metrics، logs في مكان واحد — لأن debugging في multi-tenant بدون observability هو حفر في الظلام.",
          en: "Monitoring tells you there's a problem. Observability tells you why. We deployed OpenTelemetry across the full stack — traces, metrics, logs in one place — because debugging in multi-tenant without observability is digging in the dark.",
          fr: "Le monitoring vous dit qu'il y a un problème. L'observabilité vous dit pourquoi. Nous avons déployé OpenTelemetry sur tout le stack — traces, métriques, logs en un seul endroit — car debugger en multi-tenant sans observabilité, c'est creuser dans le noir.",
        },
      },
    ],
    technicalChallenges: [
      {
        challenge: {
          ar: "ترحيل بيانات 3 عملاء حاليين للـ schema الجديد بدون downtime",
          en: "Migrating 3 existing clients' data to the new schema with zero downtime",
          fr: "Migration des données de 3 clients existants vers le nouveau schéma sans interruption",
        },
        resolution: {
          ar: "استخدمنا نمط Expand-Contract Migration: أضفنا الـ schema الجديد بجانب القديم، كتبنا البيانات للاثنين في مرحلة انتقالية، ثم قطعنا القديم بعد التحقق — كل هذا دون إيقاف الإنتاج.",
          en: "We used the Expand-Contract Migration pattern: added the new schema alongside the old, dual-wrote during transition, then cut over after verification — all without stopping production.",
          fr: "Nous avons utilisé le pattern Expand-Contract Migration : ajouté le nouveau schéma à côté de l'ancien, écrit dans les deux pendant la transition, puis basculé après vérification — sans arrêter la production.",
        },
      },
      {
        challenge: {
          ar: "بعض العملاء المؤسسيين يرفضون البيانات المشتركة حتى مع RLS",
          en: "Some enterprise clients refusing shared data even with RLS",
          fr: "Certains clients entreprise refusant les données partagées même avec RLS",
        },
        resolution: {
          ar: "بنينا نموذج hybrid: schema-per-tenant لمن يتطلب عزلاً كاملاً، مع shared schema + RLS للباقين — وكلاهما يعمل على نفس الـ codebase بـ config واحد.",
          en: "We built a hybrid model: schema-per-tenant for those requiring full isolation, shared schema + RLS for others — both running on the same codebase with a single config.",
          fr: "Nous avons construit un modèle hybride : schema-par-tenant pour ceux nécessitant une isolation complète, schema partagé + RLS pour les autres — les deux tournant sur le même codebase avec une seule configuration.",
        },
      },
    ],
    techStack: [
      "Node.js", "TypeScript", "PostgreSQL", "Prisma",
      "Redis", "Docker", "Kubernetes", "GitHub Actions",
      "OpenTelemetry", "Grafana", "Terraform", "Next.js",
    ],
    metrics: [
      {
        label: { ar: "تقليص latency p95", en: "p95 Latency Reduction", fr: "Réduction de la latence p95" },
        value: "−60%",
        direction: "down",
      },
      {
        label: { ar: "دورة النشر الشهرية", en: "Monthly Deployment Cadence", fr: "Cadence de déploiement mensuelle" },
        value: "12×",
        direction: "up",
      },
      {
        label: { ar: "وقت onboarding عميل جديد", en: "New Tenant Onboarding Time", fr: "Temps d'onboarding d'un nouveau tenant" },
        value: "< 10 min",
        direction: "down",
      },
      {
        label: { ar: "توسع من pilot إلى إنتاج خلال", en: "Pilot to Production Scale", fr: "Passage pilote à production" },
        value: "6 months",
        direction: "neutral",
      },
    ],
    clientQuote: {
      quote: {
        ar: "كنت أخشى أن 'نعيد الهندسة' تعني 'نتأخر سنة'. T.E.N.E.G.T.A أثبتت أن إعادة الهندسة الجيدة لا تبطّئك — تحررك.",
        en: "I feared 're-architecting' meant 'delayed by a year.' T.E.N.E.G.T.A proved that good re-architecture doesn't slow you down — it liberates you.",
        fr: "Je craignais que 're-architecturer' signifie 'retard d'un an'. T.E.N.E.G.T.A a prouvé qu'une bonne re-architecture ne vous ralentit pas — elle vous libère.",
      },
      role: { ar: "الرئيس التنفيذي للتقنية", en: "Chief Technology Officer", fr: "Directeur technique" },
      org: { ar: "منصة SaaS مؤسسية", en: "Enterprise SaaS Platform", fr: "Plateforme SaaS d'entreprise" },
      initials: "DL",
    },
    relatedSlugs: ["enterprise-ai-ops", "zero-trust-soc"],
    publishedAt: "2024-10-10",
    readingTime: 10,
  },
];

// helper
export function getCaseStudyBySlug(slug: string): DeepCaseStudy | undefined {
  return deepCaseStudies.find((cs) => cs.slug === slug);
}

export function getRelatedCaseStudies(slug: string): DeepCaseStudy[] {
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return [];
  return deepCaseStudies.filter((s) => cs.relatedSlugs.includes(s.slug));
}
