import type { MetadataRoute } from "next";
import {
  fallbackCaseStudies,
  fallbackPosts,
  fallbackProjects,
} from "@/lib/fallback-data";
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      const url = `${base}/${locale}${p}`;
      entries.push({
        url,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${p}`]),
          ),
        },
      });
    }
    for (const cs of fallbackCaseStudies) {
      const path = `/case-studies/${cs.slug}`;
      const url = `${base}/${locale}${path}`;
      entries.push({
        url,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      });
    }
    for (const proj of fallbackProjects) {
      const path = `/projects/${proj.slug}`;
      const url = `${base}/${locale}${path}`;
      entries.push({
        url,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      });
    }
    for (const post of fallbackPosts) {
      const path = `/blog/${post.slug}`;
      const url = `${base}/${locale}${path}`;
      entries.push({
        url,
        lastModified: new Date(),
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
        },
      });
    }
  }

  return entries;
}
