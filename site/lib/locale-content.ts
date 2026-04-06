import type { Locale } from "@/i18n/routing";

/**
 * Strapi / fallback project and blog bodies are localized as `ar` | `en` only.
 * French UI (fr) uses English fallback strings for that content.
 */
export function contentLocale(locale: string): "ar" | "en" {
  if (locale === "ar") return "ar";
  return "en";
}

export function isUiLocale(locale: string): locale is Locale {
  return locale === "ar" || locale === "en" || locale === "fr";
}
