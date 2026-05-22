import { getLevelI18nKey } from "@/lib/growth/level-i18n";

export type LevelVisual = {
  ringColor: string;
  gradientFrom: string;
  gradientTo: string;
  pillClass: string;
  isLegend?: boolean;
  /** game-icons registry slug for rank emblem */
  iconSlug: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legend";
};

const BY_CODE: Record<string, LevelVisual> = {
  starter: {
    ringColor: "#C9A061",
    gradientFrom: "#B07D2B",
    gradientTo: "#6B5344",
    pillClass: "border-gold/40 bg-gold/10 text-[#E4B84D]",
    iconSlug: "medal",
    tier: "bronze",
  },
  hunter: {
    ringColor: "#E4B84D",
    gradientFrom: "#B07D2B",
    gradientTo: "#8a6322",
    pillClass: "border-[#B07D2B]/50 bg-[#B07D2B]/20 text-[#E4B84D]",
    iconSlug: "crosshair",
    tier: "bronze",
  },
  closer: {
    ringColor: "#60A5FA",
    gradientFrom: "#2563eb",
    gradientTo: "#B07D2B",
    pillClass: "border-blue-500/40 bg-blue-500/15 text-blue-200",
    iconSlug: "rank_silver",
    tier: "silver",
  },
  pro: {
    ringColor: "#34D399",
    gradientFrom: "#10B981",
    gradientTo: "#B07D2B",
    pillClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    iconSlug: "shield",
    tier: "gold",
  },
  elite: {
    ringColor: "#F97316",
    gradientFrom: "#ea580c",
    gradientTo: "#E4B84D",
    pillClass: "border-orange-500/40 bg-orange-500/15 text-orange-200",
    iconSlug: "flame",
    tier: "platinum",
  },
  titan: {
    ringColor: "#A78BFA",
    gradientFrom: "#534ab7",
    gradientTo: "#E4B84D",
    pillClass: "border-purple-500/40 bg-purple-500/15 text-purple-200",
    iconSlug: "castle",
    tier: "diamond",
  },
  legend: {
    ringColor: "#e4b84d",
    gradientFrom: "#e4b84d",
    gradientTo: "#a855f7",
    pillClass: "border-gold/50 bg-gradient-to-r from-gold/20 via-purple-500/20 to-gold/20 text-gold",
    isLegend: true,
    iconSlug: "rank_legend",
    tier: "legend",
  },
};

const LEGACY_NAME_TO_CODE: Record<string, string> = {
  Starter: "starter",
  Hunter: "hunter",
  Closer: "closer",
  Pro: "pro",
  Elite: "elite",
  Titan: "titan",
  Legend: "legend",
};

const DEFAULT_LEVEL: LevelVisual = BY_CODE.starter!;

export function getLevelVisual(levelNameOrCode: string, levelCode?: string | null): LevelVisual {
  const key = levelCode
    ? getLevelI18nKey(levelCode, levelNameOrCode)
    : LEGACY_NAME_TO_CODE[levelNameOrCode] ?? getLevelI18nKey(null, levelNameOrCode);
  return BY_CODE[key] ?? DEFAULT_LEVEL;
}

export function getLevelVisualByOrder(order: number): LevelVisual {
  const codes = ["starter", "hunter", "closer", "pro", "elite", "titan", "legend"];
  return BY_CODE[codes[order - 1] ?? "starter"] ?? DEFAULT_LEVEL;
}
