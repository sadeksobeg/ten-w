/**
 * Pioneering portfolio additions — GenAI, fintech, edtech, marketplace, smart city, telemedicine.
 */

import type { DeepProject } from "./projects-data";

export const additionalProjects: DeepProject[] = [
  {
    slug: "genai-knowledge-assistant",
    pillar: "ai",
    formats: ["website", "system"],
    industry: {
      ar: "FinTech / خدمات مالية",
      en: "FinTech / financial services",
      fr: "FinTech / services financiers",
    },
    clientContext: {
      ar: "بنك إقليمي — 2,400 موظف، 180 فرع، 12M وثيقة داخلية",
      en: "Regional bank — 2,400 staff, 180 branches, 12M internal documents",
      fr: "Banque régionale — 2 400 collaborateurs, 180 agences, 12 M docs",
    },
    title: {
      ar: "مساعد معرفة بالذكاء الاصطناعي — إجابات آمنة من وثائق البنك",
      en: "GenAI knowledge assistant — secure answers from bank documents",
      fr: "Assistant IA — réponses sécurisées depuis les docs banque",
    },
    excerpt: {
      ar: "موظفو الفروع يحصلون على إجابات فورية من السياسات والمنتجات — بدون البحث في 12 مليون ملف، مع تدقيق كامل.",
      en: "Branch staff get instant answers from policies and products — without searching 12 million files, with full audit trails.",
      fr: "Les agences obtiennent des réponses instantanées — sans fouiller 12 M de fichiers, avec audit complet.",
    },
    context: {
      ar: `البنك يملك عقوداً، سياسات، أدلة منتجات، ومراسلات سنوات طويلة. الموظف يضيع 20–40 دقيقة يومياً للعثور على إجابة واحدة. الأخطاء في الاستشارة تكلف ملايين.

الهدف: مساعد ذكي يقرأ الوثائق المعتمدة فقط، يجيب بلغة بسيطة، ويسجّل كل سؤال للمراجعة.`,
      en: `The bank holds years of contracts, policies, product guides, and correspondence. Staff lose 20–40 minutes daily finding one answer. Wrong advice costs millions.

Goal: an intelligent assistant that reads approved documents only, answers in plain language, and logs every question for review.`,
      fr: `Années de contrats, politiques et guides produits. 20–40 min/jour perdues par collaborateur. Mauvais conseil = coûts élevés.

Objectif : assistant sur docs approuvés uniquement, langage simple, journalisation complète.`,
    },
    challenge: {
      ar: `• بحث يدوي في SharePoint وملفات PDF
• إجابات متضاربة بين الفروع
• مخاوف تسريب بيانات مع ChatGPT العام
• لا قياس لجودة الإجابات`,
      en: `• Manual search across SharePoint and PDFs
• Conflicting answers between branches
• Data-leak fears with public ChatGPT
• No measurement of answer quality`,
      fr: `• Recherche manuelle SharePoint/PDF
• Réponses contradictoires entre agences
• Risque fuite avec ChatGPT public
• Pas de mesure qualité`,
    },
    solution: {
      ar: `بنينا منصة معرفة خاصة بالبنك:

• فهرسة آمنة لـ 12M وثيقة مع صلاحيات حسب الدور
• مساعد GenAI يستشهد بالمصدر في كل إجابة
• واجهة ويب للموظفين + API للأنظمة الداخلية
• لوحة مراجعة — تقييم الإجابات وتحسين النماذج

كل الاستدعاءات داخل شبكة البنك، بدون إرسال بيانات عملاء لخدمات خارجية.`,
      en: `We built a bank-private knowledge platform:

• Secure indexing of 12M documents with role-based access
• GenAI assistant that cites sources in every answer
• Staff web UI + API for internal systems
• Review dashboard — rate answers and improve models

All calls stay inside the bank network — no customer data sent to external services.`,
      fr: `Plateforme privée :

• Indexation 12 M docs, droits par rôle
• GenAI avec citation des sources
• UI web + API interne
• Tableau de revue qualité

Tout reste dans le réseau banque.`,
    },
    results: {
      ar: `انخفض وقت البحث عن المعلومة بنسبة 70%. 2,400 موظف يستخدمون المساعد أسبوعياً. اجتازت المنصة تدقيق الامتثال. دقة الإجابات المعتمدة وصلت 92% بعد 3 أشهر تشغيل.`,
      en: `Information search time dropped 70%. 2,400 staff use the assistant weekly. Platform passed compliance review. Approved answer accuracy reached 92% after 3 months live.`,
      fr: `Temps de recherche −70 %. 2 400 utilisateurs/semaine. Conformité validée. Précision 92 % après 3 mois.`,
    },
    deliverables: [
      {
        title: { ar: "محرك المعرفة", en: "Knowledge engine", fr: "Moteur connaissance" },
        description: { ar: "فهرسة، صلاحيات، تحديث يومي", en: "Indexing, permissions, daily refresh", fr: "Indexation, droits, refresh quotidien" },
      },
      {
        title: { ar: "واجهة المساعد", en: "Assistant UI", fr: "UI assistant" },
        description: { ar: "عربي/إنجليزي، استشهاد بالمصدر", en: "AR/EN, source citations", fr: "AR/EN, citations sources" },
      },
      {
        title: { ar: "حوكمة AI", en: "AI governance", fr: "Gouvernance IA" },
        description: { ar: "سجلات، سياسات، مراجعة بشرية", en: "Logs, policies, human review", fr: "Journaux, politiques, revue humaine" },
      },
      {
        title: { ar: "تكامل الأنظمة", en: "System integrations", fr: "Intégrations" },
        description: { ar: "CRM، البريد، البوابة الداخلية", en: "CRM, mail, intranet", fr: "CRM, mail, intranet" },
      },
    ],
    metrics: [
      { label: { ar: "وقت البحث", en: "Search time", fr: "Temps recherche" }, value: "−70%", direction: "down" },
      { label: { ar: "مستخدمون نشطون", en: "Active users", fr: "Utilisateurs actifs" }, value: "2,400", direction: "up" },
      { label: { ar: "دقة الإجابات", en: "Answer accuracy", fr: "Précision réponses" }, value: "92%", direction: "up" },
      { label: { ar: "وثائق مفهرسة", en: "Indexed docs", fr: "Docs indexés" }, value: "12M", direction: "neutral" },
    ],
    techStack: ["Python", "LangChain", "Azure OpenAI", "PostgreSQL", "Next.js", "Elasticsearch"],
    timeline: { ar: "7 أشهر", en: "7 months", fr: "7 mois" },
    scope: { ar: "12M وثيقة · 2,400 موظف · 180 فرع", en: "12M docs · 2,400 staff · 180 branches", fr: "12 M docs · 2 400 staff · 180 agences" },
    publishedAt: "2025-09-01",
    relatedSlugs: ["data-platform-governance", "secure-delivery-pipeline"],
    clientQuote: {
      quote: {
        ar: "الموظف في الفرع أصبح يجيب العميل في دقائق بدل ساعة — والإجابة موثقة بمصدر رسمي.",
        en: "Branch staff now answer customers in minutes instead of an hour — with an official source behind every reply.",
        fr: "L'agence répond en minutes au lieu d'une heure — avec une source officielle.",
      },
      role: { ar: "رئيس العمليات", en: "Head of operations", fr: "Directeur des opérations" },
      org: { ar: "مجموعة بنكية إقليمية", en: "Regional Banking Group", fr: "Groupe bancaire régional" },
      initials: "OP",
    },
  },
  {
    slug: "realtime-payment-platform",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "FinTech / مدفوعات",
      en: "FinTech / payments",
      fr: "FinTech / paiements",
    },
    clientContext: {
      ar: "شركة مدفوعات — 8M معاملة/شهر، 50 تاجر كبير، 3 دول",
      en: "Payments company — 8M transactions/month, 50 enterprise merchants, 3 countries",
      fr: "Société paiements — 8 M tx/mois, 50 marchands enterprise, 3 pays",
    },
    title: {
      ar: "منصة مدفوعات لحظية — موقع تاجر + تطبيق + محرك معاملات",
      en: "Real-time payment platform — merchant site, app & transaction engine",
      fr: "Plateforme paiement temps réel — site marchand, app & moteur",
    },
    excerpt: {
      ar: "مدفوعات فورية 24/7 للتجار والمستهلكين — بوابة ويب، تطبيق محفظة، ونواة معاملات تتحمل 8 مليون عملية شهرياً.",
      en: "24/7 instant payments for merchants and consumers — web portal, wallet app, and core engine handling 8 million monthly transactions.",
      fr: "Paiements instantanés 24/7 — portail web, app wallet, moteur 8 M tx/mois.",
    },
    context: {
      ar: `الشركة كانت تعتمد أنظمة قديمة بطيئة في التسوية. التجار يريدون تقارير لحظية. المستهلك يتوقع تحويلاً فورياً مثل التطبيقات العالمية.

طُلب بناء منصة جديدة من الصفر — سريعة، آمنة، ومتوافقة مع لوائح المدفوعات في ثلاث دول.`,
      en: `The company relied on slow legacy settlement systems. Merchants wanted real-time reporting. Consumers expected instant transfers like global apps.

They asked for a greenfield platform — fast, secure, and compliant with payment regulations in three countries.`,
      fr: `Systèmes legacy lents. Marchands : reporting temps réel. Consommateurs : transferts instantanés.

Demande : plateforme neuve — rapide, sécurisée, conforme 3 pays.`,
    },
    challenge: {
      ar: `• تسوية تستغرق 24–48 ساعة
• لا تطبيق محفظة رسمي
• انقطاعات ذروة تصل 12 دقيقة/شهر
• تكاملات تجار مخصصة بطيئة`,
      en: `• Settlement took 24–48 hours
• No official wallet app
• Peak outages up to 12 minutes/month
• Slow custom merchant integrations`,
      fr: `• Règlement 24–48 h
• Pas d'app wallet officielle
• Pannes pic : 12 min/mois
• Intégrations marchands lentes`,
    },
    solution: {
      ar: `صمّمنا وطوّرنا المنصة الكاملة:

• محرك معاملات — معالجة متوازية، idempotency، مراقبة لحظية
• بوابة تجار — تقارير، فواتير، webhooks
• تطبيق محفظة iOS/Android — تحويل، QR، إشعارات فورية
• طبقة امتثال — KYC، حدود، تقارير للجهات الرقابية`,
      en: `We designed and built the full platform:

• Transaction engine — parallel processing, idempotency, real-time monitoring
• Merchant portal — reports, invoicing, webhooks
• iOS/Android wallet app — transfer, QR, instant notifications
• Compliance layer — KYC, limits, regulatory reporting`,
      fr: `Plateforme complète :

• Moteur transactions — parallèle, idempotence, monitoring
• Portail marchands — rapports, facturation, webhooks
• App wallet iOS/Android
• Couche conformité — KYC, limites, reporting`,
    },
    results: {
      ar: `التسوية أصبحت فورية. 8M معاملة/شهر بتوفر 99.95%. زمن الاستجابة P95 تحت 200ms. 50 تاجراً متكاملين عبر API موحّد.`,
      en: `Settlement became instant. 8M transactions/month at 99.95% availability. P95 latency under 200ms. 50 merchants on a unified API.`,
      fr: `Règlement instantané. 8 M tx/mois, 99,95 % dispo. P95 < 200 ms. 50 marchands sur API unifiée.`,
    },
    deliverables: [
      {
        title: { ar: "محرك المعاملات", en: "Transaction core", fr: "Cœur transactionnel" },
        description: { ar: "معالجة، تسوية، مراقبة", en: "Processing, settlement, monitoring", fr: "Traitement, règlement, monitoring" },
      },
      {
        title: { ar: "بوابة التجار", en: "Merchant portal", fr: "Portail marchands" },
        description: { ar: "لوحات، API، webhooks", en: "Dashboards, API, webhooks", fr: "Tableaux, API, webhooks" },
      },
      {
        title: { ar: "تطبيق المحفظة", en: "Wallet app", fr: "App wallet" },
        description: { ar: "iOS + Android، QR، push", en: "iOS + Android, QR, push", fr: "iOS + Android, QR, push" },
      },
      {
        title: { ar: "امتثال ومراجعة", en: "Compliance & audit", fr: "Conformité & audit" },
        description: { ar: "KYC، سجلات، تقارير", en: "KYC, logs, reports", fr: "KYC, journaux, rapports" },
      },
    ],
    metrics: [
      { label: { ar: "معاملات/شهر", en: "Tx / month", fr: "Tx / mois" }, value: "8M", direction: "up" },
      { label: { ar: "التوفر", en: "Availability", fr: "Disponibilité" }, value: "99.95%", direction: "up" },
      { label: { ar: "زمن P95", en: "P95 latency", fr: "Latence P95" }, value: "<200ms", direction: "down" },
      { label: { ar: "تجار متكاملون", en: "Merchants live", fr: "Marchands live" }, value: "50", direction: "neutral" },
    ],
    techStack: ["Node.js", "Kafka", "PostgreSQL", "React Native", "Next.js", "Redis", "Kubernetes"],
    timeline: { ar: "14 شهراً", en: "14 months", fr: "14 mois" },
    scope: { ar: "8M tx/شهر · 3 دول · 50 تاجر", en: "8M tx/month · 3 countries · 50 merchants", fr: "8 M tx/mois · 3 pays · 50 marchands" },
    publishedAt: "2025-07-15",
    relatedSlugs: ["secure-delivery-pipeline", "security-analytics-hub"],
  },
  {
    slug: "edtech-learning-platform",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "تعليم / EdTech",
      en: "Education / EdTech",
      fr: "Éducation / EdTech",
    },
    clientContext: {
      ar: "شبكة مدارس خاصة — 45 مدرسة، 28,000 طالب، 3,200 معلم",
      en: "Private school network — 45 schools, 28,000 students, 3,200 teachers",
      fr: "Réseau écoles privées — 45 établissements, 28 000 élèves, 3 200 enseignants",
    },
    title: {
      ar: "منصة تعلم رقمية — دروس، اختبارات، وتطبيق أولياء",
      en: "Digital learning platform — lessons, assessments & parent app",
      fr: "Plateforme apprentissage — cours, évaluations & app parents",
    },
    excerpt: {
      ar: "موقع تعليمي ضخم، تطبيق للطلاب والأهالي، ونظام إدارة محتوى — 28 ألف طالب يتعلمون أونلاين وفي الصف.",
      en: "Large learning website, student & parent apps, and content management — 28,000 learners online and in class.",
      fr: "Grand site pédagogique, apps élèves & parents, CMS — 28 000 apprenants.",
    },
    context: {
      ar: `أثناء الجائحة اكتشفت الشبكة أن أدواتها المتفرقة لا تكفي. المعلم يرفع المحتوى في مكان، والاختبارات في آخر، والأهل لا يرون تقدم أبنائهم بوضوح.

الطلب: منصة واحدة — فيديو، واجبات، اختبارات، وتواصل مع الأهل — بثلاث لغات.`,
      en: `During the pandemic the network found scattered tools were not enough. Teachers uploaded in one place, tests in another, and parents could not see progress clearly.

The ask: one platform — video, homework, assessments, and parent communication — in three languages.`,
      fr: `Outils dispersés insuffisants. Enseignants, tests et parents déconnectés.

Demande : une plateforme — vidéo, devoirs, évaluations, parents — 3 langues.`,
    },
    challenge: {
      ar: `• 6 أدوات منفصلة بدون تكامل
• غياب تطبيق رسمي للأهالي
• بطء البث مع 5,000 متصل متزامن
• لا تحليلات لتقدم الطالب`,
      en: `• 6 separate tools with no integration
• No official parent app
• Streaming struggled at 5,000 concurrent users
• No analytics on student progress`,
      fr: `• 6 outils non intégrés
• Pas d'app parents officielle
• Streaming limité à 5 000 simultanés
• Pas d'analytics progrès`,
    },
    solution: {
      ar: `بنينا منصة تعلم متكاملة:

• موقع ويب — فصول افتراضية، مكتبة محتوى، لوحة معلم
• تطبيق طالب — دروس، واجبات، إشعارات
• تطبيق ولي أمر — درجات، حضور، رسائل
• نظام LMS — جدولة، اختبارات آلية، تقارير إدارية`,
      en: `We built an integrated learning platform:

• Website — virtual classrooms, content library, teacher dashboard
• Student app — lessons, homework, notifications
• Parent app — grades, attendance, messaging
• LMS core — scheduling, auto-graded tests, admin reports`,
      fr: `Plateforme intégrée :

• Site — classes virtuelles, bibliothèque, dashboard enseignant
• App élève — cours, devoirs, notifications
• App parents — notes, présence, messages
• LMS — planning, tests auto, rapports`,
    },
    results: {
      ar: `28,000 طالب على المنصة. رضا المعلمين 4.6/5. انخفض الغياب المُبلّغ عنه 18%. البث يتحمل 8,000 متصل متزامن.`,
      en: `28,000 students on platform. Teacher satisfaction 4.6/5. Reported absence dropped 18%. Streaming handles 8,000 concurrent users.`,
      fr: `28 000 élèves. Satisfaction enseignants 4,6/5. Absence −18 %. Streaming : 8 000 simultanés.`,
    },
    deliverables: [
      {
        title: { ar: "بوابة التعلم", en: "Learning portal", fr: "Portail apprentissage" },
        description: { ar: "فصول، فيديو، مكتبة", en: "Classes, video, library", fr: "Classes, vidéo, bibliothèque" },
      },
      {
        title: { ar: "تطبيقات موبايل", en: "Mobile apps", fr: "Apps mobile" },
        description: { ar: "طالب + ولي أمر", en: "Student + parent", fr: "Élève + parent" },
      },
      {
        title: { ar: "محرك الاختبارات", en: "Assessment engine", fr: "Moteur évaluations" },
        description: { ar: "تلقائي + يدوي، بنك أسئلة", en: "Auto + manual, question bank", fr: "Auto + manuel, banque questions" },
      },
      {
        title: { ar: "تحليلات التقدم", en: "Progress analytics", fr: "Analytics progrès" },
        description: { ar: "لوحات إدارة ومدرسة", en: "Admin & school dashboards", fr: "Tableaux admin & école" },
      },
    ],
    metrics: [
      { label: { ar: "طلاب", en: "Students", fr: "Élèves" }, value: "28K", direction: "up" },
      { label: { ar: "رضا المعلمين", en: "Teacher NPS", fr: "Satisfaction enseignants" }, value: "4.6/5", direction: "up" },
      { label: { ar: "غياب", en: "Absence", fr: "Absence" }, value: "−18%", direction: "down" },
      { label: { ar: "متصلون متزامنون", en: "Concurrent users", fr: "Utilisateurs simultanés" }, value: "8K", direction: "up" },
    ],
    techStack: ["Next.js", "React Native", "PostgreSQL", "AWS MediaConvert", "WebRTC", "Redis"],
    timeline: { ar: "11 شهراً", en: "11 months", fr: "11 mois" },
    scope: { ar: "45 مدرسة · 28K طالب · 3 لغات", en: "45 schools · 28K students · 3 languages", fr: "45 écoles · 28 K élèves · 3 langues" },
    publishedAt: "2025-06-01",
    relatedSlugs: ["corporate-web-ecosystem", "customer-ops-triage"],
  },
  {
    slug: "b2b-marketplace-platform",
    pillar: "software",
    formats: ["website", "system"],
    industry: {
      ar: "تجارة / B2B",
      en: "Commerce / B2B",
      fr: "Commerce / B2B",
    },
    clientContext: {
      ar: "مجموعة توزيع — 3,500 مورّد، 12,000 عميل تجاري، 4 أسواق",
      en: "Distribution group — 3,500 suppliers, 12,000 B2B buyers, 4 markets",
      fr: "Groupe distribution — 3 500 fournisseurs, 12 000 acheteurs B2B, 4 marchés",
    },
    title: {
      ar: "سوق B2B رقمي — طلبات، عروض، وتكامل مخزون",
      en: "B2B digital marketplace — orders, quotes & inventory sync",
      fr: "Marketplace B2B — commandes, devis & sync stocks",
    },
    excerpt: {
      ar: "منصة ويب تربط آلاف المورّدين بالتجار — طلبات بالجملة، تسعير ديناميكي، ومزامنة مخزون لحظية.",
      en: "Web platform connecting thousands of suppliers to traders — bulk orders, dynamic pricing, and live inventory sync.",
      fr: "Plateforme web reliant fournisseurs et acheteurs — commandes volume, prix dynamiques, stocks temps réel.",
    },
    context: {
      ar: `المبيعات كانت تتم عبر هاتف وExcel. الأخطاء في الأسعار والمخزون تسبب خسائر يومية. المورّد الصغير لا يصل للتجار الكبار.

الرؤية: سوق رقمي واحد — شفاف، سريع، وقابل للتوسع في أسواق جديدة.`,
      en: `Sales happened by phone and Excel. Pricing and stock errors caused daily losses. Small suppliers could not reach large buyers.

Vision: one digital marketplace — transparent, fast, expandable to new markets.`,
      fr: `Ventes par téléphone et Excel. Erreurs prix/stocks quotidiennes. Petits fournisseurs exclus.

Vision : un marketplace digital — transparent, rapide, multi-marchés.`,
    },
    challenge: {
      ar: `• 72 ساعة لإتمام عرض سعر
• مخزون غير متطابق 30% من الوقت
• لا بوابة self-service للمورّدين
• تكامل ERP يدوي`,
      en: `• 72 hours to complete a quote
• Stock mismatch 30% of the time
• No self-service portal for suppliers
• Manual ERP integration`,
      fr: `• Devis : 72 h
• Stocks incohérents 30 % du temps
• Pas de portail fournisseur
• ERP manuel`,
    },
    solution: {
      ar: `طوّرنا marketplace متكامل:

• واجهة مشترين — بحث، مقارنة، طلبات متكررة
• بوابة مورّدين — كتالوج، عروض، تنبيهات مخزون
• محرك تسعير — خصومات حجم، عقود، عملات متعددة
• تكامل ERP — SAP وOracle عبر API موحّد`,
      en: `We built an integrated marketplace:

• Buyer UI — search, compare, recurring orders
• Supplier portal — catalog, quotes, stock alerts
• Pricing engine — volume discounts, contracts, multi-currency
• ERP integration — SAP & Oracle via unified API`,
      fr: `Marketplace intégré :

• UI acheteurs — recherche, comparaison, récurrence
• Portail fournisseurs — catalogue, devis, stocks
• Moteur prix — volume, contrats, multi-devises
• ERP — SAP & Oracle via API`,
    },
    results: {
      ar: `زمن عرض السعر من 72 ساعة إلى 4 ساعات. 12,000 عميل تجاري نشط. GMV شهري تجاوز 40M$. دقة المخزون 97%.`,
      en: `Quote time from 72 hours to 4 hours. 12,000 active B2B buyers. Monthly GMV exceeded $40M. Stock accuracy 97%.`,
      fr: `Devis : 72 h → 4 h. 12 000 acheteurs actifs. GMV > 40 M$/mois. Stocks 97 %.`,
    },
    deliverables: [
      {
        title: { ar: "واجهة المشترين", en: "Buyer experience", fr: "Expérience acheteur" },
        description: { ar: "بحث، سلة، طلبات", en: "Search, cart, orders", fr: "Recherche, panier, commandes" },
      },
      {
        title: { ar: "بوابة المورّدين", en: "Supplier portal", fr: "Portail fournisseurs" },
        description: { ar: "كتالوج، عروض، تقارير", en: "Catalog, quotes, reports", fr: "Catalogue, devis, rapports" },
      },
      {
        title: { ar: "محرك التسعير", en: "Pricing engine", fr: "Moteur prix" },
        description: { ar: "عقود، حجم، عملات", en: "Contracts, volume, FX", fr: "Contrats, volume, devises" },
      },
      {
        title: { ar: "تكامل ERP", en: "ERP connectors", fr: "Connecteurs ERP" },
        description: { ar: "SAP، Oracle، webhooks", en: "SAP, Oracle, webhooks", fr: "SAP, Oracle, webhooks" },
      },
    ],
    metrics: [
      { label: { ar: "زمن العرض", en: "Quote time", fr: "Délai devis" }, value: "4h", direction: "down" },
      { label: { ar: "مشترون نشطون", en: "Active buyers", fr: "Acheteurs actifs" }, value: "12K", direction: "up" },
      { label: { ar: "GMV شهري", en: "Monthly GMV", fr: "GMV mensuel" }, value: "$40M+", direction: "up" },
      { label: { ar: "دقة المخزون", en: "Stock accuracy", fr: "Précision stocks" }, value: "97%", direction: "up" },
    ],
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Elasticsearch", "Redis", "Stripe Connect"],
    timeline: { ar: "12 شهراً", en: "12 months", fr: "12 mois" },
    scope: { ar: "3,500 مورّد · 12K مشترٍ · 4 أسواق", en: "3,500 suppliers · 12K buyers · 4 markets", fr: "3 500 fournisseurs · 12 K acheteurs · 4 marchés" },
    publishedAt: "2025-05-01",
    relatedSlugs: ["corporate-web-ecosystem", "ai-operations-platform"],
  },
  {
    slug: "smart-city-citizen-platform",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "مدن ذكية / حكومة محلية",
      en: "Smart city / local government",
      fr: "Ville intelligente / collectivité",
    },
    clientContext: {
      ar: "بلدية كبرى — 1.2M نسمة، 85 خدمة بلدية",
      en: "Major municipality — 1.2M residents, 85 municipal services",
      fr: "Grande municipalité — 1,2 M habitants, 85 services",
    },
    title: {
      ar: "تطبيق المواطن الذكي — بلاغات، خدمات، وخريطة تفاعلية",
      en: "Smart citizen app — reports, services & interactive map",
      fr: "App citoyenne — signalements, services & carte interactive",
    },
    excerpt: {
      ar: "موقع بلدية حديث وتطبيق موبايل — بلاغات حفر، دفع رسوم، ومتابعة الطلبات في الوقت الفعلي.",
      en: "Modern city website and mobile app — pothole reports, fee payments, and real-time request tracking.",
      fr: "Site municipal moderne et app — signalements, paiements, suivi temps réel.",
    },
    context: {
      ar: `المواطن كان يزور الدوائر أو يتصل بالخط الساخن. البلدية لا ترى خريطة البلاغات. القرارات تتأخر لأن البيانات مبعثرة.

المشروع: قناة رقمية واحدة — شفافة، سريعة، ومتصلة بأنظمة البلدية الداخلية.`,
      en: `Citizens visited offices or called hotlines. The city had no map of complaints. Decisions lagged because data was scattered.

The project: one digital channel — transparent, fast, connected to internal city systems.`,
      fr: `Citoyens en guichet ou hotline. Pas de carte des signalements. Données dispersées.

Projet : un canal digital — transparent, rapide, connecté aux systèmes internes.`,
    },
    challenge: {
      ar: `• 14 يوماً متوسط معالجة البلاغ
• لا خريطة موحّدة للحوادث
• دفع الرسوم يتطلب زيارة مكتب
• أنظمة داخلية غير متصلة`,
      en: `• 14-day average complaint resolution
• No unified incident map
• Fee payment required office visit
• Disconnected internal systems`,
      fr: `• 14 jours traitement signalement
• Pas de carte unifiée
• Paiement en guichet
• Systèmes déconnectés`,
    },
    solution: {
      ar: `سلّمنا منصة مواطن متكاملة:

• موقع بلدية — 85 خدمة، عربي/إنجليزي، إمكانية وصول
• تطبيق — بلاغ مع صورة وGPS، إشعارات حالة
• نظام إدارة البلاغات — توجيه للفرق، SLA، خريطة حرارية
• تكامل دفع إلكتروني وERP البلدية`,
      en: `We delivered an integrated citizen platform:

• City website — 85 services, Arabic/English, accessibility
• App — report with photo & GPS, status notifications
• Case management — routing, SLAs, heat map
• E-payment and city ERP integration`,
      fr: `Plateforme citoyenne :

• Site — 85 services, ar/en, accessibilité
• App — signalement photo/GPS, notifications
• Gestion dossiers — routage, SLA, carte chaleur
• Paiement & ERP municipal`,
    },
    results: {
      ar: `متوسط معالجة البلاغ 5 أيام بدل 14. 340,000 مستخدم للتطبيق. 62% من الرسوم تُدفع إلكترونياً. رضا المواطن ارتفع 35 نقطة.`,
      en: `Average complaint resolution 5 days vs 14. 340,000 app users. 62% of fees paid online. Citizen satisfaction up 35 points.`,
      fr: `Signalements : 5 j vs 14. 340 K utilisateurs app. 62 % frais en ligne. Satisfaction +35 pts.`,
    },
    deliverables: [
      {
        title: { ar: "موقع البلدية", en: "City website", fr: "Site municipal" },
        description: { ar: "85 خدمة، SEO، وصول", en: "85 services, SEO, a11y", fr: "85 services, SEO, a11y" },
      },
      {
        title: { ar: "تطبيق المواطن", en: "Citizen app", fr: "App citoyenne" },
        description: { ar: "بلاغات، دفع، تتبع", en: "Reports, pay, track", fr: "Signalements, paiement, suivi" },
      },
      {
        title: { ar: "نظام البلاغات", en: "Case management", fr: "Gestion dossiers" },
        description: { ar: "SLA، خريطة، فرق ميدانية", en: "SLA, map, field teams", fr: "SLA, carte, équipes terrain" },
      },
      {
        title: { ar: "تكاملات", en: "Integrations", fr: "Intégrations" },
        description: { ar: "دفع، ERP، GIS", en: "Payments, ERP, GIS", fr: "Paiement, ERP, SIG" },
      },
    ],
    metrics: [
      { label: { ar: "معالجة البلاغ", en: "Case resolution", fr: "Résolution dossier" }, value: "5d", direction: "down" },
      { label: { ar: "مستخدمون التطبيق", en: "App users", fr: "Utilisateurs app" }, value: "340K", direction: "up" },
      { label: { ar: "دفع إلكتروني", en: "Online payments", fr: "Paiements en ligne" }, value: "62%", direction: "up" },
      { label: { ar: "رضا المواطن", en: "Citizen satisfaction", fr: "Satisfaction citoyen" }, value: "+35", direction: "up" },
    ],
    techStack: ["Next.js", "React Native", "PostgreSQL", "Mapbox", "Keycloak", "Node.js"],
    timeline: { ar: "9 أشهر", en: "9 months", fr: "9 mois" },
    scope: { ar: "1.2M نسمة · 85 خدمة · بلدية", en: "1.2M residents · 85 services · municipality", fr: "1,2 M habitants · 85 services" },
    publishedAt: "2025-04-15",
    relatedSlugs: ["identity-access-modernization", "field-mobile-platform"],
  },
  {
    slug: "telemedicine-care-platform",
    pillar: "software",
    formats: ["website", "mobile", "system"],
    industry: {
      ar: "رعاية صحية",
      en: "Healthcare",
      fr: "Santé",
    },
    clientContext: {
      ar: "شبكة عيادات — 120 فرع، 800 طبيب، 2M مريض مسجّل",
      en: "Clinic network — 120 sites, 800 physicians, 2M registered patients",
      fr: "Réseau cliniques — 120 sites, 800 médecins, 2 M patients",
    },
    title: {
      ar: "منصة رعاية عن بُعد — حجز، استشارة فيديو، ووصفة إلكترونية",
      en: "Telemedicine platform — booking, video consult & e-prescription",
      fr: "Télémédecine — réservation, vidéo & ordonnance électronique",
    },
    excerpt: {
      ar: "موقع للمرضى، تطبيق موبايل، ونظام سريري — استشارات فيديو آمنة ووصفات إلكترونية متوافقة مع اللوائح.",
      en: "Patient website, mobile app, and clinical system — secure video consults and regulation-compliant e-prescriptions.",
      fr: "Site patients, app mobile, système clinique — vidéo sécurisée et ordonnances conformes.",
    },
    context: {
      ar: `المرضى في المناطق البعيدة يتأخرون أشهراً للموعد. العيادات مزدحمة. الأطباء يريدون متابعة الحالات المزمنة عن بُعد بشكل آمن.

المطلوب: منصة طبية متكاملة — ليست مجرد مكالمة فيديو، بل سجل مريض ووصفات ومدفوعات.`,
      en: `Patients in remote areas waited months for appointments. Clinics were overcrowded. Doctors wanted secure remote follow-up for chronic cases.

Requirement: an integrated medical platform — not just video chat, but records, prescriptions, and payments.`,
      fr: `Délais de mois en zones éloignées. Cliniques saturées. Médecins : suivi chronique à distance sécurisé.

Besoin : plateforme médicale intégrée — dossier, ordonnances, paiements.`,
    },
    challenge: {
      ar: `• 45% من المواعيد no-show
• لا وصفة إلكترونية معتمدة
• بيانات المريض في 8 أنظمة
• مخاوف خصوصية الفيديو`,
      en: `• 45% appointment no-show rate
• No approved e-prescription flow
• Patient data across 8 systems
• Video privacy concerns`,
      fr: `• 45 % no-show rendez-vous
• Pas d'ordonnance électronique
• Données dans 8 systèmes
• Confidentialité vidéo`,
    },
    solution: {
      ar: `بنينا منصة رعاية رقمية:

• بوابة مريض — حجز، تاريخ، دفع
• تطبيق — استشارة فيديو مشفّرة، تذكيرات دواء
• نظام سريري — ملاحظات طبيب، وصفات، تكامل مختبر
• امتثال — تشفير، موافقات، سجلات تدقيق HIPAA-grade`,
      en: `We built a digital care platform:

• Patient portal — booking, history, payment
• App — encrypted video consult, medication reminders
• Clinical system — doctor notes, prescriptions, lab integration
• Compliance — encryption, consents, HIPAA-grade audit logs`,
      fr: `Plateforme de soins :

• Portail patient — RDV, historique, paiement
• App — vidéo chiffrée, rappels médicaments
• Système clinique — notes, ordonnances, labo
• Conformité — chiffrement, consentements, audit`,
    },
    results: {
      ar: `no-show انخفض إلى 22%. 180,000 استشارة فيديو/سنة. وقت الانتظار للموعد الحضوري −40%. اجتازت المنصة مراجعة الخصوصية.`,
      en: `No-show dropped to 22%. 180,000 video consults/year. In-person wait time −40%. Platform passed privacy review.`,
      fr: `No-show 22 %. 180 K consultations vidéo/an. Attente présentiel −40 %. Revue confidentialité OK.`,
    },
    deliverables: [
      {
        title: { ar: "بوابة المريض", en: "Patient portal", fr: "Portail patient" },
        description: { ar: "حجز، ملفات، دفع", en: "Booking, records, pay", fr: "RDV, dossier, paiement" },
      },
      {
        title: { ar: "تطبيق الرعاية", en: "Care app", fr: "App soins" },
        description: { ar: "فيديو، إشعارات، وصفات", en: "Video, alerts, Rx", fr: "Vidéo, alertes, ordonnances" },
      },
      {
        title: { ar: "النظام السريري", en: "Clinical core", fr: "Cœur clinique" },
        description: { ar: "ملاحظات، مختبر، صيدلية", en: "Notes, lab, pharmacy", fr: "Notes, labo, pharmacie" },
      },
      {
        title: { ar: "أمان وامتثال", en: "Security & compliance", fr: "Sécurité & conformité" },
        description: { ar: "تشفير، موافقات، تدقيق", en: "Encryption, consent, audit", fr: "Chiffrement, consentement, audit" },
      },
    ],
    metrics: [
      { label: { ar: "no-show", en: "No-show rate", fr: "No-show" }, value: "22%", direction: "down" },
      { label: { ar: "استشارات فيديو/سنة", en: "Video consults/yr", fr: "Consultations vidéo/an" }, value: "180K", direction: "up" },
      { label: { ar: "انتظار حضوري", en: "In-person wait", fr: "Attente présentiel" }, value: "−40%", direction: "down" },
      { label: { ar: "أطباء على المنصة", en: "Physicians live", fr: "Médecins actifs" }, value: "800", direction: "neutral" },
    ],
    techStack: ["Next.js", "React Native", "WebRTC", "PostgreSQL", "HL7 FHIR", "AWS"],
    timeline: { ar: "10 أشهر", en: "10 months", fr: "10 mois" },
    scope: { ar: "120 فرع · 2M مريض · 800 طبيب", en: "120 sites · 2M patients · 800 doctors", fr: "120 sites · 2 M patients · 800 médecins" },
    publishedAt: "2025-03-15",
    relatedSlugs: ["data-platform-governance", "customer-ops-triage"],
    clientQuote: {
      quote: {
        ar: "المرضى في القرى يحصلون على طبيب خلال ساعات — والوصفة تصل للصيدلية إلكترونياً.",
        en: "Patients in rural areas reach a doctor within hours — and prescriptions reach the pharmacy electronically.",
        fr: "Les patients ruraux voient un médecin en heures — ordonnance électronique à la pharmacie.",
      },
      role: { ar: "مدير الشبكة الطبية", en: "Medical network director", fr: "Directeur réseau médical" },
      org: { ar: "شبكة عيادات المستقبل الطبية", en: "Future Care Clinic Network", fr: "Réseau Future Care Clinics" },
      initials: "MD",
    },
  },
];
