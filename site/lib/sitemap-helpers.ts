import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export function seoMetaForPath(path: string): {
  priority: number;
  changeFrequency: ChangeFreq;
} {
  if (path === "") {
    return { priority: 1.0, changeFrequency: "weekly" };
  }
  if (path === "/solutions" || path.startsWith("/solutions/")) {
    return { priority: 0.9, changeFrequency: "weekly" };
  }
  if (path.startsWith("/blog") || path.startsWith("/case-studies")) {
    return { priority: 0.8, changeFrequency: "monthly" };
  }
  if (path === "/legal" || path === "/privacy" || path === "/terms") {
    return { priority: 0.3, changeFrequency: "yearly" };
  }
  return { priority: 0.5, changeFrequency: "monthly" };
}

/** One sitemap row per path with hreflang cluster (canonical row = default locale). */
export function pushHreflangCluster(
  entries: MetadataRoute.Sitemap,
  base: string,
  path: string,
) {
  const { priority, changeFrequency } = seoMetaForPath(path);
  const languages: Record<string, string> = {
    "x-default": `${base}/ar${path}`,
  };
  for (const locale of routing.locales) {
    languages[locale] = `${base}/${locale}${path}`;
  }
  entries.push({
    url: `${base}/ar${path}`,
    lastModified: new Date(),
    priority,
    changeFrequency,
    alternates: { languages },
  });
}
