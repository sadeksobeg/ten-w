-- CreateTable
CREATE TABLE "CreatorPlatformReview" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "nameFr" TEXT NOT NULL DEFAULT '',
    "roleAr" TEXT,
    "roleEn" TEXT,
    "roleFr" TEXT,
    "quoteAr" TEXT NOT NULL,
    "quoteEn" TEXT NOT NULL,
    "quoteFr" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPlatformReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreatorPlatformReview_active_sortOrder_idx" ON "CreatorPlatformReview"("active", "sortOrder");

-- Seed starter reviews
INSERT INTO "CreatorPlatformReview" ("id", "nameAr", "nameEn", "nameFr", "roleAr", "roleEn", "roleFr", "quoteAr", "quoteEn", "quoteFr", "rating", "active", "sortOrder", "updatedAt")
VALUES
  ('seed_cpr_1', 'نادية يزجي', 'Nadia Yazji', 'Nadia Yazji', 'صانعة تقنية · الإمارات', 'Tech creator · UAE', 'Créatrice tech · EAU', 'Creator Hub غيّر طريقة عملي — أدوات حقيقية، مجتمع حي، وعمولات واضحة. أفضل منصة صنعت معها محتوى B2B.', 'Creator Hub changed how I work — real tools, live community, clear commissions. The best B2B content platform I have used.', 'Creator Hub a changé ma façon de travailler — outils réels, communauté active, commissions claires.', 5, true, 0, CURRENT_TIMESTAMP),
  ('seed_cpr_2', 'غيث الصيد', 'Ghaith Alsayd', 'Ghaith Alsayd', 'صانع أعمال · لبنان', 'Business creator · Lebanon', 'Créateur business · Liban', 'التحديات الأسبوعية وكأس الصنّاع يحفّزانني كل أسبوع. المنصة احترافية وتشعرك أنك جزء من شبكة عالمية.', 'Weekly challenges and Creator Cup motivate me every week. Professional and truly global.', 'Les défis hebdo et le Creator Cup me motivent chaque semaine. Professionnel et vraiment global.', 5, true, 1, CURRENT_TIMESTAMP),
  ('seed_cpr_3', 'أحمد القيسير', 'Ahmad Alkaseer', 'Ahmad Alkaseer', 'صانع تعليمي · سوريا', 'Education creator · Syria', 'Créateur éducation · Syrie', 'حقيبة التسويق والروابط المتتبعة وفّرت عليّ ساعات. ASCEND وCreator Hub معاً = نظام كامل.', 'The marketing kit and tracked links saved me hours. ASCEND + Creator Hub = a complete system.', 'Le kit marketing et les liens trackés m''ont fait gagner des heures. ASCEND + Creator Hub = système complet.', 5, true, 2, CURRENT_TIMESTAMP);
