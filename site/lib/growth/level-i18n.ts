const LEVEL_AR: Record<string, string> = {
  Starter: "مبتدئ",
  Hunter: "صياد",
  Closer: "مُغلق",
  Pro: "محترف",
  Elite: "نخبة",
  Titan: "عملاق",
  Legend: "أسطورة",
};

const LEVEL_FR: Record<string, string> = {
  Starter: "Débutant",
  Hunter: "Chasseur",
  Closer: "Closer",
  Pro: "Pro",
  Elite: "Élite",
  Titan: "Titan",
  Legend: "Légende",
};

const VALID_CODES = new Set([
  "starter",
  "hunter",
  "closer",
  "pro",
  "elite",
  "titan",
  "legend",
  "seeker",
  "scout",
  "warrior",
  "champion",
]);

const NAME_TO_CODE: Record<string, string> = {
  Starter: "starter",
  Hunter: "hunter",
  Closer: "closer",
  Pro: "pro",
  Elite: "elite",
  Titan: "titan",
  Legend: "legend",
};

export const LEVEL_COLORS: Record<string, string> = {
  starter: "#C9A061",
  hunter: "#B07D2B",
  closer: "#3B82F6",
  pro: "#10B981",
  elite: "#F97316",
  titan: "#8B5CF6",
  legend: "#E4B84D",
  seeker: "#3B82F6",
  scout: "#10B981",
  warrior: "#F97316",
  champion: "#8B5CF6",
};

export function getLevelI18nKey(
  levelCode: string | null | undefined,
  levelName: string | null | undefined,
): string {
  const code = levelCode?.toLowerCase().trim() ?? "";
  if (code && VALID_CODES.has(code)) return code;
  const fromName = levelName?.toLowerCase().replace(/\s+/g, "_").trim() ?? "";
  if (fromName && VALID_CODES.has(fromName)) return fromName;
  const mapped = NAME_TO_CODE[levelName?.trim() ?? ""];
  if (mapped) return mapped;
  return "starter";
}

export function resolveLevelName(levelName: string, locale: string): string {
  if (locale === "ar") return LEVEL_AR[levelName] ?? levelName;
  if (locale === "fr") return LEVEL_FR[levelName] ?? levelName;
  return levelName;
}
