import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en", "fr"],
  defaultLocale: "ar",
  localePrefix: "always",
  /** Stable URLs for crawlers; do not rewrite `/` to a locale without redirect. */
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
