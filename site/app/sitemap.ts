import type { MetadataRoute } from "next";
import { deepCaseStudies } from "@/lib/case-studies-data";
import { fallbackProjects } from "@/lib/fallback-data";
import { getMdxPostSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";

const staticPaths = [
  "",
  "/about",
  "/solutions",
  "/solutions/ai",
  "/solutions/cyber",
  "/solutions/software",
  "/solutions/infra",
  "/solutions/intelligent-systems",
  "/demo/explore",
  "/engagement",
  "/partners",
  "/careers",
  "/case-studies",
  "/why-us",
  "/contact",
  "/projects",
  "/pilots",
  "/pilots/showcase",
  "/tech-stack",
  "/team",
  "/investors",
  "/blog",
  "/legal",
  "/privacy",
  "/terms",
  "/status",
  "/tech-radar",
  "/growth",
];

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function seoMetaForPath(path: string): {
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

function pushEntry(
  entries: MetadataRoute.Sitemap,
  base: string,
  locale: string,
  path: string,
) {
  const { priority, changeFrequency } = seoMetaForPath(path);
  entries.push({
    url: `${base}/${locale}${path}`,
    lastModified: new Date(),
    priority,
    changeFrequency,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${base}/${l}${path}`]),
      ),
    },
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      pushEntry(entries, base, locale, p);
    }
    for (const cs of deepCaseStudies) {
      pushEntry(entries, base, locale, `/case-studies/${cs.slug}`);
    }
    for (const proj of fallbackProjects) {
      pushEntry(entries, base, locale, `/projects/${proj.slug}`);
    }
    for (const slug of getMdxPostSlugs()) {
      pushEntry(entries, base, locale, `/blog/${slug}`);
    }
  }

  return entries;
}
