export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeTier = "bronze" | "silver" | "gold" | "legendary";

/** @deprecated use iconSlug — kept for legacy IconPath fallback */
export type BadgeIconId =
  | "lightning"
  | "target"
  | "diamond"
  | "link"
  | "globe"
  | "robot"
  | "bolt_clock"
  | "crown"
  | "sparkle"
  | "star";

export type BadgeShapeId =
  | "circle"
  | "hexagon"
  | "pentagon"
  | "star16"
  | "shield"
  | "medal"
  | "diamond_frame"
  | "octagon"
  | "crest";

export type BadgeVisualMeta = {
  rarity: BadgeRarity;
  iconSlug: string;
  iconId: BadgeIconId;
  glowColor: string;
  shapeId: BadgeShapeId;
  /** Animated holo on legendary */
  holo?: boolean;
  /** Premium SVG medal in /public/badges */
  assetPath?: string;
  tier?: BadgeTier;
  /** Mini badge chip beside name in event chat */
  showInChat?: boolean;
};

type BadgeVisualInput = Omit<BadgeVisualMeta, "assetPath"> &
  Partial<Pick<BadgeVisualMeta, "assetPath">>;

function medal(key: string, meta: BadgeVisualInput): BadgeVisualMeta {
  return { ...meta, assetPath: meta.assetPath ?? `/badges/${key}.svg` };
}

const BADGE_VISUAL: Record<string, BadgeVisualMeta> = {
  first_deal: medal("first_deal", {
    rarity: "rare",
    iconSlug: "trophy",
    iconId: "lightning",
    glowColor: "#e4b84d",
    shapeId: "shield",
    tier: "bronze",
  }),
  deals_5: medal("deals_5", {
    rarity: "epic",
    iconSlug: "bullseye",
    iconId: "target",
    glowColor: "#60a5fa",
    shapeId: "hexagon",
    tier: "silver",
  }),
  deals_10: medal("deals_10", {
    rarity: "legendary",
    iconSlug: "cut-diamond",
    iconId: "diamond",
    glowColor: "#22d3ee",
    shapeId: "star16",
    holo: true,
    tier: "gold",
  }),
  first_referral: medal("first_referral", {
    rarity: "rare",
    iconSlug: "chain",
    iconId: "link",
    glowColor: "#34d399",
    shapeId: "circle",
    tier: "bronze",
  }),
  network_builder: medal("network_builder", {
    rarity: "epic",
    iconSlug: "network",
    iconId: "globe",
    glowColor: "#3b82f6",
    shapeId: "octagon",
    tier: "silver",
  }),
  ai_seller: medal("ai_seller", {
    rarity: "rare",
    iconSlug: "robot",
    iconId: "robot",
    glowColor: "#a78bfa",
    shapeId: "pentagon",
    tier: "bronze",
  }),
  fast_closer: medal("fast_closer", {
    rarity: "epic",
    iconSlug: "stopwatch",
    iconId: "bolt_clock",
    glowColor: "#fbbf24",
    shapeId: "diamond_frame",
    tier: "silver",
  }),
  top_performer: medal("top_performer", {
    rarity: "legendary",
    iconSlug: "crown",
    iconId: "crown",
    glowColor: "#e4b84d",
    shapeId: "medal",
    holo: true,
    tier: "legendary",
  }),
  elite_pulse: medal("elite_pulse", {
    rarity: "legendary",
    iconSlug: "pulse",
    iconId: "sparkle",
    glowColor: "#a855f7",
    shapeId: "crest",
    holo: true,
    tier: "legendary",
  }),
  trusted_partner: medal("trusted_partner", {
    rarity: "epic",
    iconSlug: "shield",
    iconId: "crown",
    glowColor: "#e4b84d",
    shapeId: "shield",
    tier: "gold",
    showInChat: true,
  }),
  vip_seller: medal("vip_seller", {
    rarity: "rare",
    iconSlug: "vip",
    iconId: "diamond",
    glowColor: "#f472b6",
    shapeId: "medal",
    tier: "silver",
  }),
  strategic_agent: medal("strategic_agent", {
    rarity: "rare",
    iconSlug: "chess",
    iconId: "target",
    glowColor: "#534ab7",
    shapeId: "hexagon",
    tier: "silver",
  }),
  night_owl: medal("night_owl", {
    rarity: "epic",
    iconSlug: "moon",
    iconId: "sparkle",
    glowColor: "#6366f1",
    shapeId: "crest",
    holo: true,
    tier: "gold",
  }),
  triple_close_day: medal("triple_close_day", {
    rarity: "legendary",
    iconSlug: "hat-trick",
    iconId: "lightning",
    glowColor: "#f59e0b",
    shapeId: "star16",
    holo: true,
    tier: "legendary",
  }),
  revenue_10k: medal("revenue_10k", {
    rarity: "legendary",
    iconSlug: "banknote",
    iconId: "diamond",
    glowColor: "#22c55e",
    shapeId: "medal",
    holo: true,
    tier: "legendary",
  }),
  content_creator: medal("content_creator", {
    rarity: "legendary",
    iconSlug: "sparkles",
    iconId: "crown",
    glowColor: "#e4b84d",
    shapeId: "medal",
    holo: true,
    tier: "legendary",
    showInChat: true,
  }),
  verified_partner: medal("verified_partner", {
    rarity: "epic",
    iconSlug: "shield",
    iconId: "crown",
    glowColor: "#38bdf8",
    shapeId: "shield",
    tier: "gold",
    showInChat: true,
  }),
};

const DEFAULT_META: BadgeVisualMeta = {
  rarity: "common",
  iconSlug: "star",
  iconId: "star",
  glowColor: "#8a8490",
  shapeId: "circle",
  tier: "bronze",
};

export function getBadgeVisual(badgeKey: string): BadgeVisualMeta {
  return BADGE_VISUAL[badgeKey] ?? DEFAULT_META;
}

export const CHAT_BADGE_KEYS = Object.entries(BADGE_VISUAL)
  .filter(([, m]) => m.showInChat)
  .map(([k]) => k);

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#8a8490",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#e4b84d",
};

export const RARITY_LABEL_KEYS: Record<BadgeRarity, string> = {
  common: "rarityCommon",
  rare: "rarityRare",
  epic: "rarityEpic",
  legendary: "rarityLegendary",
};
