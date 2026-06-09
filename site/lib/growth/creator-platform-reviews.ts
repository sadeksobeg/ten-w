import { prisma } from "@/lib/prisma";

export type CreatorPlatformReviewRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  roleAr: string | null;
  roleEn: string | null;
  roleFr: string | null;
  quoteAr: string;
  quoteEn: string;
  quoteFr: string;
  rating: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

function mapRow(r: {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  roleAr: string | null;
  roleEn: string | null;
  roleFr: string | null;
  quoteAr: string;
  quoteEn: string;
  quoteFr: string;
  rating: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
}): CreatorPlatformReviewRow {
  return {
    id: r.id,
    nameAr: r.nameAr,
    nameEn: r.nameEn,
    nameFr: r.nameFr,
    roleAr: r.roleAr,
    roleEn: r.roleEn,
    roleFr: r.roleFr,
    quoteAr: r.quoteAr,
    quoteEn: r.quoteEn,
    quoteFr: r.quoteFr,
    rating: r.rating,
    active: r.active,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
  };
}

export function localizePlatformReview(
  row: CreatorPlatformReviewRow,
  locale: string,
): { name: string; role: string | null; quote: string } {
  if (locale === "ar") {
    return { name: row.nameAr, role: row.roleAr, quote: row.quoteAr };
  }
  if (locale === "fr") {
    return {
      name: row.nameFr || row.nameEn || row.nameAr,
      role: row.roleFr ?? row.roleEn ?? row.roleAr,
      quote: row.quoteFr || row.quoteEn || row.quoteAr,
    };
  }
  return {
    name: row.nameEn || row.nameAr,
    role: row.roleEn ?? row.roleAr,
    quote: row.quoteEn || row.quoteAr,
  };
}

/** Anonymous platform quotes — no personal names; shown when admin has not added reviews yet. */
const ANONYMOUS_PLATFORM_REVIEWS: CreatorPlatformReviewRow[] = [
  {
    id: "fallback_review_1",
    nameAr: "صانع محتوى معتمد",
    nameEn: "Verified creator",
    nameFr: "Créateur vérifié",
    roleAr: "Creator Hub · تقنية",
    roleEn: "Creator Hub · Tech",
    roleFr: "Creator Hub · Tech",
    quoteAr:
      "Creator Hub غيّر طريقة عملي — أدوات حقيقية، مجتمع حي، وعمولات واضحة. منصة B2B احترافية من أول يوم.",
    quoteEn:
      "Creator Hub changed how I work — real tools, a live community, and clear commissions. A professional B2B platform from day one.",
    quoteFr:
      "Creator Hub a changé ma façon de travailler — outils réels, communauté active, commissions claires.",
    rating: 5,
    active: true,
    sortOrder: 0,
    createdAt: "2026-06-09T00:00:00.000Z",
  },
  {
    id: "fallback_review_2",
    nameAr: "عضو الشبكة",
    nameEn: "Network member",
    nameFr: "Membre du réseau",
    roleAr: "صانع أعمال · Creator Hub",
    roleEn: "Business creator · Creator Hub",
    roleFr: "Créateur business · Creator Hub",
    quoteAr:
      "التحديات الأسبوعية وكأس الصنّاع يحفّزانني كل أسبوع. تجربة احترافية وتشعرك أنك جزء من شبكة عالمية.",
    quoteEn:
      "Weekly challenges and Creator Cup motivate me every week. Professional and truly global.",
    quoteFr:
      "Les défis hebdo et le Creator Cup me motivent chaque semaine. Professionnel et vraiment global.",
    rating: 5,
    active: true,
    sortOrder: 1,
    createdAt: "2026-06-09T00:00:00.000Z",
  },
  {
    id: "fallback_review_3",
    nameAr: "صانع في الشبكة",
    nameEn: "Creator in the network",
    nameFr: "Créateur du réseau",
    roleAr: "صانع تعليمي · Creator Hub",
    roleEn: "Education creator · Creator Hub",
    roleFr: "Créateur éducation · Creator Hub",
    quoteAr:
      "حقيبة التسويق والروابط المتتبعة وفّرت عليّ ساعات. ASCEND وCreator Hub معاً = نظام كامل للنمو.",
    quoteEn:
      "The marketing kit and tracked links saved me hours. ASCEND + Creator Hub = a complete growth system.",
    quoteFr:
      "Le kit marketing et les liens trackés m'ont fait gagner des heures. ASCEND + Creator Hub = système complet.",
    rating: 5,
    active: true,
    sortOrder: 2,
    createdAt: "2026-06-09T00:00:00.000Z",
  },
];

export function isAnonymousPlatformReview(id: string): boolean {
  return id.startsWith("fallback_review_");
}

export async function listActivePlatformReviews(): Promise<CreatorPlatformReviewRow[]> {
  const rows = await prisma.creatorPlatformReview.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 12,
  });
  return rows.map(mapRow);
}

/** DB reviews first; anonymous quotes when the table is empty (no personal names). */
export async function listPlatformReviewsForPublic(): Promise<CreatorPlatformReviewRow[]> {
  try {
    const rows = await listActivePlatformReviews();
    if (rows.length > 0) return rows;
  } catch {
    /* migration pending / offline build */
  }
  return ANONYMOUS_PLATFORM_REVIEWS;
}

export async function listAllPlatformReviewsAdmin(): Promise<CreatorPlatformReviewRow[]> {
  const rows = await prisma.creatorPlatformReview.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapRow);
}
