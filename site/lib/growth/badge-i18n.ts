export type BadgeCopy = {
  name: string;
  description: string;
  howTo: string;
};

type Locale = "ar" | "en" | "fr";

const AR: Record<string, BadgeCopy> = {
  first_deal: {
    name: "أول صفقة",
    description: "أغلقت أول صفقة ناجحة.",
    howTo: "أغلق صفقة واحدة على الأقل.",
  },
  deals_5: {
    name: "خمس صفقات",
    description: "أغلقت 5 صفقات.",
    howTo: "أغلق 5 صفقات بنجاح.",
  },
  deals_10: {
    name: "عشر صفقات",
    description: "معيار 10 صفقات مغلقة.",
    howTo: "أغلق 10 صفقات.",
  },
  first_referral: {
    name: "أول إحالة",
    description: "جلبت أول شريك للشبكة.",
    howTo: "سجّل شريكاً عبر رمز إحالتك.",
  },
  top_performer: {
    name: "أفضل أداء",
    description: "تصدرت لوحة المتصدرين.",
    howTo: "حقّق أعلى نقاط مركّبة في الأسبوع.",
  },
  ai_seller: {
    name: "بائع ذكي",
    description: "استخدمت أدوات التسويق الذكية.",
    howTo: "افتح 3 مواد تسويقية من الحقيبة.",
  },
  fast_closer: {
    name: "إغلاق سريع",
    description: "أغلقت صفقة خلال 24 ساعة.",
    howTo: "أغلق صفقة خلال يوم من فتحها.",
  },
  network_builder: {
    name: "باني شبكة",
    description: "3 شركاء أو أكثر تحتك.",
    howTo: "اجذب 3 شركاء نشطين.",
  },
  elite_pulse: {
    name: "نبض النخبة",
    description: "شارة مخفية للسلاسل الاستثنائية.",
    howTo: "حافظ على سلسلة نشاط طويلة.",
  },
  trusted_partner: {
    name: "شريك موثوق",
    description: "منحت من الإدارة.",
    howTo: "يمنحها فريق T.E.N.E.G.T.A.",
  },
  vip_seller: {
    name: "بائع VIP",
    description: "تميز في المبيعات.",
    howTo: "يمنحها فريق T.E.N.E.G.T.A.",
  },
  strategic_agent: {
    name: "وكيل استراتيجي",
    description: "أداء استراتيجي مميز.",
    howTo: "يمنحها فريق T.E.N.E.G.T.A.",
  },
};

const EN: Record<string, BadgeCopy> = {
  first_deal: {
    name: "First Deal",
    description: "Closed your first deal.",
    howTo: "Close at least one deal.",
  },
  deals_5: {
    name: "5 Deals Closed",
    description: "Closed 5 deals.",
    howTo: "Close 5 deals.",
  },
  deals_10: {
    name: "10 Deals Milestone",
    description: "Closed 10 deals.",
    howTo: "Close 10 deals.",
  },
  first_referral: {
    name: "First Referral",
    description: "Recruited your first partner.",
    howTo: "Refer a partner with your code.",
  },
  top_performer: {
    name: "Top Performer",
    description: "Weekly leaderboard winner.",
    howTo: "Top composite score this week.",
  },
  ai_seller: {
    name: "AI Seller",
    description: "Used marketing kit materials.",
    howTo: "Open 3 kit assets.",
  },
  fast_closer: {
    name: "Fast Closer",
    description: "Closed within 24 hours.",
    howTo: "Close a deal within 24h of opening.",
  },
  network_builder: {
    name: "Network Builder",
    description: "3+ partners under you.",
    howTo: "Recruit 3 active partners.",
  },
  elite_pulse: {
    name: "Elite Pulse",
    description: "Hidden streak excellence.",
    howTo: "Maintain a long activity streak.",
  },
  trusted_partner: {
    name: "Trusted Partner",
    description: "Awarded by admin.",
    howTo: "Granted by T.E.N.E.G.T.A team.",
  },
  vip_seller: {
    name: "VIP Seller",
    description: "Sales excellence.",
    howTo: "Granted by T.E.N.E.G.T.A team.",
  },
  strategic_agent: {
    name: "Strategic Agent",
    description: "Strategic performance.",
    howTo: "Granted by T.E.N.E.G.T.A team.",
  },
};

const FR: Record<string, BadgeCopy> = {
  first_deal: {
    name: "Première vente",
    description: "Première affaire conclue.",
    howTo: "Conclure au moins une affaire.",
  },
  deals_5: {
    name: "5 ventes",
    description: "5 affaires conclues.",
    howTo: "Conclure 5 affaires.",
  },
  deals_10: {
    name: "10 ventes",
    description: "10 affaires conclues.",
    howTo: "Conclure 10 affaires.",
  },
  first_referral: {
    name: "Premier parrainage",
    description: "Premier partenaire recruté.",
    howTo: "Parrainer un partenaire.",
  },
  top_performer: {
    name: "Top performer",
    description: "Leader du classement.",
    howTo: "Meilleur score composite.",
  },
  ai_seller: {
    name: "Vendeur IA",
    description: "Kit marketing utilisé.",
    howTo: "Ouvrir 3 ressources kit.",
  },
  fast_closer: {
    name: "Clôture rapide",
    description: "Affaire en 24h.",
    howTo: "Clôturer en 24h.",
  },
  network_builder: {
    name: "Bâtisseur réseau",
    description: "3+ partenaires.",
    howTo: "Recruter 3 partenaires.",
  },
  elite_pulse: {
    name: "Pulse élite",
    description: "Badge caché série.",
    howTo: "Longue série d'activité.",
  },
  trusted_partner: {
    name: "Partenaire de confiance",
    description: "Attribué par l'admin.",
    howTo: "Par l'équipe T.E.N.E.G.T.A.",
  },
  vip_seller: {
    name: "Vendeur VIP",
    description: "Excellence commerciale.",
    howTo: "Par l'équipe T.E.N.E.G.T.A.",
  },
  strategic_agent: {
    name: "Agent stratégique",
    description: "Performance stratégique.",
    howTo: "Par l'équipe T.E.N.E.G.T.A.",
  },
};

const BY_LOCALE: Record<Locale, Record<string, BadgeCopy>> = { ar: AR, en: EN, fr: FR };

export function resolveBadgeCopy(
  key: string,
  locale: string,
  fallback?: { name: string; description?: string | null },
): BadgeCopy {
  const loc = (locale === "ar" || locale === "fr" ? locale : "en") as Locale;
  const hit = BY_LOCALE[loc][key];
  if (hit) return hit;
  return {
    name: fallback?.name ?? key,
    description: fallback?.description ?? "",
    howTo: fallback?.description ?? "",
  };
}
