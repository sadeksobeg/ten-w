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

export function resolveLevelName(levelName: string, locale: string): string {
  if (locale === "ar") return LEVEL_AR[levelName] ?? levelName;
  if (locale === "fr") return LEVEL_FR[levelName] ?? levelName;
  return levelName;
}
