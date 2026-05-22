export type AvatarPreset = {
  id: string;
  labelKey: string;
  gradient: string;
  accent: string;
  /** RPG portrait icon from game-icons registry */
  portraitSlug: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legend";
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "gold-1",
    labelKey: "presetGold1",
    gradient: "linear-gradient(135deg,#B07D2B,#E4B84D)",
    accent: "#E4B84D",
    portraitSlug: "warrior-helm",
    tier: "gold",
  },
  {
    id: "gold-2",
    labelKey: "presetGold2",
    gradient: "linear-gradient(135deg,#8B6914,#D4AF37)",
    accent: "#D4AF37",
    portraitSlug: "crown",
    tier: "legend",
  },
  {
    id: "violet-1",
    labelKey: "presetViolet1",
    gradient: "linear-gradient(135deg,#534AB7,#8B5CF6)",
    accent: "#A78BFA",
    portraitSlug: "wizard-hat",
    tier: "diamond",
  },
  {
    id: "violet-2",
    labelKey: "presetViolet2",
    gradient: "linear-gradient(135deg,#312E81,#6366F1)",
    accent: "#818CF8",
    portraitSlug: "sparkles",
    tier: "platinum",
  },
  {
    id: "emerald-1",
    labelKey: "presetEmerald1",
    gradient: "linear-gradient(135deg,#065F46,#10B981)",
    accent: "#34D399",
    portraitSlug: "bullseye",
    tier: "silver",
  },
  {
    id: "emerald-2",
    labelKey: "presetEmerald2",
    gradient: "linear-gradient(135deg,#14532D,#22C55E)",
    accent: "#4ADE80",
    portraitSlug: "shield",
    tier: "gold",
  },
  {
    id: "crimson-1",
    labelKey: "presetCrimson1",
    gradient: "linear-gradient(135deg,#7F1D1D,#EF4444)",
    accent: "#F87171",
    portraitSlug: "flame",
    tier: "platinum",
  },
  {
    id: "crimson-2",
    labelKey: "presetCrimson2",
    gradient: "linear-gradient(135deg,#881337,#F43F5E)",
    accent: "#FB7185",
    portraitSlug: "trophy",
    tier: "gold",
  },
  {
    id: "cyan-1",
    labelKey: "presetCyan1",
    gradient: "linear-gradient(135deg,#0E7490,#22D3EE)",
    accent: "#67E8F9",
    portraitSlug: "wave",
    tier: "silver",
  },
  {
    id: "cyan-2",
    labelKey: "presetCyan2",
    gradient: "linear-gradient(135deg,#164E63,#06B6D4)",
    accent: "#22D3EE",
    portraitSlug: "lightning-bolt",
    tier: "diamond",
  },
  {
    id: "slate-1",
    labelKey: "presetSlate1",
    gradient: "linear-gradient(135deg,#1E293B,#475569)",
    accent: "#94A3B8",
    portraitSlug: "eagle",
    tier: "bronze",
  },
  {
    id: "slate-2",
    labelKey: "presetSlate2",
    gradient: "linear-gradient(135deg,#0F172A,#334155)",
    accent: "#CBD5E1",
    portraitSlug: "chess",
    tier: "silver",
  },
  {
    id: "legend-1",
    labelKey: "presetLegend1",
    gradient: "linear-gradient(135deg,#a855f7,#e4b84d)",
    accent: "#e4b84d",
    portraitSlug: "rank_legend",
    tier: "legend",
  },
  {
    id: "legend-2",
    labelKey: "presetLegend2",
    gradient: "linear-gradient(135deg,#4c1d95,#f59e0b)",
    accent: "#fcd34d",
    portraitSlug: "cut-diamond",
    tier: "legend",
  },
  {
    id: "agent-1",
    labelKey: "presetAgent1",
    gradient: "linear-gradient(135deg,#1e3a5f,#3b82f6)",
    accent: "#60a5fa",
    portraitSlug: "robot",
    tier: "platinum",
  },
  {
    id: "agent-2",
    labelKey: "presetAgent2",
    gradient: "linear-gradient(135deg,#134e4a,#14b8a6)",
    accent: "#2dd4bf",
    portraitSlug: "network",
    tier: "gold",
  },
];

const TIER_RING: Record<AvatarPreset["tier"], string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#e4b84d",
  platinum: "#a78bfa",
  diamond: "#22d3ee",
  legend: "#f59e0b",
};

export function getAvatarPreset(id: string | null | undefined): AvatarPreset | null {
  if (!id) return null;
  return AVATAR_PRESETS.find((p) => p.id === id) ?? null;
}

export function getAvatarTierRing(tier: AvatarPreset["tier"]): string {
  return TIER_RING[tier];
}
