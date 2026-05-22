export type ChatKeywordLink = {
  /** i18n key under Growth.chat.keywords */
  labelKey: string;
  href: string;
};

export type ChatKeywordMatch = {
  triggerKey: string;
  links: ChatKeywordLink[];
};

const RULES: { keys: string[]; triggerKey: string; links: ChatKeywordLink[] }[] = [
  {
    keys: ["عقود", "عقودة", "عقد", "contract", "contracts", "صفقة", "صفقات", "deal", "deals"],
    triggerKey: "contracts",
    links: [
      { labelKey: "deals", href: "/growth/deals" },
      { labelKey: "kit", href: "/growth/kit" },
    ],
  },
  {
    keys: ["عمولة", "عمولات", "commission", "أرباح", "ارباح", "earnings", "payout", "سحب"],
    triggerKey: "earnings",
    links: [
      { labelKey: "earnings", href: "/growth/earnings" },
      { labelKey: "network", href: "/growth/network" },
    ],
  },
  {
    keys: ["فعالية", "فعاليات", "event", "events", "تحدي"],
    triggerKey: "events",
    links: [{ labelKey: "events", href: "/growth/events" }],
  },
  {
    keys: ["شارة", "شارات", "badge", "badges"],
    triggerKey: "badges",
    links: [{ labelKey: "dashboard", href: "/growth" }],
  },
];

export function matchChatKeywords(body: string): ChatKeywordMatch | null {
  const normalized = body.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.keys.some((k) => normalized.includes(k.toLowerCase()))) {
      return { triggerKey: rule.triggerKey, links: rule.links };
    }
  }
  return null;
}
