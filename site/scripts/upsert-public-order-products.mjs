/**
 * Safe one-time upsert for production: enables public order packages
 * without wiping or modifying existing partner accounts.
 *
 * Run on server after migrate:
 *   cd site && node scripts/upsert-public-order-products.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEATURES = {
  website: {
    features: [
      { id: "extra-lang", labelAr: "لغات إضافية", labelEn: "Extra languages", labelFr: "Langues supplémentaires", priceDeltaCents: 80000 },
      { id: "ecommerce", labelAr: "متجر إلكتروني", labelEn: "E-commerce store", labelFr: "Boutique en ligne", priceDeltaCents: 120000 },
      { id: "advanced-seo", labelAr: "SEO متقدم", labelEn: "Advanced SEO", labelFr: "SEO avancé", priceDeltaCents: 50000 },
    ],
  },
  "automation-ai": {
    features: [
      { id: "whatsapp-bot", labelAr: "بوت واتساب ذكي", labelEn: "WhatsApp AI bot", labelFr: "Bot WhatsApp IA", priceDeltaCents: 90000 },
      { id: "crm-sync", labelAr: "ربط CRM", labelEn: "CRM integration", labelFr: "Intégration CRM", priceDeltaCents: 70000 },
      { id: "analytics-dash", labelAr: "لوحة تحليلات", labelEn: "Analytics dashboard", labelFr: "Tableau d'analyse", priceDeltaCents: 60000 },
    ],
  },
  "mobile-app": {
    features: [
      { id: "push-notifs", labelAr: "إشعارات Push", labelEn: "Push notifications", labelFr: "Notifications push", priceDeltaCents: 100000 },
      { id: "offline-mode", labelAr: "وضع بدون إنترنت", labelEn: "Offline mode", labelFr: "Mode hors ligne", priceDeltaCents: 150000 },
      { id: "admin-panel", labelAr: "لوحة إدارة متقدمة", labelEn: "Advanced admin panel", labelFr: "Panneau admin avancé", priceDeltaCents: 120000 },
    ],
  },
};

const PUBLIC_PRODUCTS = [
  {
    slug: "website",
    name: "موقع إلكتروني",
    priceCents: 450000,
    commissionBaseCents: 45000,
    sortOrder: 1,
    descriptionAr: "موقع احترافي سريع ومتجاوب مع لوحة إدارة — يعكس هوية شركتك ويحوّل الزوار لعملاء.",
    descriptionEn: "A fast, responsive professional website with admin panel.",
    descriptionFr: "Site web professionnel rapide et responsive avec panneau admin.",
  },
  {
    slug: "automation-ai",
    name: "أتمتة وذكاء اصطناعي",
    priceCents: 590000,
    commissionBaseCents: 59000,
    sortOrder: 2,
    descriptionAr: "نظام أتمتة ذكي يربط قنوات التواصل ويحوّل العملاء المحتملين لمسار واضح.",
    descriptionEn: "Smart automation connecting channels and routing leads.",
    descriptionFr: "Automatisation intelligente reliant les canaux et les leads.",
  },
  {
    slug: "mobile-app",
    name: "تطبيق موبايل",
    priceCents: 950000,
    commissionBaseCents: 95000,
    sortOrder: 3,
    descriptionAr: "تطبيق iOS و Android مخصص لعلامتك — تجربة سلسة ولوحة تحكم.",
    descriptionEn: "Custom iOS & Android app for your brand.",
    descriptionFr: "Application iOS et Android sur mesure.",
  },
];

async function main() {
  for (const p of PUBLIC_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        featuresJson: FEATURES[p.slug],
        publicVisible: true,
        active: true,
      },
      update: {
        name: p.name,
        priceCents: p.priceCents,
        commissionBaseCents: p.commissionBaseCents,
        featuresJson: FEATURES[p.slug],
        descriptionAr: p.descriptionAr,
        descriptionEn: p.descriptionEn,
        descriptionFr: p.descriptionFr,
        publicVisible: true,
        sortOrder: p.sortOrder,
        active: true,
      },
    });
    console.log(`OK: ${p.slug}`);
  }

  // Hide non-public packages from order page only
  await prisma.product.updateMany({
    where: { slug: { in: ["clinic-system", "visual-identity"] } },
    data: { publicVisible: false },
  });

  console.log("Done — public order products ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
