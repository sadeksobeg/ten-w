import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "./site";

export function buildAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const base = getSiteUrl().origin;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const suffix = normalized === "/" ? "" : normalized;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${base}/${l}${suffix}`;
  }
  return {
    canonical: `${base}/${locale}${suffix}`,
    languages,
  };
}
