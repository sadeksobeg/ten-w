export type AvatarPreset = {
  id: string;
  labelKey: string;
  gradient: string;
  accent: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "gold-1", labelKey: "presetGold1", gradient: "linear-gradient(135deg,#B07D2B,#E4B84D)", accent: "#E4B84D" },
  { id: "gold-2", labelKey: "presetGold2", gradient: "linear-gradient(135deg,#8B6914,#D4AF37)", accent: "#D4AF37" },
  { id: "violet-1", labelKey: "presetViolet1", gradient: "linear-gradient(135deg,#534AB7,#8B5CF6)", accent: "#A78BFA" },
  { id: "violet-2", labelKey: "presetViolet2", gradient: "linear-gradient(135deg,#312E81,#6366F1)", accent: "#818CF8" },
  { id: "emerald-1", labelKey: "presetEmerald1", gradient: "linear-gradient(135deg,#065F46,#10B981)", accent: "#34D399" },
  { id: "emerald-2", labelKey: "presetEmerald2", gradient: "linear-gradient(135deg,#14532D,#22C55E)", accent: "#4ADE80" },
  { id: "crimson-1", labelKey: "presetCrimson1", gradient: "linear-gradient(135deg,#7F1D1D,#EF4444)", accent: "#F87171" },
  { id: "crimson-2", labelKey: "presetCrimson2", gradient: "linear-gradient(135deg,#881337,#F43F5E)", accent: "#FB7185" },
  { id: "cyan-1", labelKey: "presetCyan1", gradient: "linear-gradient(135deg,#0E7490,#22D3EE)", accent: "#67E8F9" },
  { id: "cyan-2", labelKey: "presetCyan2", gradient: "linear-gradient(135deg,#164E63,#06B6D4)", accent: "#22D3EE" },
  { id: "slate-1", labelKey: "presetSlate1", gradient: "linear-gradient(135deg,#1E293B,#475569)", accent: "#94A3B8" },
  { id: "slate-2", labelKey: "presetSlate2", gradient: "linear-gradient(135deg,#0F172A,#334155)", accent: "#CBD5E1" },
];

export function getAvatarPreset(id: string | null | undefined): AvatarPreset | null {
  if (!id) return null;
  return AVATAR_PRESETS.find((p) => p.id === id) ?? null;
}
