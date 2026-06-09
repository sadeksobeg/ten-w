export const CREATOR_PLATFORM_REVIEW_XP = 30;
export const CREATOR_PLATFORM_REVIEW_XP_REASON = "creator_hub_platform_review_v1";

const SPECIALTY_ROLE: Record<string, { ar: string; en: string; fr: string }> = {
  tech: {
    ar: "صانع تقني · Creator Hub",
    en: "Tech creator · Creator Hub",
    fr: "Créateur tech · Creator Hub",
  },
  business: {
    ar: "صانع أعمال · Creator Hub",
    en: "Business creator · Creator Hub",
    fr: "Créateur business · Creator Hub",
  },
  education: {
    ar: "صانع تعليمي · Creator Hub",
    en: "Education creator · Creator Hub",
    fr: "Créateur éducation · Creator Hub",
  },
  entertainment: {
    ar: "صانع ترفيه · Creator Hub",
    en: "Entertainment creator · Creator Hub",
    fr: "Créateur divertissement · Creator Hub",
  },
  lifestyle: {
    ar: "صانع أسلوب حياة · Creator Hub",
    en: "Lifestyle creator · Creator Hub",
    fr: "Créateur lifestyle · Creator Hub",
  },
};

export function creatorReviewRole(specialty: string[]): {
  roleAr: string;
  roleEn: string;
  roleFr: string;
} {
  const key = specialty.find((s) => SPECIALTY_ROLE[s]) ?? "tech";
  const roles = SPECIALTY_ROLE[key] ?? SPECIALTY_ROLE.tech!;
  return { roleAr: roles.ar, roleEn: roles.en, roleFr: roles.fr };
}
