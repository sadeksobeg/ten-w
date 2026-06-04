export function pickEngagementText(
  locale: string,
  texts: { ar: string; en: string; fr?: string },
): string {
  if (locale === "ar") return texts.ar;
  if (locale === "fr") return texts.fr ?? texts.en;
  return texts.en;
}
