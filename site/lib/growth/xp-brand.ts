export const XP_BRAND = {
  ar: "نقاط القوة",
  en: "Power Points",
  fr: "Points de Puissance",
  symbol: "⚡",
  color: "#B07D2B",
} as const;

export function getXpBrandLabel(locale: string): string {
  if (locale === "ar") return XP_BRAND.ar;
  if (locale === "fr") return XP_BRAND.fr;
  return XP_BRAND.en;
}
