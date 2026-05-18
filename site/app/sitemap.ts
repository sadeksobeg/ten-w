import type { MetadataRoute } from "next";
import { deepCaseStudies } from "@/lib/case-studies-data";
import { fallbackProjects } from "@/lib/fallback-data";
import { getMdxPostSlugs } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";
import { pushHreflangCluster } from "@/lib/sitemap-helpers";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;
  const entries: MetadataRoute.Sitemap = [];

  for (const p of staticPaths) {
    pushHreflangCluster(entries, base, p);
  }
  for (const cs of deepCaseStudies) {
    pushHreflangCluster(entries, base, `/case-studies/${cs.slug}`);
  }
  for (const proj of fallbackProjects) {
    pushHreflangCluster(entries, base, `/projects/${proj.slug}`);
  }
  for (const slug of getMdxPostSlugs()) {
    pushHreflangCluster(entries, base, `/blog/${slug}`);
  }

  return entries;
}
