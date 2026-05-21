export type LevelVisual = {
  ringColor: string;
  gradientFrom: string;
  gradientTo: string;
  pillClass: string;
  isLegend?: boolean;
};

const BY_NAME: Record<string, LevelVisual> = {
  Starter: {
    ringColor: "#6b7280",
    gradientFrom: "#374151",
    gradientTo: "#1f2937",
    pillClass: "border-gray-500/40 bg-gray-500/15 text-gray-200",
  },
  Hunter: {
    ringColor: "#b07d2b",
    gradientFrom: "#b07d2b",
    gradientTo: "#8a6322",
    pillClass: "border-[#B07D2B]/50 bg-[#B07D2B]/20 text-[#E4B84D]",
  },
  Closer: {
    ringColor: "#3b82f6",
    gradientFrom: "#2563eb",
    gradientTo: "#1d4ed8",
    pillClass: "border-blue-500/40 bg-blue-500/15 text-blue-200",
  },
  Pro: {
    ringColor: "#3b6d11",
    gradientFrom: "#3b6d11",
    gradientTo: "#2d5010",
    pillClass: "border-green-600/40 bg-green-600/15 text-green-200",
  },
  Elite: {
    ringColor: "#ea580c",
    gradientFrom: "#ea580c",
    gradientTo: "#c2410c",
    pillClass: "border-orange-500/40 bg-orange-500/15 text-orange-200",
  },
  Titan: {
    ringColor: "#534ab7",
    gradientFrom: "#534ab7",
    gradientTo: "#4338ca",
    pillClass: "border-purple-500/40 bg-purple-500/15 text-purple-200",
  },
  Legend: {
    ringColor: "#e4b84d",
    gradientFrom: "#e4b84d",
    gradientTo: "#a855f7",
    pillClass: "border-gold/50 bg-gradient-to-r from-gold/20 via-purple-500/20 to-gold/20 text-gold",
    isLegend: true,
  },
};

const DEFAULT_LEVEL: LevelVisual = BY_NAME.Starter!;

export function getLevelVisual(levelName: string): LevelVisual {
  return BY_NAME[levelName] ?? DEFAULT_LEVEL;
}

export function getLevelVisualByOrder(order: number): LevelVisual {
  const names = ["Starter", "Hunter", "Closer", "Pro", "Elite", "Titan", "Legend"];
  return getLevelVisual(names[order - 1] ?? "Starter");
}
