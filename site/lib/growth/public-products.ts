import { prisma } from "@/lib/prisma";
import {
  type ProductFeatureOption,
  type ProductFeaturesConfig,
  productFeaturesForSlug,
} from "@/lib/growth/product-features";

export type PublicProductDto = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  description: string;
  features: ProductFeatureOption[];
  sortOrder: number;
};

function parseFeaturesJson(raw: unknown, slug: string): ProductFeaturesConfig {
  if (raw && typeof raw === "object" && "features" in raw) {
    const cfg = raw as ProductFeaturesConfig;
    if (Array.isArray(cfg.features)) return cfg;
  }
  return productFeaturesForSlug(slug);
}

export async function getPublicProducts(locale: string): Promise<PublicProductDto[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, publicVisible: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      featuresJson: true,
      descriptionAr: true,
      descriptionEn: true,
      descriptionFr: true,
      sortOrder: true,
    },
  });

  return rows.map((p) => {
    const features = parseFeaturesJson(p.featuresJson, p.slug).features;
    const description =
      locale === "en"
        ? p.descriptionEn ?? p.descriptionAr ?? ""
        : locale === "fr"
          ? p.descriptionFr ?? p.descriptionAr ?? ""
          : p.descriptionAr ?? p.descriptionEn ?? "";

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      description,
      features,
      sortOrder: p.sortOrder,
    };
  });
}
