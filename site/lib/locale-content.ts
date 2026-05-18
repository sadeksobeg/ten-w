import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/fallback-data";

/**
 * Resolves which localized field to read from fallback / MDX content.
 */
export type ContentLocale = "ar" | "en" | "fr";

export function contentLocale(locale: string): ContentLocale {
  if (locale === "ar") return "ar";
  if (locale === "fr") return "fr";
  return "en";
}

export function pickLocalized(
  entry: Localized | Record<string, string> | undefined,
  locale: string,
): string {
  if (!entry) return "";
  const cl = contentLocale(locale);
  const rec = entry as Record<string, string>;
  return rec[cl] ?? rec.en ?? rec.ar ?? "";
}

export function isUiLocale(locale: string): locale is Locale {
  return locale === "ar" || locale === "en" || locale === "fr";
}
