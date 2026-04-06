import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en", "fr"],
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
