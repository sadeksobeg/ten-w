/**
 * site/data/team-data.ts
 *
 * بيانات الفريق — بيوغرافيات احترافية بأسلوب Linear/Vercel
 * استبدل بالبيانات الحقيقية — الهيكل ثابت
 */

export type Localized = { ar: string; en: string; fr: string };

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: Localized;
  shortBio: Localized;     // جملة واحدة — تظهر في البطاقة
  fullBio: Localized;      // فقرة — تظهر في صفحة العضو
  philosophy: Localized;   // رأيه في مسألة تقنية — ما يميزه
  expertiseTags: string[]; // تقنيات وتخصصات
  linkedinSlug?: string;   // linkedin.com/in/{slug}
  githubSlug?: string;
  initials: string;        // للـ avatar SVG
  accentColor: string;     // tailwind color
}

export const teamMembers: TeamMember[] = [
  {
    id: "tm-lead",
    slug: "technology-lead",
    name: "T.E.N.E.G.T.A",                  // استبدل بالاسم الحقيقي
    role: {
      ar: "المؤسس والرئيس التنفيذي للتقنية",
      en: "Founder & Chief Technology Officer",
      fr: "Fondateur & Directeur technique",
    },
    shortBio: {
      ar: "يصمم أنظمة تفكر قبل أن يسألها أحد.",
      en: "Designs systems that think before anyone asks them to.",
      fr: "Conçoit des systèmes qui pensent avant qu'on le leur demande.",
    },
    fullBio: {
      ar: "خبرة في بناء أنظمة ذكاء اصطناعي وبنية برمجيات مؤسسية تتحمل الضغط الحقيقي. يؤمن أن الهندسة الجيدة تُقاس بما لا يحدث — لا بما يُبنى.",
      en: "Experience building AI systems and enterprise software architecture that withstands real pressure. Believes good engineering is measured by what doesn't happen — not what gets built.",
      fr: "Expérience dans la construction de systèmes IA et d'architectures logicielles d'entreprise résistant à la pression réelle. Croit que la bonne ingénierie se mesure à ce qui ne se passe pas — pas à ce qui est construit.",
    },
    philosophy: {
      ar: "«الكود الجيد ليس الكود الذي يعمل — بل الكود الذي يوضح لمن يقرأه بعدك ما كان يدور في ذهنك.»",
      en: "\"Good code isn't code that works — it's code that makes clear to the next reader what was on your mind.\"",
      fr: "«Le bon code n'est pas le code qui fonctionne — c'est le code qui clarifie au prochain lecteur ce que vous aviez en tête.»",
    },
    expertiseTags: ["AI Systems Design", "Software Architecture", "Cybersecurity", "Python", "TypeScript", "Kubernetes"],
    initials: "TL",
    accentColor: "amber",
  },
  {
    id: "tm-ai",
    slug: "ai-systems-engineer",
    name: "AI Systems Engineer",              // استبدل بالاسم الحقيقي
    role: {
      ar: "مهندس أنظمة الذكاء الاصطناعي",
      en: "AI Systems Engineer",
      fr: "Ingénieur systèmes IA",
    },
    shortBio: {
      ar: "يحوّل نماذج ML من notebook إلى إنتاج يتحمل ملايين الطلبات.",
      en: "Takes ML models from notebook to production handling millions of requests.",
      fr: "Fait passer les modèles ML du notebook à la production gérant des millions de requêtes.",
    },
    fullBio: {
      ar: "متخصص في MLOps وهندسة بنيات الذكاء الاصطناعي للإنتاج. يرى أن أصعب جزء في الذكاء الاصطناعي ليس تدريب النموذج — بل الحفاظ على دقته بعد 6 أشهر في بيئة متغيرة.",
      en: "Specialized in MLOps and AI production architecture. Believes the hardest part of AI isn't training the model — it's maintaining its accuracy 6 months later in a changing environment.",
      fr: "Spécialisé en MLOps et architecture IA de production. Estime que la partie la plus difficile de l'IA n'est pas l'entraînement du modèle — c'est maintenir sa précision 6 mois plus tard dans un environnement changeant.",
    },
    philosophy: {
      ar: "«نموذج بدقة 94% في production أفيد من نموذج بدقة 99% في notebook.»",
      en: "\"A model at 94% accuracy in production is more valuable than a 99% accurate model in a notebook.\"",
      fr: "«Un modèle à 94% de précision en production vaut plus qu'un modèle à 99% dans un notebook.»",
    },
    expertiseTags: ["MLOps", "Python", "PyTorch", "Kafka", "Feature Engineering", "Model Monitoring"],
    initials: "AE",
    accentColor: "blue",
  },
  {
    id: "tm-security",
    slug: "security-architect",
    name: "Security Architect",               // استبدل بالاسم الحقيقي
    role: {
      ar: "مهندس الأمن السيبراني",
      en: "Cybersecurity Architect",
      fr: "Architecte cybersécurité",
    },
    shortBio: {
      ar: "يفكر كالمهاجم ليبني كالمدافع.",
      en: "Thinks like an attacker to build like a defender.",
      fr: "Pense comme un attaquant pour construire comme un défenseur.",
    },
    fullBio: {
      ar: "خبرة في تصميم بنيات Zero-Trust وتحليل التهديدات لأنظمة حرجة. يعتقد أن الأمان ليس ميزة تضيفها في النهاية — بل قرار معماري تتخذه في أول يوم.",
      en: "Experience designing Zero-Trust architectures and threat analysis for critical systems. Believes security isn't a feature you add at the end — it's an architectural decision you make on day one.",
      fr: "Expérience dans la conception d'architectures Zero-Trust et l'analyse des menaces pour les systèmes critiques. Croit que la sécurité n'est pas une fonctionnalité qu'on ajoute à la fin — c'est une décision architecturale prise le premier jour.",
    },
    philosophy: {
      ar: "«اسأل نفسك: ماذا يريد المهاجم؟ وما أسهل مسار له؟ ثم ابنِ بحيث يكون كل مسار صعباً.»",
      en: "\"Ask yourself: what does the attacker want? And what's the easiest path? Then build so every path is hard.\"",
      fr: "«Demandez-vous : que veut l'attaquant ? Et quel est le chemin le plus facile ? Puis construisez pour que chaque chemin soit difficile.»",
    },
    expertiseTags: ["Zero-Trust", "SIEM/SOAR", "MITRE ATT&CK", "Penetration Testing", "ISO 27001", "NIST CSF"],
    initials: "SA",
    accentColor: "red",
  },
  {
    id: "tm-fullstack",
    slug: "fullstack-engineer",
    name: "Senior Fullstack Engineer",        // استبدل بالاسم الحقيقي
    role: {
      ar: "مهندس برمجيات أول",
      en: "Senior Software Engineer",
      fr: "Ingénieur logiciel senior",
    },
    shortBio: {
      ar: "يكتب كوداً يُقرأ — لا كوداً يعمل فقط.",
      en: "Writes code that reads — not code that merely works.",
      fr: "Écrit du code qui se lit — pas du code qui fonctionne simplement.",
    },
    fullBio: {
      ar: "متخصص في هندسة backend الأنظمة المؤسسية وواجهات أمامية عالية الأداء. يؤمن أن التوثيق الجيد والكود القابل للاختبار ليسا رفاهية — بل ما يجعل المشروع قابلاً للحياة بعد السنة الأولى.",
      en: "Specialized in enterprise backend systems and high-performance frontends. Believes good documentation and testable code aren't luxuries — they're what makes a project viable after year one.",
      fr: "Spécialisé dans les systèmes backend d'entreprise et les frontends haute performance. Croit que la bonne documentation et le code testable ne sont pas des luxes — ils rendent un projet viable après la première année.",
    },
    philosophy: {
      ar: "«قبل أن تكتب خطاً واحداً، اسأل: هل أستطيع أن أشرح ما يفعله هذا الكود لمهندس لم يرَ المشروع من قبل؟»",
      en: "\"Before writing a single line, ask: can I explain what this code does to an engineer who has never seen the project?\"",
      fr: "«Avant d'écrire une seule ligne, demandez : puis-je expliquer ce que fait ce code à un ingénieur qui n'a jamais vu le projet ?»",
    },
    expertiseTags: ["TypeScript", "Node.js", "Next.js", "PostgreSQL", "Redis", "Testing", "CI/CD"],
    initials: "SE",
    accentColor: "emerald",
  },
];

// ─────────────────────────────────────────────
// HOW WE THINK — فلسفة الفريق
// ─────────────────────────────────────────────

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
      ar: "قبل أن نكتب سطراً، نسأل: ما الذي يؤلم فعلاً؟ ليس ما تصفه — بل ما يجعلك تصفه. الحل الصح للمشكلة الخطأ لا يزال خطأ.",
      en: "Before we write a line, we ask: what's really hurting? Not what you describe — but what makes you describe it. The right solution to the wrong problem is still wrong.",
      fr: "Avant d'écrire une ligne, nous demandons : qu'est-ce qui fait vraiment mal ? Pas ce que vous décrivez — mais ce qui vous amène à le décrire. La bonne solution au mauvais problème reste mauvaise.",
    },
  },
  {
    icon: "🏗️",
    title: {
      ar: "المعمارية أولاً، الكود ثانياً",
      en: "Architecture First, Code Second",
      fr: "L'architecture d'abord, le code ensuite",
    },
    description: {
      ar: "قرارات اليوم الأول في التصميم تحدد هامش التحرك للسنتين القادمتين. نقضي وقتاً أطول في التفكير مما نقضيه في الكتابة — لأن إعادة التفكير أرخص من إعادة الكتابة.",
      en: "Day-one design decisions determine the margin of movement for the next two years. We spend more time thinking than writing — because rethinking is cheaper than rewriting.",
      fr: "Les décisions de conception du premier jour déterminent la marge de manœuvre des deux prochaines années. Nous passons plus de temps à réfléchir qu'à écrire — car repenser est moins cher que réécrire.",
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
      ar: "الكود الذكي الذي لا يفهمه أحد غيرك ليس فضيلة — هو عبء على من يأتي بعدك. نكتب كوداً يشرح نفسه، ونحتفظ بالذكاء للمشاكل التي تستحقه حقاً.",
      en: "Clever code that no one else understands isn't a virtue — it's a burden on whoever comes after you. We write code that explains itself, and save cleverness for problems that truly deserve it.",
      fr: "Le code intelligent que personne d'autre ne comprend n'est pas une vertu — c'est un fardeau pour celui qui vient après vous. Nous écrivons un code qui s'explique lui-même, et gardons l'intelligence pour les problèmes qui le méritent vraiment.",
    },
  },
];
