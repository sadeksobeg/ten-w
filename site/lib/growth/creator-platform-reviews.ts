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

export async function listActivePlatformReviews(): Promise<CreatorPlatformReviewRow[]> {
  const rows = await prisma.creatorPlatformReview.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 12,
  });
  return rows.map(mapRow);
}

export async function listAllPlatformReviewsAdmin(): Promise<CreatorPlatformReviewRow[]> {
  const rows = await prisma.creatorPlatformReview.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapRow);
}
