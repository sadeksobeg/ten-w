import {
  getBadgeDef,
  getBadgeDesc,
  getBadgeHowTo,
  getBadgeLabel,
} from "@/lib/growth/badge-visual";

export type BadgeDisplay = {
  key: string;
  name: string;
  description: string;
  howTo: string;
  secret: boolean;
};

export function getBadgeDisplay(
  key: string,
  locale: string,
  opts: {
    earned: boolean;
    hidden?: boolean;
    dbFallback?: { name?: string; description?: string | null };
  },
): BadgeDisplay {
  const def = getBadgeDef(key);
  const hidden = opts.hidden ?? def.hidden ?? false;
  const secret = hidden && !opts.earned;

  if (secret) {
    return {
      key,
      name: "",
      description: "",
      howTo: "",
      secret: true,
    };
  }

  const name =
    getBadgeLabel(key, locale) ||
    opts.dbFallback?.name ||
    key;
  const description =
    getBadgeDesc(key, locale) ||
    opts.dbFallback?.description ||
    "";
  const howTo = getBadgeHowTo(key, locale) || description;

  return {
    key,
    name,
    description,
    howTo,
    secret: false,
  };
}
