import { revalidatePath } from "next/cache";

const LOCALES = ["ar", "en", "fr"] as const;

export type GrowthLocale = (typeof LOCALES)[number];

export function revalidatePartnerSurfaces(opts?: {
  locales?: readonly GrowthLocale[];
  publicSlug?: string | null;
}) {
  const locales = opts?.locales ?? LOCALES;
  for (const locale of locales) {
    revalidatePath(`/${locale}/growth`, "layout");
    if (opts?.publicSlug) {
      revalidatePath(`/${locale}/growth/profile/${opts.publicSlug}`);
    }
  }
  revalidatePath("/", "layout");
}
