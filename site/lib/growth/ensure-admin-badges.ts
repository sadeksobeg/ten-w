import { BadgeCategory, BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BADGE_DEFS, getBadgeDef } from "@/lib/growth/badge-visual";

const ADMIN_BADGE_META: Record<
  string,
  { category: BadgeCategory; description: string }
> = {
  content_creator: {
    category: BadgeCategory.SOCIAL,
    description: "Featured content creator — program & private group.",
  },
  verified_partner: {
    category: BadgeCategory.META,
    description: "Official verified partner badge.",
  },
  trusted_partner: {
    category: BadgeCategory.META,
    description: "Awarded by admin.",
  },
  vip_seller: {
    category: BadgeCategory.FINANCIAL,
    description: "Awarded by admin.",
  },
  strategic_agent: {
    category: BadgeCategory.BEHAVIORAL,
    description: "Awarded by admin.",
  },
  beta_tester: {
    category: BadgeCategory.META,
    description: "Early beta program member.",
  },
  founding_partner: {
    category: BadgeCategory.META,
    description: "Early founding partner.",
  },
  mvp_quarter: {
    category: BadgeCategory.META,
    description: "Quarter MVP partner.",
  },
};

/** Idempotent: ensure admin-grant badges exist in DB (safe on production). */
export async function ensureAdminBadgeDefinitions() {
  const adminKeys = Object.entries(BADGE_DEFS)
    .filter(([, def]) => def.adminOnly)
    .map(([key]) => key);

  for (const key of adminKeys) {
    const def = getBadgeDef(key);
    const meta = ADMIN_BADGE_META[key];
    const name = def.labelEn || key;
    const description = meta?.description ?? def.descEn;

    await prisma.badgeDefinition.upsert({
      where: { key },
      create: {
        key,
        name,
        type: BadgeType.ADMIN,
        category: meta?.category ?? BadgeCategory.META,
        description,
        hidden: false,
      },
      update: {
        name,
        description,
        type: BadgeType.ADMIN,
      },
    });
  }
}
