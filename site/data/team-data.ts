/**
 * Founder-led · specialist network — real founder data
 */

import type { Localized } from "@/lib/fallback-data";

export const founderProfile = {
  name: "Sadek Al-Etr",
  nameAr: "صادق العتر",
  slug: "sadek-al-etr",
  portraitSrc: "/images/team/sadek-al-etr.jpg",
  role: {
    ar: "المؤسس · مهندس ذكاء اصطناعي وأمن سيبراني",
    en: "Founder · AI Engineer & Cybersecurity Specialist",
    fr: "Fondateur · Ingénieur IA & Spécialiste cybersécurité",
  },
  tagline: {
    ar: "يبني الأنظمة الذكية. ثم يحاول اختراقها. ثم يعيد بناءها.",
    en: "Builds intelligent systems. Then tries to break them. Then builds them again.",
    fr: "Construit des systèmes intelligents. Essaie de les pirater. Les reconstruit ensuite.",
  },
  bio: {
    ar: `مهندس ذكاء اصطناعي وباحث أمن سيبراني من دمشق، يحمل بكالوريوس هندسة تقنية المعلومات — تخصص ذكاء اصطناعي من جامعة دمشق.

ما يميز صادق ليس أنه يفعل الأشياء الثلاثة — بل أنه يفهم كيف يؤثر كل واحد منها على الآخرين. عندما يصمم نظام ذكاء اصطناعي، يفكر في كيفية مهاجمته. عندما يُقيّم أمن تطبيق، يفهم معماريته من الداخل. وعندما يبني واجهة، يعرف الثمن الذي تدفعه إن لم تكن مبنية بشكل صحيح.

على مدى أكثر من 4 سنوات من العمل الحر، أنجز مشاريع تشمل أنظمة رؤية حاسوبية، بوتات تحليل مالي ذكية، تقييمات اختراق لتطبيقات ويب متعددة، وبنية backend كاملة. وهو حاصل على شهادات (ISC)² SSCP، IBM Cybersecurity Analyst، وeWapt v3 في اختبار الاختراق المتقدم.

T.E.N.E.G.T.A وُلدت من قناعة بسيطة: المؤسسات التي تبني بالذكاء وتفكر بعقلية المهاجم هي وحدها من تبقى.`,
    en: `An AI engineer and cybersecurity researcher from Damascus, holding a BSc in Information Technology Engineering — AI Major from Damascus University.

What distinguishes Sadek isn't that he does all three things — it's that he understands how each one affects the others. When he designs an AI system, he's already thinking about how to attack it. When he assesses an application's security, he understands its architecture from the inside. When he builds an interface, he knows the cost of doing it wrong.

Over 4+ years of freelance work, he has delivered projects spanning computer vision systems, intelligent financial analysis bots, penetration assessments for multiple web applications, and full backend architectures. He holds (ISC)² SSCP, IBM Cybersecurity Analyst, and eWapt v3 certifications in advanced web application penetration testing.

T.E.N.E.G.T.A was born from a simple conviction: organizations that build with intelligence and think with an attacker's mindset are the only ones that last.`,
    fr: `Ingénieur IA et chercheur en cybersécurité de Damas, titulaire d'une licence en ingénierie des technologies de l'information — spécialisation IA de l'Université de Damas.

Ce qui distingue Sadek n'est pas qu'il fait les trois choses — c'est qu'il comprend comment chacune affecte les autres. Quand il conçoit un système IA, il pense déjà à comment l'attaquer. Quand il évalue la sécurité d'une application, il en comprend l'architecture de l'intérieur. Quand il construit une interface, il connaît le coût de le faire incorrectement.

Au cours de plus de 4 ans de travail indépendant, il a livré des projets couvrant des systèmes de vision par ordinateur, des bots d'analyse financière intelligents, des évaluations de pénétration pour plusieurs applications web, et des architectures backend complètes. Il est titulaire des certifications (ISC)² SSCP, IBM Cybersecurity Analyst, et eWapt v3.

T.E.N.E.G.T.A est née d'une conviction simple : les organisations qui construisent avec intelligence et pensent avec l'esprit d'un attaquant sont les seules à durer.`,
  },
  philosophy: {
    ar: "«النظام الآمن ليس النظام الذي يصعب اختراقه — بل النظام الذي صُمِّم من اليوم الأول على افتراض أن شخصاً يحاول ذلك.»",
    en: "\"A secure system isn't one that's hard to break — it's one designed from day one on the assumption that someone is trying.\"",
    fr: "«Un système sécurisé n'est pas celui qui est difficile à pirater — c'est celui conçu dès le premier jour sur l'hypothèse que quelqu'un essaie.»",
  },
  perspectives: [
    {
      title: {
        ar: "الذكاء الاصطناعي بدون طبقة قرار",
        en: "AI without a decision layer",
        fr: "L'IA sans couche de décision",
      },
      stance: {
        ar: "نموذج بدقة 94% في الإنتاج يفيد أكثر من نموذج 99% في notebook — لأن القرار التشغيلي لا يُبنى على metric، بل على ما يستطيع المدير فعله به.",
        en: "A 94% accurate model in production beats a 99% model in a notebook — because operational decisions aren't built on metrics, but on what a manager can actually do with the output.",
        fr: "Un modèle à 94% en production bat un modèle à 99% dans un notebook — car les décisions opérationnelles ne reposent pas sur des métriques, mais sur ce qu'un manager peut réellement en faire.",
      },
    },
    {
      title: {
        ar: "الأمن كملحق",
        en: "Security as an add-on",
        fr: "La sécurité en complément",
      },
      stance: {
        ar: "أرفض أن أبني نظاماً لا أستطيع تفسير قراره لمن سيثق به — والأمن ليس تدقيقاً في النهاية، بل افتراضاً في أول يوم من التصميم.",
        en: "I refuse to build a system whose decisions I can't explain to the person who'll trust it — security isn't a final audit, it's an assumption on day one of design.",
        fr: "Je refuse de construire un système dont je ne peux expliquer les décisions à celui qui lui fera confiance — la sécurité n'est pas un audit final, c'est une hypothèse dès le premier jour de conception.",
      },
    },
    {
      title: {
        ar: "الفريق الكبير لكل شيء",
        en: "The large team for everything",
        fr: "La grande équipe pour tout",
      },
      stance: {
        ar: "كل مشروع يستحق التخصص الذي يحتاجه — لا هيكلاً ثابتاً. شبكة متخصصين مختارة لكل تحدي أفضل من عشرة generalists على كل عقد.",
        en: "Every project deserves the specialization it needs — not a fixed org chart. A curated specialist network per challenge beats ten generalists on every contract.",
        fr: "Chaque projet mérite la spécialisation dont il a besoin — pas un organigramme fixe. Un réseau de spécialistes sélectionnés par défi bat dix généralistes sur chaque contrat.",
      },
    },
  ],
  intersection: {
    title: {
      ar: "التقاطع الذي نادراً ما تجده في شخص واحد",
      en: "The Intersection You Rarely Find in One Person",
      fr: "L'intersection que l'on trouve rarement en une seule personne",
    },
    description: {
      ar: "معظم مهندسي الذكاء الاصطناعي لا يفهمون الأمن. معظم خبراء الأمن لا يبنون الأنظمة. وقليل جداً منهم يصممون أيضاً. صادق يعمل في التقاطع الثلاثي — وهذا ما يجعل المنتج النهائي مختلفاً.",
      en: "Most AI engineers don't understand security. Most security experts don't build systems. And very few of them also design. Sadek works at the triple intersection — and that's what makes the final product different.",
      fr: "La plupart des ingénieurs IA ne comprennent pas la sécurité. La plupart des experts en sécurité ne construisent pas de systèmes. Et très peu d'entre eux conçoivent également. Sadek travaille à l'intersection triple — et c'est ce qui rend le produit final différent.",
    },
    pillars: [
      {
        icon: "🧠",
        label: { ar: "ذكاء اصطناعي", en: "AI Engineering", fr: "Ingénierie IA" },
        note: {
          ar: "ML · رؤية حاسوبية · نماذج تنبؤية",
          en: "ML · Computer Vision · Predictive Models",
          fr: "ML · Vision par ordinateur · Modèles prédictifs",
        },
      },
      {
        icon: "🔐",
        label: { ar: "أمن سيبراني", en: "Cybersecurity", fr: "Cybersécurité" },
        note: {
          ar: "اختبار اختراق · OWASP · Zero-Trust",
          en: "Penetration Testing · OWASP · Zero-Trust",
          fr: "Tests d'intrusion · OWASP · Zero-Trust",
        },
      },
      {
        icon: "⚙️",
        label: { ar: "هندسة برمجيات", en: "Software Engineering", fr: "Génie logiciel" },
        note: {
          ar: "Backend · APIs · معمارية أنظمة",
          en: "Backend · APIs · Systems Architecture",
          fr: "Backend · APIs · Architecture systèmes",
        },
      },
    ],
  },
  certifications: [
    { name: "(ISC)² SSCP", org: "(ISC)²", type: "security" as const },
    { name: "IBM Cybersecurity Analyst Professional", org: "IBM", type: "security" as const },
    { name: "eWapt v3 — Web Application Penetration Testing", org: "eLearnSecurity", type: "security" as const },
    { name: "IBM Machine Learning Professional", org: "IBM", type: "ai" as const },
    { name: "Google Data Analytics", org: "Google", type: "data" as const },
    { name: "Google UX Design", org: "Google", type: "design" as const },
    { name: "Deep Learning Specialization", org: "Coursera", type: "ai" as const },
    { name: "Algorithms Part I & II", org: "Princeton/Coursera", type: "engineering" as const },
  ],
  techDomains: [
    {
      domain: { ar: "الذكاء الاصطناعي", en: "AI & ML", fr: "IA & ML" },
      skills: ["Python", "PyTorch", "CNNs", "RNNs", "Vision Transformers", "OCR", "MLflow", "Pandas", "NumPy"],
    },
    {
      domain: { ar: "الأمن السيبراني", en: "Cybersecurity", fr: "Cybersécurité" },
      skills: [
        "Burp Suite",
        "OWASP Top 10",
        "Penetration Testing",
        "SQLi/XSS/IDOR/CSRF",
        "Network Security",
        "Vulnerability Assessment",
      ],
    },
    {
      domain: { ar: "هندسة البرمجيات", en: "Software Engineering", fr: "Génie logiciel" },
      skills: ["Django", "Flask", "REST APIs", "ReactJS", "Flutter/Dart", "SQL", "JavaScript", "C++"],
    },
    {
      domain: { ar: "التصميم", en: "Design", fr: "Design" },
      skills: ["Figma", "Adobe XD", "UI/UX", "Motion Graphics", "Prototyping"],
    },
  ],
  linkedin: "https://www.linkedin.com/in/sadek-al-etr-084b34205",
  tryhackme: "https://tryhackme.com/p/TENEGTA",
  initials: "SA",
  accentColor: "amber",
};

export const workModel = {
  title: {
    ar: "كيف نعمل",
    en: "How We Work",
    fr: "Comment nous travaillons",
  },
  subtitle: {
    ar: "قيادة مؤسسية · شبكة متخصصين",
    en: "Founder-Led · Specialist Network",
    fr: "Dirigé par le fondateur · Réseau de spécialistes",
  },
  description: {
    ar: "T.E.N.E.G.T.A لا تؤمن بنموذج «فريق كبير لكل شيء». نبني حول كل مشروع بالضبط من يستحقه — قيادة تقنية مباشرة من المؤسس، وتخصصات إضافية من شبكة متخصصين مختارين بدقة حسب طبيعة التحدي.",
    en: "T.E.N.E.G.T.A doesn't believe in the 'large team for everything' model. We build around each project exactly what it deserves — direct technical leadership from the founder, and additional specializations from a carefully curated network selected based on the nature of the challenge.",
    fr: "T.E.N.E.G.T.A ne croit pas au modèle « grande équipe pour tout ». Nous construisons autour de chaque projet exactement ce qu'il mérite — un leadership technique direct du fondateur, et des spécialisations supplémentaires d'un réseau de spécialistes soigneusement sélectionnés selon la nature du défi.",
  },
  networkNote: {
    ar: "نعمل مع شبكة متخصصين مختارة — يُستدعى كل منهم حسب ما يتطلبه المشروع فعلاً، لا ما يفرضه هيكل تنظيمي.",
    en: "We work with a curated network of domain specialists — each engaged per project based on what the challenge actually requires, not what's on an org chart.",
    fr: "Nous travaillons avec un réseau de spécialistes sélectionnés — chacun mobilisé par projet selon ce que le défi exige réellement, pas selon un organigramme.",
  },
  benefits: [
    {
      icon: "🎯",
      title: { ar: "المؤسس في كل مشروع", en: "Founder on Every Project", fr: "Le fondateur sur chaque projet" },
      description: {
        ar: "لن تتحدث مع مدير حساب. ستتحدث مع من يكتب الكود ويفهم المشكلة.",
        en: "You won't talk to an account manager. You'll talk to the person who writes the code and understands the problem.",
        fr: "Vous ne parlerez pas à un chargé de compte. Vous parlerez à celui qui écrit le code et comprend le problème.",
      },
    },
    {
      icon: "🔬",
      title: { ar: "تخصص لا تعميم", en: "Specialization over Generalization", fr: "Spécialisation plutôt que généralisation" },
      description: {
        ar: "كل مشروع يحتاج نوعاً مختلفاً من الخبرة. نجلب التخصص الصحيح لكل تحدي — لا نوزع فريقاً واحداً على كل شيء.",
        en: "Every project needs a different kind of expertise. We bring the right specialization to each challenge — not a single team spread across everything.",
        fr: "Chaque projet nécessite un type d'expertise différent. Nous apportons la bonne spécialisation à chaque défi — pas une seule équipe répartie sur tout.",
      },
    },
    {
      icon: "🛡️",
      title: { ar: "مبني بعقلية المهاجم", en: "Built with an Attacker's Mindset", fr: "Construit avec l'esprit d'un attaquant" },
      description: {
        ar: "كل نظام نبنيه يمر بتفكير أمني من اليوم الأول — لأن من يبنيه يفهم أيضاً كيف يُكسر.",
        en: "Every system we build passes through security thinking from day one — because the person building it also understands how it breaks.",
        fr: "Chaque système que nous construisons passe par une réflexion sécuritaire dès le premier jour — car celui qui le construit comprend aussi comment il se brise.",
      },
    },
  ],
  engagement: {
    assess: {
      ar: "نبدأ بفهم المشكلة الحقيقية خلف ما يُوصف — ثم نحدد ما إذا كان التحدي تقنياً أم تشغيلياً أم معمارياً، وما المؤشرات التي تعني النجاح.",
      en: "We start by understanding the real problem behind what's described — then clarify whether the challenge is technical, operational, or architectural, and which metrics define success.",
      fr: "Nous commençons par comprendre le vrai problème derrière ce qui est décrit — puis clarifions si le défi est technique, opérationnel ou architectural, et quelles métriques définissent le succès.",
    },
    staff: {
      ar: "نختار من شبكة التخصص من يملك خبرة في قطاعكم ونوع النظام — مع بقاء المؤسس مسؤولاً عن القرارات المعمارية والتسليم.",
      en: "We select from our specialist network who has experience in your sector and system type — while the founder remains accountable for architectural decisions and delivery.",
      fr: "Nous sélectionnons dans notre réseau qui a l'expérience de votre secteur et type de système — le fondateur restant responsable des décisions d'architecture et de la livraison.",
    },
    decline: {
      ar: "لا نقبل مشاريع بدون مالك تشغيلي واضح، أو «تسليم نموذج» بدون مسار إنتاج، أو طلبات أمنية تُضاف بعد اكتمال البناء.",
      en: "We don't take projects without a clear operational owner, 'model delivery' without a production path, or security requests bolted on after the build is done.",
      fr: "Nous n'acceptons pas les projets sans propriétaire opérationnel clair, la « livraison de modèle » sans chemin vers la production, ou les demandes de sécurité ajoutées après la construction.",
    },
  },
};

export interface TeamPrinciple {
  title: Localized;
  description: Localized;
  icon: string;
}

export const teamPrinciples: TeamPrinciple[] = [
  {
    icon: "🎯",
    title: {
      ar: "المشكلة خلف المشكلة",
      en: "The Problem Behind the Problem",
      fr: "Le problème derrière le problème",
    },
    description: {
      ar: "قبل أي سطر كود، نسأل: ما الذي يؤلم فعلاً؟ ليس ما تصفه — بل ما يجعلك تصفه. الحل الصح للمشكلة الخطأ لا يزال خطأ.",
      en: "Before any line of code, we ask: what's really hurting? Not what you describe — but what makes you describe it. The right solution to the wrong problem is still wrong.",
      fr: "Avant toute ligne de code, nous demandons : qu'est-ce qui fait vraiment mal ? Pas ce que vous décrivez — mais ce qui vous amène à le décrire. La bonne solution au mauvais problème reste mauvaise.",
    },
  },
  {
    icon: "🔐",
    title: {
      ar: "الأمن قرار معماري، لا ميزة إضافية",
      en: "Security is an Architectural Decision, Not an Add-on",
      fr: "La sécurité est une décision architecturale, pas un ajout",
    },
    description: {
      ar: "لا نضيف الأمن في نهاية المشروع. نفكر في كيفية مهاجمة النظام قبل أن نبدأ ببنائه — لأن إصلاح الثغرة بعد النشر يكلف أضعاف منعها في التصميم.",
      en: "We don't add security at the end of a project. We think about how to attack a system before we begin building it — because fixing a vulnerability after deployment costs multiples of preventing it in design.",
      fr: "Nous n'ajoutons pas la sécurité à la fin d'un projet. Nous réfléchissons à la façon d'attaquer un système avant de commencer à le construire — car corriger une vulnérabilité après déploiement coûte des multiples de la prévenir en conception.",
    },
  },
  {
    icon: "🔍",
    title: {
      ar: "الوضوح على الذكاء",
      en: "Clarity over Cleverness",
      fr: "La clarté plutôt que l'intelligence",
    },
    description: {
      ar: "الكود الذكي الذي لا يفهمه أحد غيرك ليس فضيلة — هو عبء على من يأتي بعدك. نكتب كوداً يشرح نفسه ونحتفظ بالذكاء للمشكلات التي تستحقه حقاً.",
      en: "Clever code that no one else understands isn't a virtue — it's a burden on whoever comes after. We write self-explaining code and save cleverness for problems that truly deserve it.",
      fr: "Le code intelligent que personne d'autre ne comprend n'est pas une vertu — c'est un fardeau pour celui qui vient après. Nous écrivons du code auto-explicatif et gardons l'intelligence pour les problèmes qui le méritent vraiment.",
    },
  },
];
