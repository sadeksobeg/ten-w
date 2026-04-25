export type DemoLocale = "en" | "ar" | "fr";
export type DemoScriptVariant = "alpha" | "beta" | "gamma";

export type CinematicDemoTimelineRow = {
  seq: number;
  kind: string;
  delayMs: number;
  payload: Record<string, unknown>;
};

function pickLocale(locale: string | undefined): DemoLocale {
  const l = (locale ?? "en").toLowerCase();
  if (l.startsWith("ar")) return "ar";
  if (l.startsWith("fr")) return "fr";
  return "en";
}

export function pickDemoVariant(input?: string): DemoScriptVariant {
  if (input === "beta" || input === "gamma") return input;
  return "alpha";
}

const VARIANTS: Record<
  DemoScriptVariant,
  { partner: string; dealUsd: number; commissionUsd: number; rank: number; n1: number; n2: number; pred: number }
> = {
  alpha: { partner: "Ahmed", dealUsd: 500, commissionUsd: 100, rank: 3, n1: 4, n2: 9, pred: 3200 },
  beta: { partner: "Sofia", dealUsd: 780, commissionUsd: 140, rank: 2, n1: 5, n2: 11, pred: 4100 },
  gamma: { partner: "Omar", dealUsd: 420, commissionUsd: 85, rank: 5, n1: 3, n2: 7, pred: 2800 },
};

const COPY: Record<
  DemoLocale,
  {
    hookTitle: string;
    hookSub: (usd: number) => string;
    stages: [string, string, string, string, string];
    dealClosed: (name: string, usd: number) => string;
    commission: (usd: number) => string;
    leaderboard: (rank: number) => string;
    network: (n: number) => string;
    insight: (usd: number) => string;
    outro: string;
    phaseSim: string;
    phaseNetwork: string;
    phaseInsight: string;
    phaseChat: string;
    chatCrisisLead: (name: string, usd: number) => string;
    chatPartner: string;
    chatIntervene: string;
    chatBonus: string;
    chatImpactAfterBonus: string;
    chatDealLine: (usd: number) => string;
    chatImpactAfterWin: string;
    climaxTitle: string;
    climaxSub: string;
    climaxOwnership: string;
  }
> = {
  en: {
    hookTitle: "Critical moment detected",
    hookSub: (usd) =>
      `A $${usd.toLocaleString("en-US")} deal is about to stall — intervention window open. Illustrative simulation only; production data is never touched.`,
    stages: ["Lead", "Contacted", "Negotiation", "Closed", "Paid"],
    dealClosed: (name, usd) => `Deal closed — ${name} · $${usd.toLocaleString("en-US")}`,
    commission: (usd) => `Commission credited · $${usd.toLocaleString("en-US")}`,
    leaderboard: (rank) => `Weekly leaderboard · You moved to #${rank}`,
    network: (n) => `Network expansion · ${n} active partners in your tree`,
    insight: (usd) => `System prediction · ~$${usd.toLocaleString("en-US")} projected this month`,
    outro: "Demo complete — partners see this momentum as narrative, not only numbers.",
    phaseSim: "Simulation · revenue stream",
    phaseNetwork: "Network · compounding reach",
    phaseInsight: "Intelligence · forward outlook",
    phaseChat: "Decision timeline · story",
    chatCrisisLead: (name, usd) =>
      `⚠️ Risk window · $${usd.toLocaleString("en-US")} on the line with ${name} — momentum stalling.`,
    chatPartner: "Partner: “The client is hesitating on scope and timeline.”",
    chatIntervene: "→ Admin intervenes · directive + incentive path activated.",
    chatBonus: "→ Bonus applied · $50 performance boost",
    chatImpactAfterBonus: "Impact · modeled close probability +18%",
    chatDealLine: (usd) => `→ Deal saved · +$${usd.toLocaleString("en-US")} captured`,
    chatImpactAfterWin: "Impact · decisive recovery · modeled probability +32%",
    climaxTitle: "You just controlled the outcome",
    climaxSub: "T.E.N.E.G.T.A — growth intelligence under your command.",
    climaxOwnership:
      "This happened because of your decision — without your move, this deal was lost.",
  },
  ar: {
    hookTitle: "لحظة حرجة — تدخل مطلوب",
    hookSub: (usd) =>
      `صفقة بقيمة ${usd.toLocaleString("ar-SA")} دولار على وشك التعثر — نافذة التدخل مفتوحة. محاكاة توضيحية فقط؛ لا تُمس بيانات الإنتاج.`,
    stages: ["عميل محتمل", "تم التواصل", "تفاوض", "مغلقة", "مدفوعة"],
    dealClosed: (name, usd) => `صفقة مُغلقة — ${name} · ${usd.toLocaleString("ar-SA")} $`,
    commission: (usd) => `عمولة مضافة · ${usd.toLocaleString("ar-SA")} $`,
    leaderboard: (rank) => `لوحة الأسبوع · انتقلت إلى المركز #${rank}`,
    network: (n) => `توسّع الشبكة · ${n} شريك نشط في شجرتك`,
    insight: (usd) => `توقع النظام · ~${usd.toLocaleString("ar-SA")} $ متوقعة هذا الشهر`,
    outro: "انتهت التجربة — يرى الشريك الزخم كقصة نجاح لا كأرقام فقط.",
    phaseSim: "محاكاة · تدفق الإيراد",
    phaseNetwork: "الشبكة · توسع مركّب",
    phaseInsight: "ذكاء · نظرة للأمام",
    phaseChat: "خط زمني للقرار · قصة",
    chatCrisisLead: (name, usd) =>
      `⚠️ نافذة خطر · ${usd.toLocaleString("ar-SA")} $ مع ${name} — الزخم يتباطأ.`,
    chatPartner: "الشريك: «العميل يتردد في النطاق والجدول الزمني.»",
    chatIntervene: "→ تدخل الإدارة · توجيه + مسار حافز مفعّل.",
    chatBonus: "→ مكافأة مُطبّقة · دفعة أداء ~٥٠ $",
    chatImpactAfterBonus: "أثر · احتمال الإغلاق النموذجي +١٨٪",
    chatDealLine: (usd) => `→ صفقة مُنقذة · +${usd.toLocaleString("ar-SA")} $`,
    chatImpactAfterWin: "أثر · تعافٍ حاسم · احتمال نموذجي +٣٢٪",
    climaxTitle: "لقد سيطرت على النتيجة",
    climaxSub: "T.E.N.E.G.T.A — ذكاء النمو بأمرك.",
    climaxOwnership:
      "حدث هذا بسبب قرارك — بدون تحركك كانت الصفقة ستضيع.",
  },
  fr: {
    hookTitle: "Moment critique détecté",
    hookSub: (usd) =>
      `Un closing ~${usd.toLocaleString("fr-FR")} $ est en train de dérailler — fenêtre d’intervention ouverte. Simulation illustrative ; aucune donnée de production n’est modifiée.`,
    stages: ["Lead", "Contacté", "Négociation", "Clôturé", "Payé"],
    dealClosed: (name, usd) => `Deal clôturé — ${name} · ${usd.toLocaleString("fr-FR")} $`,
    commission: (usd) => `Commission créditée · ${usd.toLocaleString("fr-FR")} $`,
    leaderboard: (rank) => `Classement hebdo · Vous passez #${rank}`,
    network: (n) => `Réseau · ${n} partenaires actifs dans votre arbre`,
    insight: (usd) => `Prédiction · ~${usd.toLocaleString("fr-FR")} $ projetés ce mois-ci`,
    outro: "Fin de démo — le partenaire vit l’élan comme un récit, pas seulement des chiffres.",
    phaseSim: "Simulation · flux de revenus",
    phaseNetwork: "Réseau · portée composée",
    phaseInsight: "Intelligence · perspective",
    phaseChat: "Chronologie · récit",
    chatCrisisLead: (name, usd) =>
      `⚠️ Fenêtre de risque · ~${usd.toLocaleString("fr-FR")} $ en jeu pour ${name} — élan en baisse.`,
    chatPartner: "Partenaire : « Le client hésite sur le périmètre et le timing. »",
    chatIntervene: "→ Admin intervient · directive + incitatif activés.",
    chatBonus: "→ Bonus appliqué · +50 $ (performance)",
    chatImpactAfterBonus: "Impact · probabilité de close modélisée +18 %",
    chatDealLine: (usd) => `→ Deal sauvé · +${usd.toLocaleString("fr-FR")} $ sécurisés`,
    chatImpactAfterWin: "Impact · récupération nette · probabilité modélisée +32 %",
    climaxTitle: "Vous venez de contrôler l’issue",
    climaxSub: "T.E.N.E.G.T.A — intelligence de croissance sous votre commande.",
    climaxOwnership:
      "C’est arrivé grâce à votre décision — sans votre action, ce deal était perdu.",
  },
};

export function buildCinematicDemoTimeline(
  localeInput?: string,
  variantInput?: string,
): CinematicDemoTimelineRow[] {
  const locale = pickLocale(localeInput);
  const variant = pickDemoVariant(variantInput);
  const L = COPY[locale];
  const V = VARIANTS[variant];
  const rows: CinematicDemoTimelineRow[] = [];
  let seq = 0;

  const push = (kind: string, delayMs: number, payload: Record<string, unknown>) => {
    rows.push({ seq: seq++, kind, delayMs, payload });
  };

  push("cinematic_hook", 1200, {
    headline: L.hookTitle,
    subline: L.hookSub(V.dealUsd),
    phase: "hook",
    variant,
  });

  push("phase_label", 450, { headline: L.phaseChat, phase: "story" });
  push("chat_story", 750, {
    headline: L.chatCrisisLead(V.partner, V.dealUsd),
    phase: "story",
    variant,
  });
  push("chat_story", 620, { headline: L.chatPartner, phase: "story" });
  push("chat_story", 620, { headline: L.chatIntervene, phase: "story" });
  push("chat_story", 580, { headline: L.chatBonus, phase: "story" });
  push("chat_story", 520, { headline: L.chatImpactAfterBonus, phase: "story" });
  push("chat_story", 700, { headline: L.chatDealLine(V.dealUsd), phase: "story" });
  push("chat_story", 520, { headline: L.chatImpactAfterWin, phase: "story" });

  push("phase_label", 500, { headline: L.phaseSim, phase: "sim" });

  for (let i = 0; i < 5; i++) {
    push("deal_stage", 420, {
      stageIndex: i,
      stageLabel: L.stages[i],
      headline: L.stages[i],
      phase: "sim",
    });
  }

  push("deal_closed", 700, {
    headline: L.dealClosed(V.partner, V.dealUsd),
    partnerName: V.partner,
    dealUsd: V.dealUsd,
    phase: "sim",
  });

  push("commission", 550, {
    headline: L.commission(V.commissionUsd),
    commissionUsd: V.commissionUsd,
    phase: "sim",
  });

  push("leaderboard_tick", 600, {
    headline: L.leaderboard(V.rank),
    rank: V.rank,
    phase: "sim",
  });

  push("phase_label", 500, { headline: L.phaseNetwork, phase: "network" });

  push("network_expand", 750, {
    headline: L.network(V.n1),
    nodes: V.n1,
    phase: "network",
  });

  push("network_expand", 650, {
    headline: L.network(V.n2),
    nodes: V.n2,
    phase: "network",
  });

  push("phase_label", 500, { headline: L.phaseInsight, phase: "insight" });

  push("insight_prediction", 900, {
    headline: L.insight(V.pred),
    predictionUsd: V.pred,
    phase: "insight",
  });

  push("cinematic_climax", 950, {
    headline: L.climaxTitle,
    subline: L.climaxSub,
    ownershipLine: L.climaxOwnership,
    phase: "climax",
  });

  push("cinematic_outro", 1100, { headline: L.outro, phase: "done" });

  return rows;
}
