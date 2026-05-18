import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/growth/admin/",
          "/growth/admin/",
          "/*/growth/sign-in",
        ],
      },
    ],
    sitemap: `${site.origin}/sitemap.xml`,
    host: site.host,
  };
}
