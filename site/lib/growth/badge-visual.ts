export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

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

/** Unique silhouette per badge (not only rarity). */
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
  iconId: BadgeIconId;
  glowColor: string;
  shapeId: BadgeShapeId;
};

const BADGE_VISUAL: Record<string, BadgeVisualMeta> = {
  first_deal: { rarity: "rare", iconId: "lightning", glowColor: "#e4b84d", shapeId: "shield" },
  deals_5: { rarity: "epic", iconId: "target", glowColor: "#534ab7", shapeId: "hexagon" },
  deals_10: { rarity: "legendary", iconId: "diamond", glowColor: "#22d3ee", shapeId: "star16" },
  first_referral: { rarity: "rare", iconId: "link", glowColor: "#3b6d11", shapeId: "circle" },
  network_builder: { rarity: "epic", iconId: "globe", glowColor: "#3b82f6", shapeId: "octagon" },
  ai_seller: { rarity: "rare", iconId: "robot", glowColor: "#534ab7", shapeId: "pentagon" },
  fast_closer: { rarity: "epic", iconId: "bolt_clock", glowColor: "#e4b84d", shapeId: "diamond_frame" },
  top_performer: { rarity: "legendary", iconId: "crown", glowColor: "#e4b84d", shapeId: "medal" },
  elite_pulse: { rarity: "legendary", iconId: "sparkle", glowColor: "#a855f7", shapeId: "crest" },
  trusted_partner: { rarity: "epic", iconId: "crown", glowColor: "#e4b84d", shapeId: "shield" },
  vip_seller: { rarity: "rare", iconId: "diamond", glowColor: "#e4b84d", shapeId: "medal" },
  strategic_agent: { rarity: "rare", iconId: "target", glowColor: "#534ab7", shapeId: "hexagon" },
};

const DEFAULT_META: BadgeVisualMeta = {
  rarity: "common",
  iconId: "star",
  glowColor: "#8a8490",
  shapeId: "circle",
};

export function getBadgeVisual(badgeKey: string): BadgeVisualMeta {
  return BADGE_VISUAL[badgeKey] ?? DEFAULT_META;
}

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "#8a8490",
  rare: "#3b82f6",
  epic: "#534ab7",
  legendary: "#e4b84d",
};

export const RARITY_LABEL_KEYS: Record<BadgeRarity, string> = {
  common: "rarityCommon",
  rare: "rarityRare",
  epic: "rarityEpic",
  legendary: "rarityLegendary",
};
