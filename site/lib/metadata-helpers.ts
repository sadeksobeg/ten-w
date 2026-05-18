import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";

export function buildAlternates(locale: Locale, pathname: string): Metadata["alternates"] {
  const base = getSiteUrl().origin;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return {
    canonical: `${base}/${locale}${path}`,
    languages: Object.fromEntries(
      (["ar", "en", "fr"] as Locale[]).map((l) => [l, `${base}/${l}${path}`]),
    ),
  };
}

export function buildBreadcrumbJsonLd(
  locale: string,
  segments: { name: string; path: string }[],
) {
  const base = getSiteUrl().origin;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: `${base}/${locale}${s.path}`,
    })),
  };
}
