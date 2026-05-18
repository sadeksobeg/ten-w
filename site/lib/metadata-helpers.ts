import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";

export function buildAlternates(locale: Locale, pathname: string): Metadata["alternates"] {
  const base = getSiteUrl().origin;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const suffix = path === "/" ? "" : path;
  const canonical = `${base}/${locale}${suffix}`;
  return {
    canonical,
    languages: {
      "x-default": `${base}/ar${suffix}`,
      ...Object.fromEntries(
        (["ar", "en", "fr"] as Locale[]).map((l) => [l, `${base}/${l}${suffix}`]),
      ),
    },
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
