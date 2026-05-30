/**
 * Portfolio projects — client delivery stories (simple language, enterprise scale).
 */

import type { Localized, ProjectCard } from "@/lib/fallback-data";
import { additionalProjects } from "./projects-additions";

export type ProjectFormat = "system" | "website" | "mobile";

export interface ProjectMetric {
  label: Localized;
  value: string;
  direction: "down" | "up" | "neutral";
}

export interface ProjectDeliverable {
  title: Localized;
  description: Localized;
}

export interface ProjectClientQuote {
  quote: Localized;
  role: Localized;
  org: Localized;
  initials: string;
}

export interface DeepProject {
  slug: string;
  pillar: "ai" | "cyber" | "software" | "infra";
  formats: ProjectFormat[];
  industry: Localized;
  clientContext: Localized;
  title: Localized;
  excerpt: Localized;
  context: Localized;
  challenge: Localized;
  solution: Localized;
  results: Localized;
  deliverables: ProjectDeliverable[];
  metrics: ProjectMetric[];
  techStack: string[];
  timeline: Localized;
  scope: Localized;
  publishedAt: string;
  relatedSlugs: string[];
  clientQuote?: ProjectClientQuote;
}

const coreProjects: DeepProject[] = [
  {
    slug: "identity-access-modernization",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "القطاع العام",
      en: "Public sector",
      fr: "Secteur public",
    },
    clientContext: {
      ar: "جهة حكومية — 8,500 موظف ومواطن، 120 خدمة رقمية",
      en: "Government entity — 8,500 staff & citizens, 120 digital services",
      fr: "Entité publique — 8 500 usagers, 120 services numériques",
    },
    title: {
      ar: "بوابة خدمات حكومية — موقع + تطبيق + دخول موحّد",
      en: "Government services portal — website, app & single sign-on",
      fr: "Portail services publics — site, app & connexion unique",
    },
    excerpt: {
      ar: "موقع ويب ضخم بثلاث لغات، تطبيق iOS وAndroid، ونظام دخول واحد لـ 120 خدمة — بدون 15 كلمة مرور مختلفة.",
      en: "Large trilingual website, iOS & Android apps, and one login for 120 services — no more 15 different passwords.",
      fr: "Grand site trilingue, apps iOS & Android, une connexion pour 120 services.",
    },
    context: {
      ar: `الجهة كانت تملك مواقع متفرقة وتطبيقات قديمة. المواطن يحتاج حسابات مختلفة لكل خدمة. الموظف ينتظر أياماً للحصول على صلاحية.

طلب العميل واضح: تجربة واحدة — موقع احترافي، تطبيق موبايل، ودخول آمن — يشعر المواطن أنه يتعامل مع جهة واحدة وليس 15 نظاماً.`,
      en: `The entity had scattered websites and outdated apps. Citizens needed different accounts per service. Staff waited days for access approvals.

The ask was clear: one experience — a professional website, mobile app, and secure login — so citizens feel they deal with one organization, not 15 systems.`,
      fr: `Sites dispersés et apps obsolètes. Comptes multiples par service. Délais d'accès longs pour les agents.

Demande claire : une expérience unique — site professionnel, app mobile, connexion sécurisée.`,
    },
    challenge: {
      ar: `• 15 نظام دخول منفصل
• موقع قديم غير متجاوب مع الجوال
• لا تطبيق رسمي للخدمات الشائعة
• طلبات الصلاحيات تستغرق 5–10 أيام`,
      en: `• 15 separate login systems
• Old website not mobile-friendly
• No official app for common services
• Access requests took 5–10 days`,
      fr: `• 15 systèmes de connexion
• Site non adapté mobile
• Pas d'app officielle
• Accès : 5–10 jours d'attente`,
    },
    solution: {
      ar: `صمّمنا وبرمجنا من الصفر:

• موقع ويب حديث — 120+ صفحة خدمة، عربي/إنجليزي/فرنسي، متجاوب بالكامل
• تطبيق iOS وAndroid — 40 خدمة الأكثر استخداماً offline-ready
• نظام دخول موحّد — حساب واحد لكل الخدمات
• لوحة إدارية للموظفين — إدارة صلاحيات وتقارير

كل شيء مبني بمعايير أمان عالية وقابل للتوسع.`,
      en: `We designed and built from scratch:

• Modern website — 120+ service pages, Arabic/English/French, fully responsive
• iOS & Android apps — top 40 services with offline support where needed
• Single sign-on — one account for all services
• Admin panel for staff — permissions and audit reports

Built to high security standards and ready to scale.`,
      fr: `Conception et développement complets :

• Site moderne — 120+ pages, ar/en/fr, responsive
• Apps iOS & Android — 40 services clés
• Connexion unique — un compte pour tout
• Panneau admin — droits et audits`,
    },
    results: {
      ar: `انخفضت طلبات «نسيت كلمة المرور» بنسبة 60%. 40 تطبيقاً وخدمة على الدخول الموحّد. الموقع الجديد يخدم آلاف الزيارات يومياً. اجتازت الجهة التدقيق الخارجي بدون ملاحظات حرجة.`,
      en: `"Forgot password" requests dropped 60%. 40 apps on unified login. New site handles thousands of daily visits. Passed external audit with no critical findings.`,
      fr: `Demandes mot de passe −60 %. 40 apps sur SSO. Site : milliers de visites/jour. Audit externe réussi.`,
    },
    deliverables: [
      {
        title: { ar: "موقع الخدمات", en: "Services website", fr: "Site services" },
        description: { ar: "120+ صفحة، 3 لغات، SEO وإمكانية وصول", en: "120+ pages, 3 languages, SEO & accessibility", fr: "120+ pages, 3 langues, SEO & accessibilité" },
      },
      {
        title: { ar: "تطبيق الموبايل", en: "Mobile apps", fr: "Apps mobile" },
        description: { ar: "iOS + Android، إشعارات، offline جزئي", en: "iOS + Android, push, partial offline", fr: "iOS + Android, notifications" },
      },
      {
        title: { ar: "نظام الدخول", en: "Identity system", fr: "Système identité" },
        description: { ar: "حساب واحد، صلاحيات واضحة", en: "One account, clear permissions", fr: "Un compte, droits clairs" },
      },
      {
        title: { ar: "لوحة الإدارة", en: "Admin dashboard", fr: "Tableau admin" },
        description: { ar: "تقارير ومراجعة صلاحيات", en: "Reports & access reviews", fr: "Rapports & revues accès" },
      },
    ],
    metrics: [
      { label: { ar: "طلبات الدخول", en: "Access tickets", fr: "Tickets accès" }, value: "−60%", direction: "down" },
      { label: { ar: "صفحات الموقع", en: "Website pages", fr: "Pages site" }, value: "120+", direction: "neutral" },
      { label: { ar: "خدمات على SSO", en: "Services on SSO", fr: "Services SSO" }, value: "40", direction: "up" },
      { label: { ar: "لغات", en: "Languages", fr: "Langues" }, value: "3", direction: "neutral" },
    ],
    techStack: ["Next.js", "React Native", "PostgreSQL", "Keycloak", "TypeScript", "Docker"],
    timeline: { ar: "10 أشهر", en: "10 months", fr: "10 mois" },
    scope: { ar: "8,500 مستخدم · 120 خدمة · 3 لغات", en: "8,500 users · 120 services · 3 languages", fr: "8 500 users · 120 services · 3 langues" },
    publishedAt: "2025-03-01",
    relatedSlugs: ["corporate-web-ecosystem", "smart-city-citizen-platform"],
    clientQuote: {
      quote: {
        ar: "أخيراً أصبحت الخدمات الرقمية تبدو كجهة واحدة — المواطن لا يحتاج خمس حسابات لإنجاز معاملة واحدة.",
        en: "Digital services finally feel like one organization — citizens no longer need five accounts for a single transaction.",
        fr: "Les services numériques ressemblent enfin à une seule entité — plus besoin de cinq comptes pour une démarche.",
      },
      role: { ar: "مدير التحول الرقمي", en: "Head of digital transformation", fr: "Directeur transformation digitale" },
      org: { ar: "البوابة الرقمية للخدمات الحكومية", en: "Digital Government Services Portal", fr: "Portail numérique des services publics" },
      initials: "DT",
    },
  },
  {
    slug: "secure-delivery-pipeline",
    pillar: "software",
    formats: ["website", "system"],
    industry: {
      ar: "FinTech / SaaS",
      en: "FinTech / SaaS",
      fr: "FinTech / SaaS",
    },
    clientContext: {
      ar: "منصة B2B — 12,000 عميل، 40 وحدة برمجية، 200+ شاشة",
      en: "B2B platform — 12,000 customers, 40 modules, 200+ screens",
      fr: "Plateforme B2B — 12 000 clients, 40 modules, 200+ écrans",
    },
    title: {
      ar: "منصة SaaS للأعمال — موقع ويب ضخم يعمل 24/7",
      en: "B2B SaaS platform — large web product running 24/7",
      fr: "Plateforme SaaS B2B — grand produit web 24/7",
    },
    excerpt: {
      ar: "برمجنا منصة كاملة: لوحات تحكم، تقارير، فوترة، وصلاحيات — 12,000 عميل نشط ونشر آمن كل أسبوع.",
      en: "Full platform build: dashboards, billing, reports, roles — 12,000 active customers and safe weekly releases.",
      fr: "Plateforme complète : tableaux, facturation, rapports — 12 000 clients actifs.",
    },
    context: {
      ar: `الشركة نمت من 500 إلى 12,000 عميل خلال سنتين. المنتج القديم لم يعد يتحمل الحمل. النشر كان مرعباً — كل إصدار خطر على العملاء.

احتاجوا منصة ويب احترافية: سريعة، آمنة، سهلة التطوير، وتنشر بثقة.`,
      en: `The company grew from 500 to 12,000 customers in two years. The old product couldn't keep up. Releases were risky — every deploy scared the team.

They needed a professional web platform: fast, secure, easy to extend, and safe to ship.`,
      fr: `Croissance 500 → 12 000 clients. Produit legacy saturé. Déploiements risqués.

Besoin d'une plateforme web pro : rapide, sécurisée, évolutive.`,
    },
    challenge: {
      ar: `• 200+ شاشة مبعثرة في كود قديم
• بطء في أوقات الذروة
• أخطاء بعد كل نشر
• صعب إضافة ميزة جديدة`,
      en: `• 200+ screens in legacy code
• Slow at peak hours
• Bugs after every release
• Hard to add new features`,
      fr: `• 200+ écrans legacy
• Lenteur aux pics
• Bugs après chaque release
• Features difficiles à ajouter`,
    },
    solution: {
      ar: `أعدنا بناء المنصة على أساس حديث:

• واجهة ويب موحّدة — React/Next.js، تصميم متسق، تجربة سلسة
• 40 وحدة (فوترة، تقارير، إعدادات، تكاملات…) مرتبطة بـ API واحد
• نظام صلاحيات — كل عميل يرى ما يخصه فقط
• نشر آلي — تحديثات أسبوعية بدون توقف الخدمة

فريقنا handled التصميم، البرمجة، الاختبار، والنشر.`,
      en: `We rebuilt on a modern foundation:

• Unified web UI — React/Next.js, consistent design, smooth UX
• 40 modules (billing, reports, settings, integrations…) on one API
• Role system — each customer sees only their data
• Automated deploys — weekly updates without downtime

Our team handled design, development, testing, and release.`,
      fr: `Reconstruction moderne :

• UI web unifiée — React/Next.js
• 40 modules sur une API
• Rôles & isolation client
• Déploiements automatiques sans coupure`,
    },
    results: {
      ar: `المنصة تخدم 12,000 عميل بثبات. زمن تحميل الصفحات −45%. حوادث النشر −70%. فريق المنتج يطلق ميزات أسرع بـ 35%.`,
      en: `Platform serves 12,000 customers reliably. Page load −45%. Release incidents −70%. Product team ships 35% faster.`,
      fr: `12 000 clients servis. Chargement −45 %. Incidents release −70 %. Livraison +35 %.`,
    },
    deliverables: [
      {
        title: { ar: "المنتج الأساسي", en: "Core product", fr: "Produit cœur" },
        description: { ar: "200+ شاشة، 40 وحدة", en: "200+ screens, 40 modules", fr: "200+ écrans, 40 modules" },
      },
      {
        title: { ar: "API موحّد", en: "Unified API", fr: "API unifiée" },
        description: { ar: "REST + توثيق + اختبارات", en: "REST + docs + tests", fr: "REST + docs + tests" },
      },
      {
        title: { ar: "نظام النشر", en: "Release pipeline", fr: "Pipeline release" },
        description: { ar: "نشر آمن أسبوعي", en: "Safe weekly releases", fr: "Releases hebdo sécurisées" },
      },
      {
        title: { ar: "مراقبة", en: "Monitoring", fr: "Monitoring" },
        description: { ar: "تنبيهات قبل أن يلاحظ العميل", en: "Alerts before customers notice", fr: "Alertes proactives" },
      },
    ],
    metrics: [
      { label: { ar: "عملاء نشطون", en: "Active customers", fr: "Clients actifs" }, value: "12K", direction: "up" },
      { label: { ar: "سرعة التحميل", en: "Page speed", fr: "Vitesse pages" }, value: "−45%", direction: "down" },
      { label: { ar: "حوادث النشر", en: "Release incidents", fr: "Incidents release" }, value: "−70%", direction: "down" },
      { label: { ar: "شاشات", en: "Screens", fr: "Écrans" }, value: "200+", direction: "neutral" },
    ],
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "GitHub Actions", "AWS"],
    timeline: { ar: "14 شهراً", en: "14 months", fr: "14 mois" },
    scope: { ar: "12K عميل · 40 وحدة · فريق 8", en: "12K customers · 40 modules · team of 8", fr: "12 K clients · 40 modules · équipe 8" },
    publishedAt: "2025-04-01",
    relatedSlugs: ["realtime-payment-platform", "data-platform-governance"],
    clientQuote: {
      quote: {
        ar: "النشر أصبح أسبوعياً بثقة — والعملاء لا يشعرون بأي توقف.",
        en: "We ship weekly with confidence now — customers don't feel any downtime.",
        fr: "Nous livrons chaque semaine en confiance — sans coupure ressentie par les clients.",
      },
      role: { ar: "مدير المنتج", en: "Head of product", fr: "Directeur produit" },
      org: { ar: "منصة SaaS للأعمال", en: "Enterprise SaaS Platform", fr: "Plateforme SaaS enterprise" },
      initials: "HP",
    },
  },
  {
    slug: "data-platform-governance",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "الرعاية الصحية",
      en: "Healthcare",
      fr: "Santé",
    },
    clientContext: {
      ar: "شبكة عيادات — 22 فرع، 180,000 زيارة/سنة",
      en: "Clinic network — 22 branches, 180,000 visits/year",
      fr: "Réseau cliniques — 22 sites, 180 000 visites/an",
    },
    title: {
      ar: "نظام شبكة عيادات — موقع مرضى + تطبيق + لوحة إدارية",
      en: "Clinic network system — patient site, app & admin",
      fr: "Réseau cliniques — site patients, app & admin",
    },
    excerpt: {
      ar: "موقع حجز للمرضى، تطبيق موبايل، ونظام داخلي يربط 22 عيادة — بيانات واحدة، تجربة واحدة.",
      en: "Patient booking website, mobile app, and internal system linking 22 clinics — one data layer, one experience.",
      fr: "Site de réservation, app mobile, système interne — 22 cliniques connectées.",
    },
    context: {
      ar: `كل عيادة كانت تعمل بنظام مختلف. المريض يتصل بالهاتف للحجز. لا موقع موحّد. الأطباء لا يرون التاريخ الكامل.

الإدارة أرادت: موقع احترافي للمرضى، تطبيق للتذكير والنتائج، ونظام خلفي يربط الفروع — بخصوصية وامتثال.`,
      en: `Each clinic ran different tools. Patients booked by phone. No unified website. Doctors couldn't see full history.

Leadership wanted: a professional patient website, app for reminders and results, and a backend linking branches — with privacy and compliance.`,
      fr: `Outils différents par clinique. Réservation par téléphone. Pas de site unifié.

Objectif : site patients, app rappels/résultats, backend unifié conforme.`,
    },
    challenge: {
      ar: `• 14 مصدر بيانات منفصل
• حجز يدوي — انتظار طويل
• لا تجربة رقمية للمريض
• تقارير الإدارة تستغرق أياماً`,
      en: `• 14 separate data sources
• Manual booking — long waits
• No digital patient experience
• Management reports took days`,
      fr: `• 14 sources de données
• Réservation manuelle
• Pas d'expérience digitale patient
• Rapports : plusieurs jours`,
    },
    solution: {
      ar: `بنينا نظاماً متكاملاً:

• موقع ويب للمرضى — حجز، نتائج، ملف شخصي، 3 لغات
• تطبيق iOS/Android — تذكيرات، إشعارات، محادثة آمنة
• لوحة إدارية — جداول الأطباء، تقارير، صلاحيات لكل فرع
• قاعدة بيانات موحّدة — مريض واحد عبر 22 عيادة

صممنا الواجهات لتكون بسيطة للمريض وقوية للطاقم.`,
      en: `We built an integrated system:

• Patient website — booking, results, profile, 3 languages
• iOS/Android app — reminders, notifications, secure messaging
• Admin dashboard — schedules, reports, branch-level permissions
• Unified database — one patient record across 22 clinics

Interfaces simple for patients, powerful for staff.`,
      fr: `Système intégré :

• Site patients — RDV, résultats, profil
• Apps iOS/Android — rappels, notifications
• Admin — plannings, rapports, droits par site
• Base unifiée — un dossier patient, 22 cliniques`,
    },
    results: {
      ar: `80% الحجوزات أصبحت online. وقت انتظار المريض −35%. تقارير الإدارة من أيام إلى ساعات. نموذجان للمساعدة في التشخيص approved للاستخدام.`,
      en: `80% of bookings moved online. Patient wait −35%. Management reports: days → hours. Two assistive models approved for use.`,
      fr: `80 % réservations en ligne. Attente −35 %. Rapports : jours → heures.`,
    },
    deliverables: [
      {
        title: { ar: "بوابة المرضى", en: "Patient portal", fr: "Portail patients" },
        description: { ar: "حجز ونتائج وملف", en: "Booking, results, profile", fr: "RDV, résultats, profil" },
      },
      {
        title: { ar: "تطبيق الموبايل", en: "Mobile app", fr: "App mobile" },
        description: { ar: "تذكيرات وإشعارات", en: "Reminders & push", fr: "Rappels & push" },
      },
      {
        title: { ar: "نظام الإدارة", en: "Admin system", fr: "Système admin" },
        description: { ar: "22 فرع على منصة واحدة", en: "22 branches, one platform", fr: "22 sites, une plateforme" },
      },
      {
        title: { ar: "تكامل البيانات", en: "Data integration", fr: "Intégration données" },
        description: { ar: "14 مصدر → سجل واحد", en: "14 sources → one record", fr: "14 sources → un dossier" },
      },
    ],
    metrics: [
      { label: { ar: "حجز online", en: "Online booking", fr: "Réservation en ligne" }, value: "80%", direction: "up" },
      { label: { ar: "وقت الانتظار", en: "Wait time", fr: "Temps d'attente" }, value: "−35%", direction: "down" },
      { label: { ar: "عيادات", en: "Clinics", fr: "Cliniques" }, value: "22", direction: "neutral" },
      { label: { ar: "زيارات/سنة", en: "Visits/year", fr: "Visites/an" }, value: "180K", direction: "neutral" },
    ],
    techStack: ["Next.js", "React Native", "PostgreSQL", "Node.js", "TypeScript", "HL7 FHIR"],
    timeline: { ar: "18 شهراً", en: "18 months", fr: "18 mois" },
    scope: { ar: "22 عيادة · 180K زيارة · 3 لغات", en: "22 clinics · 180K visits · 3 languages", fr: "22 cliniques · 180 K visites · 3 langues" },
    publishedAt: "2025-05-01",
    relatedSlugs: ["customer-ops-triage", "identity-access-modernization"],
  },
  {
    slug: "customer-ops-triage",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "الاتصالات والخدمات",
      en: "Telecom & services",
      fr: "Télécom & services",
    },
    clientContext: {
      ar: "مزود خدمات — 45,000 عميل، 120 موظف دعم",
      en: "Services provider — 45,000 customers, 120 support staff",
      fr: "Fournisseur — 45 000 clients, 120 agents support",
    },
    title: {
      ar: "منصة خدمة العملاء — ويب + موبايل للموظف والعميل",
      en: "Customer service platform — web & mobile for staff and clients",
      fr: "Plateforme support client — web & mobile",
    },
    excerpt: {
      ar: "موقع ويب وتطبيق للعملاء، ولوحة للموظفين — 12,000 تذكرة/شهر تُفرَز تلقائياً وتُوجّه للقسم الصحيح.",
      en: "Customer website and app, staff dashboard — 12,000 tickets/month auto-sorted to the right team.",
      fr: "Site et app clients, dashboard agents — 12 000 tickets/mois triés automatiquement.",
    },
    context: {
      ar: `العملاء يتواصلون عبر الموقع، الواتساب، البريد، والهاتف. الموظفون يقفزون بين 4 برامج. التذكرة تضيع أو تُرسل للقسم الخاطئ.

الهدف: منصة واحدة — العميل يرى حالة طلبه، والموظف يرى كل شيء في مكان واحد.`,
      en: `Customers reach out via website, WhatsApp, email, and phone. Staff jumped between 4 tools. Tickets got lost or misrouted.

Goal: one platform — customers see request status, staff see everything in one place.`,
      fr: `Clients : site, WhatsApp, email, téléphone. Agents : 4 outils. Tickets perdus ou mal routés.

Objectif : une plateforme — statut client + vue unifiée agents.`,
    },
    challenge: {
      ar: `• 12,000 طلب/شهر
• 35% تُرسل للقسم الخاطئ
• العميل لا يعرف حالة طلبه
• وقت انتظار مرتفع`,
      en: `• 12,000 requests/month
• 35% sent to wrong team
• Customers couldn't track status
• Long wait times`,
      fr: `• 12 000 demandes/mois
• 35 % mal routées
• Pas de suivi client
• Attente longue`,
    },
    solution: {
      ar: `برمجنا منصة متكاملة:

• موقع ويب للعملاء — فتح تذكرة، متابعة، FAQ
• تطبيق موبايل — إشعارات فورية بحالة الطلب
• لوحة الموظف — كل القنوات في شاشة واحدة
• فرز ذكي — التذكرة تذهب تلقائياً للفريق المناسب

واجهات بسيطة. تحتها نظام قوي يتحمل آلاف الطلبات.`,
      en: `We built an integrated platform:

• Customer website — open ticket, track, FAQ
• Mobile app — instant status notifications
• Staff dashboard — all channels in one screen
• Smart routing — tickets go to the right team automatically

Simple interfaces. Robust system handling thousands of requests.`,
      fr: `Plateforme intégrée :

• Site clients — ticket, suivi, FAQ
• App — notifications statut
• Dashboard agents — tous canaux
• Routage intelligent automatique`,
    },
    results: {
      ar: `التوجيه الخاطئ −52%. وقت انتظار العميل −28%. 89% رضا عن «معرفة حالة الطلب». الموظفون يعملون من شاشة واحدة.`,
      en: `Misrouting −52%. Customer wait −28%. 89% satisfied with request visibility. Staff work from one screen.`,
      fr: `Misroute −52 %. Attente −28 %. 89 % satisfaits du suivi.`,
    },
    deliverables: [
      {
        title: { ar: "بوابة العملاء", en: "Customer portal", fr: "Portail clients" },
        description: { ar: "تذاكر ومتابعة", en: "Tickets & tracking", fr: "Tickets & suivi" },
      },
      {
        title: { ar: "تطبيق العميل", en: "Customer app", fr: "App client" },
        description: { ar: "إشعارات وحالة", en: "Push & status", fr: "Push & statut" },
      },
      {
        title: { ar: "لوحة الموظف", en: "Agent workspace", fr: "Espace agent" },
        description: { ar: "6 قنوات → مكان واحد", en: "6 channels → one place", fr: "6 canaux → un écran" },
      },
      {
        title: { ar: "فرز ذكي", en: "Smart routing", fr: "Routage intelligent" },
        description: { ar: "عربي + إنجليزي", en: "Arabic + English", fr: "Arabe + anglais" },
      },
    ],
    metrics: [
      { label: { ar: "وقت الانتظار", en: "Wait time", fr: "Attente" }, value: "−28%", direction: "down" },
      { label: { ar: "توجيه خاطئ", en: "Misrouting", fr: "Misroute" }, value: "−52%", direction: "down" },
      { label: { ar: "تذاكر/شهر", en: "Tickets/month", fr: "Tickets/mois" }, value: "12K", direction: "neutral" },
      { label: { ar: "رضا التتبع", en: "Tracking satisfaction", fr: "Satisfaction suivi" }, value: "89%", direction: "up" },
    ],
    techStack: ["Next.js", "React Native", "PostgreSQL", "Redis", "TypeScript", "WebSockets"],
    timeline: { ar: "5 أشهر", en: "5 months", fr: "5 mois" },
    scope: { ar: "45K عميل · 120 موظف · 6 قنوات", en: "45K customers · 120 staff · 6 channels", fr: "45 K clients · 120 agents · 6 canaux" },
    publishedAt: "2025-10-01",
    relatedSlugs: ["secure-delivery-pipeline", "ai-operations-platform"],
  },
  {
    slug: "corporate-web-ecosystem",
    pillar: "software",
    formats: ["website"],
    industry: {
      ar: "مجموعة holding",
      en: "Holding group",
      fr: "Groupe holding",
    },
    clientContext: {
      ar: "5 علامات تجارية — 3 دول، موقع لكل علامة + موقع أم",
      en: "5 brands — 3 countries, site per brand + corporate hub",
      fr: "5 marques — 3 pays, site par marque + hub corporate",
    },
    title: {
      ar: "مجموعة مواقع مؤسسية — 5 علامات × 3 لغات",
      en: "Corporate web ecosystem — 5 brands × 3 languages",
      fr: "Écosystème web corporate — 5 marques × 3 langues",
    },
    excerpt: {
      ar: "15 موقعاً مترابطاً — تصميم موحّد، SEO، سرعة، وإدارة محتوى سهلة للفريق التسويقي.",
      en: "15 interconnected sites — unified design, SEO, speed, and easy CMS for marketing.",
      fr: "15 sites interconnectés — design unifié, SEO, CMS marketing.",
    },
    context: {
      ar: `المجموعة لديها 5 شركات تابعة. كل واحدة موقع قديم مختلف. لا هوية بصرية موحّدة. Google لا يجد المحتوى. فريق التسويق يعتمد على المطور لكل تعديل بسيط.

أرادوا حضوراً رقمياً يليق بمجموعة دولية — سريع، جميل، سهل التحديث.`,
      en: `The group had 5 subsidiaries, each with an outdated different site. No unified brand. Poor SEO. Marketing depended on developers for every small change.

They wanted a digital presence fit for an international group — fast, polished, easy to update.`,
      fr: `5 filiales, sites obsolètes différents. Pas d'identité unifiée. SEO faible.

Besoin d'une présence digitale internationale — rapide, soignée, CMS facile.`,
    },
    challenge: {
      ar: `• 5 مواقع بتصاميم مختلفة
• بطء — 8+ ثوانٍ تحميل
• لا SEO ولا hreflang
• تحديث المحتوى يستغرق أسابيع`,
      en: `• 5 sites, different designs
• Slow — 8+ second loads
• No SEO or hreflang
• Content updates took weeks`,
      fr: `• 5 sites, designs différents
• Lent — 8+ secondes
• Pas de SEO/hreflang
• Mises à jour : semaines`,
    },
    solution: {
      ar: `صممنا وبرمجنا ecosystem كامل:

• موقع أم للمجموعة + 5 مواقع فرعية — نفس الجودة، هوية لكل علامة
• 3 لغات (عربي RTL + EN + FR) مع SEO صحيح
• نظام إدارة محتوى — التسويق يحدّث بدون مطور
• أداء عالٍ — CDN، صور محسّنة، Core Web Vitals

15 موقعاً live من codebase واحد منظم.`,
      en: `We designed and built the full ecosystem:

• Corporate hub + 5 brand sites — same quality, distinct identity each
• 3 languages (Arabic RTL + EN + FR) with proper SEO
• CMS — marketing updates without developers
• High performance — CDN, optimized images, Core Web Vitals

15 live sites from one organized codebase.`,
      fr: `Écosystème complet :

• Hub + 5 sites marques — qualité uniforme
• 3 langues (ar RTL + en + fr), SEO
• CMS sans développeur
• Performance : CDN, images, CWV

15 sites live, un codebase.`,
    },
    results: {
      ar: `تحميل الصفحة من 8 ثوانٍ إلى 1.8 ثانية. زيارات organic +55% خلال 6 أشهر. فريق التسويق ينشر محتوى جديد في ساعات لا أسابيع.`,
      en: `Page load 8s → 1.8s. Organic traffic +55% in 6 months. Marketing publishes in hours, not weeks.`,
      fr: `Chargement 8 s → 1,8 s. Trafic organic +55 %. Marketing : heures, pas semaines.`,
    },
    deliverables: [
      {
        title: { ar: "15 موقعاً", en: "15 websites", fr: "15 sites" },
        description: { ar: "Hub + 5 brands × 3 langs", en: "Hub + 5 brands × 3 langs", fr: "Hub + 5 marques × 3 langues" },
      },
      {
        title: { ar: "Design system", en: "Design system", fr: "Design system" },
        description: { ar: "مكونات قابلة لإعادة الاستخدام", en: "Reusable components", fr: "Composants réutilisables" },
      },
      {
        title: { ar: "CMS", en: "Content CMS", fr: "CMS contenu" },
        description: { ar: "تحديث بدون كود", en: "No-code updates", fr: "Mises à jour sans code" },
      },
      {
        title: { ar: "SEO pack", en: "SEO setup", fr: "Pack SEO" },
        description: { ar: "sitemap، hreflang، schema", en: "Sitemap, hreflang, schema", fr: "Sitemap, hreflang, schema" },
      },
    ],
    metrics: [
      { label: { ar: "سرعة التحميل", en: "Load time", fr: "Temps chargement" }, value: "1.8s", direction: "down" },
      { label: { ar: "زيارات organic", en: "Organic traffic", fr: "Trafic organic" }, value: "+55%", direction: "up" },
      { label: { ar: "مواقع", en: "Live sites", fr: "Sites live" }, value: "15", direction: "neutral" },
      { label: { ar: "لغات", en: "Languages", fr: "Langues" }, value: "3", direction: "neutral" },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind", "Headless CMS", "Vercel CDN", "next-intl"],
    timeline: { ar: "8 أشهر", en: "8 months", fr: "8 mois" },
    scope: { ar: "5 علامات · 15 موقع · 3 دول", en: "5 brands · 15 sites · 3 countries", fr: "5 marques · 15 sites · 3 pays" },
    publishedAt: "2025-09-01",
    relatedSlugs: ["identity-access-modernization", "secure-delivery-pipeline"],
  },
  {
    slug: "field-mobile-platform",
    pillar: "software",
    formats: ["mobile", "system"],
    industry: {
      ar: "الطاقة والخدمات الميدانية",
      en: "Energy & field services",
      fr: "Énergie & services terrain",
    },
    clientContext: {
      ar: "شركة خدمات ميدانية — 800 فني، 15 مدينة",
      en: "Field services company — 800 technicians, 15 cities",
      fr: "Services terrain — 800 techniciens, 15 villes",
    },
    title: {
      ar: "تطبيق موبايل للفرق الميدانية — iOS و Android",
      en: "Field team mobile app — iOS & Android",
      fr: "App mobile terrain — iOS & Android",
    },
    excerpt: {
      ar: "800 فني يستلمون المهام، يرفعون الصور، ويوقعون التسليم — حتى بدون إنترنت. لوحة web للإدارة.",
      en: "800 technicians receive jobs, upload photos, capture signatures — even offline. Web dashboard for managers.",
      fr: "800 techniciens : missions, photos, signatures — offline. Dashboard web managers.",
    },
    context: {
      ar: `الفنيون يعملون في مواقع بإشارة ضعيفة. كانوا يتصلون بالمكتب هاتفياً لكل مهمة. الورق يضيع. الإدارة لا ترى التقدم إلا نهاية اليوم.

احتاجوا تطبيقاً احترافياً يعمل في الميدان — ونظام web يربط المكتب بالميدان.`,
      en: `Technicians work in areas with poor signal. They called the office for every task. Paper got lost. Management only saw progress at day end.

They needed a professional field app — and a web system linking office to field.`,
      fr: `Techniciens en zones mal couvertes. Appels bureau pour chaque tâche. Papier perdu.

Besoin d'une app terrain pro + système web bureau ↔ terrain.`,
    },
    challenge: {
      ar: `• 800 مستخدم ميداني
• انقطاع شبكة متكرر
• مهام مفقودة أو مكررة
• لا صورة فورية للإنجاز`,
      en: `• 800 field users
• Frequent network loss
• Lost or duplicate jobs
• No real-time completion view`,
      fr: `• 800 utilisateurs terrain
• Réseau coupé souvent
• Missions perdues/dupliquées
• Pas de vue temps réel`,
    },
    solution: {
      ar: `طوّرنا تطبيقاً native-quality:

• iOS + Android — قائمة مهام، خريطة، كamera، توقيع العميل
• وضع offline — يحفظ ويرفع عند عودة الشبكة
• لوحة web — توزيع المهام، تتبع live، تقارير
• API آمن — 800 جهاز متزامن

تصميم بسيط للفني. قوة كاملة للإدارة.`,
      en: `We built a native-quality app:

• iOS + Android — job list, map, camera, customer signature
• Offline mode — saves and syncs when back online
• Web dashboard — dispatch, live tracking, reports
• Secure API — 800 devices concurrent

Simple for technicians. Full power for management.`,
      fr: `App qualité native :

• iOS + Android — missions, carte, photo, signature
• Mode offline + sync
• Dashboard web — dispatch, suivi live
• API — 800 appareils`,
    },
    results: {
      ar: `المهام المكتملة في الوقت +32%. المكالمات للمكتب −45%. 800 فني على التطبيق daily. الإدارة ترى الخريطة live.`,
      en: `On-time completion +32%. Office calls −45%. 800 technicians on app daily. Management sees live map.`,
      fr: `Missions à l'heure +32 %. Appels bureau −45 %. 800 techniciens actifs.`,
    },
    deliverables: [
      {
        title: { ar: "تطبيق iOS", en: "iOS app", fr: "App iOS" },
        description: { ar: "App Store، offline", en: "App Store, offline", fr: "App Store, offline" },
      },
      {
        title: { ar: "تطبيق Android", en: "Android app", fr: "App Android" },
        description: { ar: "Play Store، offline", en: "Play Store, offline", fr: "Play Store, offline" },
      },
      {
        title: { ar: "لوحة web", en: "Web dashboard", fr: "Dashboard web" },
        description: { ar: "توزيع وتتبع", en: "Dispatch & tracking", fr: "Dispatch & suivi" },
      },
      {
        title: { ar: "Backend API", en: "Backend API", fr: "API backend" },
        description: { ar: "800 جهاز متزامن", en: "800 concurrent devices", fr: "800 appareils" },
      },
    ],
    metrics: [
      { label: { ar: "إنجاز في الوقت", en: "On-time jobs", fr: "Missions à l'heure" }, value: "+32%", direction: "up" },
      { label: { ar: "مكالمات المكتب", en: "Office calls", fr: "Appels bureau" }, value: "−45%", direction: "down" },
      { label: { ar: "مستخدمون", en: "Daily users", fr: "Utilisateurs/jour" }, value: "800", direction: "neutral" },
      { label: { ar: "مدن", en: "Cities", fr: "Villes" }, value: "15", direction: "neutral" },
    ],
    techStack: ["React Native", "Node.js", "PostgreSQL", "Redis", "Mapbox", "AWS S3"],
    timeline: { ar: "7 أشهر", en: "7 months", fr: "7 mois" },
    scope: { ar: "800 فني · 15 مدينة · offline", en: "800 techs · 15 cities · offline", fr: "800 techs · 15 villes · offline" },
    publishedAt: "2025-11-15",
    relatedSlugs: ["ai-operations-platform", "smart-field-hama"],
  },
  {
    slug: "ai-operations-platform",
    pillar: "ai",
    formats: ["system", "website"],
    industry: {
      ar: "النقل واللوجستيات",
      en: "Transport & logistics",
      fr: "Transport & logistique",
    },
    clientContext: {
      ar: "شركة توصيل — 180 مركبة، 11 مركز، 3 دول",
      en: "Delivery company — 180 vehicles, 11 hubs, 3 countries",
      fr: "Livraison — 180 véhicules, 11 hubs, 3 pays",
    },
    title: {
      ar: "نظام إدارة الأسطول والعمليات — لوحة واحدة لكل شيء",
      en: "Fleet & operations system — one dashboard for everything",
      fr: "Système flotte & opérations — un tableau pour tout",
    },
    excerpt: {
      ar: "نظام web يربط GPS والمستودعات والطلبات — يتنبأ بالتأخير ويُظهر للمدير «الأهم الآن».",
      en: "Web system linking GPS, warehouses, and orders — predicts delays and shows managers what matters now.",
      fr: "Système web : GPS, entrepôts, commandes — prédit retards, priorités claires.",
    },
    context: {
      ar: `المدير كان يفتح 5 برامج لمعرفة أين الشحنات. التقارير متأخرة. التأخير يُكتشف بعد وقوعه.

أرادوا نظاماً واحداً على الويب — يجمع كل شيء ويساعد على القرار قبل أن تكبر المشكلة.`,
      en: `Managers opened 5 apps to find shipments. Reports were late. Delays were discovered after they happened.

They wanted one web system — everything together, decisions before problems grow.`,
      fr: `5 outils pour suivre les livraisons. Rapports en retard. Retards découverts trop tard.

Un système web unique — tout ensemble, décisions avant l'urgence.`,
    },
    challenge: {
      ar: `• 5 أنظمة منفصلة
• تقارير متأخرة 4–6 ساعات
• تنبيهات كثيرة بلا أولوية
• لا تنبؤ بالتأخير`,
      en: `• 5 separate systems
• Reports 4–6 hours late
• Too many unprioritized alerts
• No delay prediction`,
      fr: `• 5 systèmes séparés
• Rapports 4–6 h de retard
• Trop d'alertes
• Pas de prédiction retards`,
    },
    solution: {
      ar: `بنينا نظام عمليات على الويب:

• لوحة رئيسية — «3 أشياء تحتاج انتباهك الآن»
• ربط GPS + مستودعات + طلبات + طقس
• تنبيهات ذكية — فقط ما يؤثر على العميل
• تنبؤ بالتأخير قبل 6–8 ساعات

واجهة بسيطة للمدير. تحتها بيانات من 9 مصادر.`,
      en: `We built a web operations system:

• Main dashboard — "3 things need your attention now"
• Links GPS + warehouses + orders + weather
• Smart alerts — only what affects customers
• Delay prediction 6–8 hours ahead

Simple manager UI. Nine data sources underneath.`,
      fr: `Système web opérations :

• Dashboard — « 3 priorités maintenant »
• GPS + entrepôts + commandes + météo
• Alertes utiles seulement
• Prédiction retards 6–8 h avant`,
    },
    results: {
      ar: `زمن الاستجابة للمشاكل −35%. تنبيهات مزعجة −62%. المديرون يعملون من شاشة واحدة.`,
      en: `Issue response −35%. Noise alerts −62%. Managers work from one screen.`,
      fr: `Réponse problèmes −35 %. Alertes bruit −62 %. Une seule interface.`,
    },
    deliverables: [
      {
        title: { ar: "لوحة العمليات", en: "Ops dashboard", fr: "Dashboard ops" },
        description: { ar: "web، 3 لغات", en: "Web, 3 languages", fr: "Web, 3 langues" },
      },
      {
        title: { ar: "ربط البيانات", en: "Data integration", fr: "Intégration données" },
        description: { ar: "9 مصادر", en: "9 sources", fr: "9 sources" },
      },
      {
        title: { ar: "تنبؤ التأخير", en: "Delay prediction", fr: "Prédiction retards" },
        description: { ar: "6–8 ساعات مسبقاً", en: "6–8 hours ahead", fr: "6–8 h à l'avance" },
      },
      {
        title: { ar: "تدريب", en: "Training", fr: "Formation" },
        description: { ar: "12 runbook + جلسات", en: "12 runbooks + sessions", fr: "12 runbooks + sessions" },
      },
    ],
    metrics: [
      { label: { ar: "زمن الاستجابة", en: "Response time", fr: "Temps réponse" }, value: "−35%", direction: "down" },
      { label: { ar: "تنبيهات زائدة", en: "Noise alerts", fr: "Alertes inutiles" }, value: "−62%", direction: "down" },
      { label: { ar: "مركبات", en: "Vehicles", fr: "Véhicules" }, value: "180", direction: "neutral" },
      { label: { ar: "مصادر", en: "Data sources", fr: "Sources" }, value: "9", direction: "neutral" },
    ],
    techStack: ["Next.js", "Python", "PostgreSQL", "Kafka", "Grafana", "REST APIs"],
    timeline: { ar: "4 أشهر", en: "4 months", fr: "4 mois" },
    scope: { ar: "180 مركبة · 11 hub · 3 دول", en: "180 vehicles · 11 hubs · 3 countries", fr: "180 véhicules · 11 hubs · 3 pays" },
    publishedAt: "2025-11-01",
    relatedSlugs: ["field-mobile-platform", "customer-ops-triage"],
  },
  {
    slug: "smart-field-hama",
    pillar: "ai",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "الزراعة",
      en: "Agriculture",
      fr: "Agriculture",
    },
    clientContext: {
      ar: "تجمع زراعي — 850 هكتار، 40+ مزارع",
      en: "Farm cooperative — 850 hectares, 40+ farmers",
      fr: "Coopérative — 850 hectares, 40+ agriculteurs",
    },
    title: {
      ar: "منصة زراعية ذكية — موقع + تطبيق للمزارع",
      en: "Smart farming platform — website + farmer app",
      fr: "Plateforme agricole — site + app agriculteurs",
    },
    excerpt: {
      ar: "موقع ويب + تطبيق يخبر المزارع متى يسقي — +28% محصول، −22% مياه.",
      en: "Website + app telling farmers when to irrigate — +28% yield, −22% water.",
      fr: "Site + app : quand irriguer — +28 % rendement, −22 % eau.",
    },
    context: {
      ar: `المزارعون يعتمدون على الخبرة والتخمين في الري. التجمع أراد أداة بسيطة: «اسقي اليوم أم لا؟» على الموبايل، ولوحة للإدارة ترى كل الحقول.`,
      en: `Farmers relied on guesswork for irrigation. The cooperative wanted a simple tool: "water today or not?" on mobile, and an admin view of all fields.`,
      fr: `Irrigation au feeling. Besoin d'un outil simple : « arroser aujourd'hui ? » sur mobile + vue admin.`,
    },
    challenge: {
      ar: `• ري زائد أو ناقص
• بيانات sensors متقطعة
• لا أداة رقمية للمزارع
• قرارات الإدارة بدون numbers`,
      en: `• Over or under irrigation
• Intermittent sensor data
• No digital tool for farmers
• Management decisions without numbers`,
      fr: `• Sur/sous-irrigation
• Capteurs intermittents
• Pas d'outil digital
• Décisions sans chiffres`,
    },
    solution: {
      ar: `منصة كاملة:

• موقع web — maps، تقارير، إدارة
• تطبيق موبايل — توصية يومية + SMS backup
• sensors → cloud — يعمل حتى مع انقطاع شبكة قصير
• لوحة agronomist — heatmaps بسيطة

لغة بسيطة. لا مصطلحات معقدة للمزارع.`,
      en: `Full platform:

• Web site — maps, reports, admin
• Mobile app — daily recommendation + SMS backup
• Sensors → cloud — works through brief outages
• Agronomist dashboard — simple heatmaps

Plain language. No jargon for farmers.`,
      fr: `Plateforme complète :

• Site web — cartes, rapports
• App — reco quotidienne + SMS
• Capteurs → cloud
• Dashboard agronome simple`,
    },
    results: {
      ar: `محصول +28%. مياه −22%. 40 مزارعاً على التطبيق. الإدارة ترى كل حقل على خريطة واحدة.`,
      en: `Yield +28%. Water −22%. 40 farmers on app. Management sees every field on one map.`,
      fr: `Rendement +28 %. Eau −22 %. 40 agriculteurs sur l'app.`,
    },
    deliverables: [
      {
        title: { ar: "موقع الإدارة", en: "Admin website", fr: "Site admin" },
        description: { ar: "خرائط وتقارير", en: "Maps & reports", fr: "Cartes & rapports" },
      },
      {
        title: { ar: "تطبيق المزارع", en: "Farmer app", fr: "App agriculteur" },
        description: { ar: "عربي، SMS", en: "Arabic, SMS", fr: "Arabe, SMS" },
      },
      {
        title: { ar: "Sensors gateway", en: "Sensor gateway", fr: "Passerelle capteurs" },
        description: { ar: "12 محطة", en: "12 stations", fr: "12 stations" },
      },
      {
        title: { ar: "تقارير موسم", en: "Season reports", fr: "Rapports saison" },
        description: { ar: "PDF للإدارة", en: "PDF for management", fr: "PDF direction" },
      },
    ],
    metrics: [
      { label: { ar: "المحصول", en: "Yield", fr: "Rendement" }, value: "+28%", direction: "up" },
      { label: { ar: "المياه", en: "Water use", fr: "Eau" }, value: "−22%", direction: "down" },
      { label: { ar: "المزارعون", en: "Farmers", fr: "Agriculteurs" }, value: "40+", direction: "neutral" },
      { label: { ar: "المساحة", en: "Area", fr: "Surface" }, value: "850 ha", direction: "neutral" },
    ],
    techStack: ["Next.js", "React Native", "Python", "PostgreSQL", "MQTT", "Leaflet"],
    timeline: { ar: "5 أشهر + موسمان", en: "5 months + 2 seasons", fr: "5 mois + 2 saisons" },
    scope: { ar: "850 ha · 40 مزارع · 12 sensor", en: "850 ha · 40 farmers · 12 sensors", fr: "850 ha · 40 agriculteurs · 12 capteurs" },
    publishedAt: "2025-06-01",
    relatedSlugs: ["field-mobile-platform", "ai-operations-platform"],
  },
  {
    slug: "security-analytics-hub",
    pillar: "cyber",
    formats: ["system", "website"],
    industry: {
      ar: "الخدمات المالية",
      en: "Financial services",
      fr: "Services financiers",
    },
    clientContext: {
      ar: "بنك إقليمي — 2,400 موظف، 18 فرع",
      en: "Regional bank — 2,400 staff, 18 branches",
      fr: "Banque régionale — 2 400 employés, 18 agences",
    },
    title: {
      ar: "نظام مراقبة أمنية — لوحة واحدة لحماية البنك",
      en: "Security monitoring system — one dashboard to protect the bank",
      fr: "Système monitoring sécurité — un tableau pour la banque",
    },
    excerpt: {
      ar: "ربطنا 40 مصدر سجل في نظام واحد — وقت الاستجابة للتهديدات من 4 ساعات إلى ساعة ونصف.",
      en: "Connected 40 log sources into one system — threat response from 4 hours to 1.5 hours.",
      fr: "40 sources de logs unifiées — réponse menaces de 4 h à 1,5 h.",
    },
    context: {
      ar: `فريق الأمن كان يتنقل بين 3 برامج. التنبيهات كثيرة — لا أحد يعرف أيهم خطير. المراجعون يريدون proof أن كل حادث مُسجَّل.

أرادوا نظاماً واحداً على الويب: يرى كل شيء، يُرتّب الأولويات، ويُسجّل كل إجراء.`,
      en: `Security used 3 tools. Too many alerts — nobody knew which mattered. Auditors wanted proof every incident was logged.

They wanted one web system: see everything, prioritize, log every action.`,
      fr: `3 outils sécurité. Trop d'alertes. Auditeurs exigent traçabilité.

Un système web : tout voir, prioriser, journaliser.`,
    },
    challenge: {
      ar: `• 40+ مصدر سجل
• 4+ ساعات للرد على الحادث الخطير
• تنبيهات مزعجة 78%
• لا سجل موحد للمراجعين`,
      en: `• 40+ log sources
• 4+ hours to respond to serious incidents
• 78% noisy alerts
• No unified audit trail`,
      fr: `• 40+ sources logs
• 4+ h réponse incidents graves
• 78 % alertes bruit
• Pas de journal unifié`,
    },
    solution: {
      ar: `بنينا مركز مراقبة على الويب:

• كل السجلات في مكان واحد — AD، firewall، cloud
• قواعد واضحة — أولوية حسب خطورة
• 8 إجراءات جاهزة (حظر، عزل، إشعار) بضغطة
• تقارير أسبوعية للإدارة والمراجع

لغة بسيطة في اللوحة — «حادث حرج»، «قيد المعالجة»، «مغلق».`,
      en: `We built a web monitoring center:

• All logs in one place — AD, firewall, cloud
• Clear rules — priority by severity
• 8 ready actions (block, isolate, notify) in one click
• Weekly reports for leadership and auditors

Simple dashboard language — "critical", "in progress", "closed".`,
      fr: `Centre monitoring web :

• Tous logs — AD, firewall, cloud
• Règles claires par gravité
• 8 actions prêtes en un clic
• Rapports hebdo direction & audit`,
    },
    results: {
      ar: `زمن الرد 4.2 ساعة → 1.6 ساعة. تنبيهات زائدة −45%. اجتياز مراجعة SOC 2.`,
      en: `Response 4.2h → 1.6h. Noise −45%. SOC 2 audit passed.`,
      fr: `Réponse 4,2 h → 1,6 h. Bruit −45 %. Audit SOC 2 OK.`,
    },
    deliverables: [
      {
        title: { ar: "لوحة الأمن", en: "Security dashboard", fr: "Dashboard sécurité" },
        description: { ar: "web، 24/7", en: "Web, 24/7", fr: "Web, 24/7" },
      },
      {
        title: { ar: "ربط السجلات", en: "Log integration", fr: "Intégration logs" },
        description: { ar: "40 مصدر", en: "40 sources", fr: "40 sources" },
      },
      {
        title: { ar: "قواعد الاكتشاف", en: "Detection rules", fr: "Règles détection" },
        description: { ar: "120 قاعدة", en: "120 rules", fr: "120 règles" },
      },
      {
        title: { ar: "تدريب الفريق", en: "Team training", fr: "Formation équipe" },
        description: { ar: "40 ساعة", en: "40 hours", fr: "40 h" },
      },
    ],
    metrics: [
      { label: { ar: "زمن الرد", en: "Response time", fr: "Temps réponse" }, value: "1.6h", direction: "down" },
      { label: { ar: "خفض الزمن", en: "Time saved", fr: "Gain temps" }, value: "−62%", direction: "down" },
      { label: { ar: "مصادر", en: "Sources", fr: "Sources" }, value: "40+", direction: "neutral" },
      { label: { ar: "تنبيهات زائدة", en: "Noise", fr: "Bruit" }, value: "−45%", direction: "down" },
    ],
    techStack: ["Elasticsearch", "Python", "Grafana", "React", "REST APIs", "AWS"],
    timeline: { ar: "5 أشهر", en: "5 months", fr: "5 mois" },
    scope: { ar: "2,400 موظف · 18 فرع · SOC 12", en: "2,400 staff · 18 branches · SOC 12", fr: "2 400 staff · 18 agences · SOC 12" },
    publishedAt: "2025-09-15",
    relatedSlugs: ["industrial-soc", "identity-access-modernization"],
  },
  {
    slug: "predictive-maintenance",
    pillar: "ai",
    formats: ["system", "mobile", "website"],
    industry: {
      ar: "التصنيع",
      en: "Manufacturing",
      fr: "Manufacturing",
    },
    clientContext: {
      ar: "مصنع packaging — 24 خط إنتاج",
      en: "Packaging plant — 24 production lines",
      fr: "Usine packaging — 24 lignes production",
    },
    title: {
      ar: "نظام المصنع — لوحة إنتاج + تطبيق صيانة",
      en: "Factory system — production dashboard + maintenance app",
      fr: "Système usine — dashboard production + app maintenance",
    },
    excerpt: {
      ar: "لوحة web للإنتاج + تطبيق للصيانة — ينبّه قبل العطل بـ 48 ساعة. توقف غير مخطط −18%.",
      en: "Web production dashboard + maintenance app — warns 48h before failure. Unplanned downtime −18%.",
      fr: "Dashboard production web + app maintenance — alerte 48 h avant panne. Downtime −18 %.",
    },
    context: {
      ar: `الإنتاج يتوقف فجأة. الصيانة تجري بعد العطل. المدير يريد رؤية live + إنذار مبكر يصل للفني على الموبايل.`,
      en: `Production stopped suddenly. Maintenance ran after breakdowns. Managers wanted live view + early warnings on technicians' phones.`,
      fr: `Arrêts soudains. Maintenance après panne. Vue live + alertes mobile techniciens.`,
    },
    challenge: {
      ar: `• توقف مفاجئ يكلف ملايين
• 600 sensor — بيانات مشتتة
• الفنيون لا يثقون بالتنبيهات
• لا تطبيق موحد`,
      en: `• Sudden stops cost millions
• 600 sensors — scattered data
• Technicians distrusted alerts
• No unified app`,
      fr: `• Arrêts coûteux
• 600 capteurs dispersés
• Techniciens méfiants
• Pas d'app unifiée`,
    },
    solution: {
      ar: `نظام متكامل:

• لوحة web — حالة 24 خط live
• تطبيق صيانة — إنذار + checklist + إغلاق المهمة
• تنبؤ قبل 48–72 ساعة — مع سبب واضح («اهتزاز غير طبيعي»)
• تقارير للإدارة — أسبوعية

بسيط للفني. دقيق للإدارة.`,
      en: `Integrated system:

• Web dashboard — 24 lines live status
• Maintenance app — alert + checklist + close job
• 48–72h prediction — with plain reason ("unusual vibration")
• Weekly management reports

Simple for techs. Precise for leadership.`,
      fr: `Système intégré :

• Dashboard web — 24 lignes live
• App maintenance — alerte + checklist
• Prédiction 48–72 h — raison claire
• Rapports hebdo`,
    },
    results: {
      ar: `توقف غير مخطط −18%. 22 إنذاراً صحيحاً. الفنيون يستخدمون التطبيق daily.`,
      en: `Unplanned downtime −18%. 22 correct early warnings. Technicians use app daily.`,
      fr: `Downtime −18 %. 22 alertes validées. App utilisée daily.`,
    },
    deliverables: [
      {
        title: { ar: "لوحة الإنتاج", en: "Production dashboard", fr: "Dashboard production" },
        description: { ar: "24 خط web", en: "24 lines web", fr: "24 lignes web" },
      },
      {
        title: { ar: "تطبيق الصيانة", en: "Maintenance app", fr: "App maintenance" },
        description: { ar: "iOS + Android", en: "iOS + Android", fr: "iOS + Android" },
      },
      {
        title: { ar: "نظام التنبؤ", en: "Prediction engine", fr: "Moteur prédiction" },
        description: { ar: "48h مسبقاً", en: "48h ahead", fr: "48 h avant" },
      },
      {
        title: { ar: "تقارير", en: "Reports", fr: "Rapports" },
        description: { ar: "PDF أسبوعي", en: "Weekly PDF", fr: "PDF hebdo" },
      },
    ],
    metrics: [
      { label: { ar: "توقف غير مخطط", en: "Unplanned downtime", fr: "Downtime" }, value: "−18%", direction: "down" },
      { label: { ar: "إنذار مبكر", en: "Early warnings", fr: "Alertes précoces" }, value: "22", direction: "up" },
      { label: { ar: "خطوط", en: "Lines", fr: "Lignes" }, value: "24", direction: "neutral" },
      { label: { ar: "Sensors", en: "Sensors", fr: "Capteurs" }, value: "600", direction: "neutral" },
    ],
    techStack: ["Next.js", "React Native", "Python", "InfluxDB", "Grafana", "OPC-UA"],
    timeline: { ar: "6 أشهر", en: "6 months", fr: "6 mois" },
    scope: { ar: "24 خط · 600 sensor · 3 shifts", en: "24 lines · 600 sensors · 3 shifts", fr: "24 lignes · 600 capteurs · 3 shifts" },
    publishedAt: "2025-07-15",
    relatedSlugs: ["industrial-soc", "field-mobile-platform"],
  },
  {
    slug: "industrial-soc",
    pillar: "cyber",
    formats: ["system", "website"],
    industry: {
      ar: "الصناعة",
      en: "Industry",
      fr: "Industrie",
    },
    clientContext: {
      ar: "مجمع صناعي — 3 مصانع، 800+ آلة",
      en: "Industrial group — 3 plants, 800+ machines",
      fr: "Groupe industriel — 3 usines, 800+ machines",
    },
    title: {
      ar: "منصة تشغيل صناعية — IT والمصنع في نظام واحد",
      en: "Industrial operations platform — IT & factory in one system",
      fr: "Plateforme ops industrielle — IT & usine unifiés",
    },
    excerpt: {
      ar: "نظام web يربط شبكة المصنع والمكاتب — اكتشاف المشاكل أسرع 48% بدون إيقاف الإنتاج.",
      en: "Web system linking factory floor and office networks — 48% faster issue detection without stopping production.",
      fr: "Système web usine + bureaux — détection +48 % plus rapide sans arrêt production.",
    },
    context: {
      ar: `المصنع والمكتب لا يتحدثان. تهديد أمني على شبكة الإنتاج يُكتشف متأخراً. الإدارة تريد رؤية واحدة — بدون المساس بخطوط الإنتاج.`,
      en: `Factory floor and office didn't talk. Security issues on production network were found late. Leadership wanted one view — without touching production lines.`,
      fr: `Usine et bureaux silotés. Menaces réseau production détectées tard. Vue unique sans arrêter la production.`,
    },
    challenge: {
      ar: `• شبكتان منفصلتان
• 18+ ساعة لاكتشاف مشكلة OT
• 800+ جهاز بدون قائمة دقيقة
• خوف من أي تغيير على خط الإنتاج`,
      en: `• Two separate networks
• 18+ hours to detect OT issues
• 800+ devices without accurate list
• Fear of any change on production line`,
      fr: `• Deux réseaux séparés
• 18+ h détection OT
• 800+ appareils sans inventaire
• Peur de toucher la production`,
    },
    solution: {
      ar: `منصة مراقبة passive — لا نلمس الآلات:

• لوحة web واحدة — IT + مصنع
• قائمة أجهزة تُحدَّث تلقائياً
• تنبيهات واضحة — «خطير»، «مراقبة»، «مغلق»
• تدريب OT + IT معاً

كل شيء يُشرح بلغة بسيطة للمدير — لا acronyms.`,
      en: `Passive monitoring platform — we don't touch machines:

• One web dashboard — IT + factory
• Auto-updated device inventory
• Clear alerts — "critical", "watch", "closed"
• Joint OT + IT training

Everything in plain language for managers — no acronym soup.`,
      fr: `Monitoring passif — pas de contact machines :

• Un dashboard web IT + usine
• Inventaire auto
• Alertes claires
• Formation OT + IT`,
    },
    results: {
      ar: `اكتشاف المشاكل أسرع 48%. 3 حوادث اكتُشفت قبل تأثير الإنتاج. قائمة أجهزة 94% دقة.`,
      en: `Issue detection 48% faster. 3 incidents caught before production impact. 94% device inventory accuracy.`,
      fr: `Détection +48 % plus rapide. 3 incidents avant impact. Inventaire 94 %.`,
    },
    deliverables: [
      {
        title: { ar: "لوحة موحّدة", en: "Unified dashboard", fr: "Dashboard unifié" },
        description: { ar: "IT + OT web", en: "IT + OT web", fr: "IT + OT web" },
      },
      {
        title: { ar: "Asset inventory", en: "Device inventory", fr: "Inventaire" },
        description: { ar: "800+ جهاز", en: "800+ devices", fr: "800+ appareils" },
      },
      {
        title: { ar: "65 قاعدة", en: "65 detection rules", fr: "65 règles" },
        description: { ar: "مصنع + مكتب", en: "Plant + office", fr: "Usine + bureau" },
      },
      {
        title: { ar: "Runbooks", en: "Runbooks", fr: "Runbooks" },
        description: { ar: "6 playbooks", en: "6 playbooks", fr: "6 playbooks" },
      },
    ],
    metrics: [
      { label: { ar: "سرعة الاكتشاف", en: "Detection speed", fr: "Vitesse détection" }, value: "+48%", direction: "up" },
      { label: { ar: "دقة المخزون", en: "Inventory accuracy", fr: "Précision inventaire" }, value: "94%", direction: "up" },
      { label: { ar: "مصانع", en: "Plants", fr: "Usines" }, value: "3", direction: "neutral" },
      { label: { ar: "SLA إنتاج", en: "Production SLA", fr: "SLA production" }, value: "99.2%", direction: "neutral" },
    ],
    techStack: ["Grafana", "Elasticsearch", "Python", "React", "Passive TAP", "CMDB"],
    timeline: { ar: "5 أشهر", en: "5 months", fr: "5 mois" },
    scope: { ar: "3 مصانع · 800+ آلة · SOC 8", en: "3 plants · 800+ machines · SOC 8", fr: "3 usines · 800+ machines · SOC 8" },
    publishedAt: "2025-08-01",
    relatedSlugs: ["security-analytics-hub", "predictive-maintenance"],
  },
];

export const deepProjects: DeepProject[] = [...coreProjects, ...additionalProjects];

export function getDeepProject(slug: string): DeepProject | undefined {
  return deepProjects.find((p) => p.slug === slug);
}

/** Card-shaped projection for list views and Strapi fallback. */
export function toProjectCard(p: DeepProject): ProjectCard {
  const metricsLine = p.metrics
    .slice(0, 2)
    .map((m) => m.value)
    .join(" · ");
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    challenge: {
      ar: p.challenge.ar.split("\n")[0]?.replace(/^•\s*/, "") ?? p.challenge.ar,
      en: p.challenge.en.split("\n")[0]?.replace(/^•\s*/, "") ?? p.challenge.en,
      fr: p.challenge.fr?.split("\n")[0]?.replace(/^•\s*/, "") ?? p.challenge.en.split("\n")[0]?.replace(/^•\s*/, ""),
    },
    solution: {
      ar: p.solution.ar.split("\n")[0] ?? p.solution.ar,
      en: p.solution.en.split("\n")[0] ?? p.solution.en,
      fr: p.solution.fr?.split("\n")[0] ?? p.solution.en.split("\n")[0],
    },
    results: {
      ar: p.results.ar,
      en: p.results.en,
      fr: p.results.fr,
    },
    metrics: {
      ar: metricsLine,
      en: metricsLine,
      fr: metricsLine,
    },
  };
}

export const fallbackProjects: ProjectCard[] = deepProjects.map(toProjectCard);

export const formatLabels: Record<ProjectFormat, Localized> = {
  system: { ar: "نظام برمجي", en: "Software system", fr: "Système logiciel" },
  website: { ar: "موقع ويب", en: "Website", fr: "Site web" },
  mobile: { ar: "تطبيق موبايل", en: "Mobile app", fr: "App mobile" },
};
