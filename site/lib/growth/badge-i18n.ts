import { getBadgeDisplay } from "@/lib/growth/badge-display";

export type BadgeCopy = {
  name: string;
  description: string;
  howTo: string;
};

export function resolveBadgeCopy(
  key: string,
  locale: string,
  fallback?: { name: string; description?: string | null },
  opts?: { earned?: boolean; hidden?: boolean },
): BadgeCopy {
  const display = getBadgeDisplay(key, locale, {
    earned: opts?.earned ?? true,
    hidden: opts?.hidden,
    dbFallback: fallback,
  });

  if (display.secret) {
    return {
      name: fallback?.name ?? key,
      description: fallback?.description ?? "",
      howTo: fallback?.description ?? "",
    };
  }

  return {
    name: display.name,
    description: display.description,
    howTo: display.howTo,
  };
}
