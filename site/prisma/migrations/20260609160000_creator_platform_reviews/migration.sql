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
