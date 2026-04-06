"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const locales = routing.locales;

export function LocaleSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-md border border-white/10 bg-surface p-1">
      <span className="sr-only">{t("language")}</span>
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`min-h-9 min-w-9 rounded px-2 text-sm font-medium transition-colors ${
            locale === loc
              ? "bg-gold text-bg"
              : "text-muted hover:text-foreground"
          }`}
          aria-pressed={locale === loc}
          aria-label={
            loc === "ar" ? "العربية" : loc === "fr" ? "Français" : "English"
          }
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
