export type ProductFeatureOption = {
  id: string;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  priceDeltaCents: number;
};

export type ProductFeaturesConfig = {
  features: ProductFeatureOption[];
};

export const PUBLIC_PRODUCT_SLUGS = ["website", "automation-ai", "mobile-app"] as const;

export function productFeaturesForSlug(slug: string): ProductFeaturesConfig {
  switch (slug) {
    case "website":
      return {
        features: [
          {
            id: "extra-lang",
            labelAr: "لغات إضافية",
            labelEn: "Extra languages",
            labelFr: "Langues supplémentaires",
            priceDeltaCents: 80_000,
          },
          {
            id: "ecommerce",
            labelAr: "متجر إلكتروني",
            labelEn: "E-commerce store",
            labelFr: "Boutique en ligne",
            priceDeltaCents: 120_000,
          },
          {
            id: "advanced-seo",
            labelAr: "SEO متقدم",
            labelEn: "Advanced SEO",
            labelFr: "SEO avancé",
            priceDeltaCents: 50_000,
          },
        ],
      };
    case "automation-ai":
      return {
        features: [
          {
            id: "whatsapp-bot",
            labelAr: "بوت واتساب ذكي",
            labelEn: "WhatsApp AI bot",
            labelFr: "Bot WhatsApp IA",
            priceDeltaCents: 90_000,
          },
          {
            id: "crm-sync",
            labelAr: "ربط CRM",
            labelEn: "CRM integration",
            labelFr: "Intégration CRM",
            priceDeltaCents: 70_000,
          },
          {
            id: "analytics-dash",
            labelAr: "لوحة تحليلات",
            labelEn: "Analytics dashboard",
            labelFr: "Tableau d'analyse",
            priceDeltaCents: 60_000,
          },
        ],
      };
    case "mobile-app":
      return {
        features: [
          {
            id: "push-notifs",
            labelAr: "إشعارات Push",
            labelEn: "Push notifications",
            labelFr: "Notifications push",
            priceDeltaCents: 100_000,
          },
          {
            id: "offline-mode",
            labelAr: "وضع بدون إنترنت",
            labelEn: "Offline mode",
            labelFr: "Mode hors ligne",
            priceDeltaCents: 150_000,
          },
          {
            id: "admin-panel",
            labelAr: "لوحة إدارة متقدمة",
            labelEn: "Advanced admin panel",
            labelFr: "Panneau admin avancé",
            priceDeltaCents: 120_000,
          },
        ],
      };
    default:
      return { features: [] };
  }
}

export function featureLabel(
  feature: ProductFeatureOption,
  locale: string,
): string {
  if (locale === "fr") return feature.labelFr;
  if (locale === "en") return feature.labelEn;
  return feature.labelAr;
}

export function computeOrderPrice(params: {
  basePriceCents: number;
  selectedFeatureIds: string[];
  features: ProductFeatureOption[];
  discountBps: number;
}): {
  subtotalCents: number;
  discountCents: number;
  finalPriceCents: number;
  selectedFeatures: ProductFeatureOption[];
} {
  const selectedFeatures = params.features.filter((f) =>
    params.selectedFeatureIds.includes(f.id),
  );
  const addonsCents = selectedFeatures.reduce((sum, f) => sum + f.priceDeltaCents, 0);
  const subtotalCents = params.basePriceCents + addonsCents;
  const discountCents = Math.floor((subtotalCents * params.discountBps) / 10_000);
  const finalPriceCents = subtotalCents - discountCents;
  return { subtotalCents, discountCents, finalPriceCents, selectedFeatures };
}
