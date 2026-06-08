-- CreateEnum
CREATE TYPE "ClientOrderStatus" AS ENUM ('NEW', 'REVIEWED', 'CONVERTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CLIENT_ORDER';

-- AlterTable
ALTER TABLE "PartnerProfile" ADD COLUMN "clientDiscountCode" TEXT,
ADD COLUMN "discountBps" INTEGER NOT NULL DEFAULT 300;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "featuresJson" JSONB,
ADD COLUMN "descriptionAr" TEXT,
ADD COLUMN "descriptionEn" TEXT,
ADD COLUMN "descriptionFr" TEXT,
ADD COLUMN "publicVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClientOrder" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "status" "ClientOrderStatus" NOT NULL DEFAULT 'NEW',
    "productId" TEXT NOT NULL,
    "partnerId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "company" TEXT,
    "selectedFeatures" JSONB NOT NULL DEFAULT '[]',
    "basePriceCents" INTEGER NOT NULL,
    "discountBps" INTEGER NOT NULL DEFAULT 0,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "finalPriceCents" INTEGER NOT NULL,
    "discountCode" TEXT,
    "notes" TEXT,
    "dealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ClientOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_clientDiscountCode_key" ON "PartnerProfile"("clientDiscountCode");

-- CreateIndex
CREATE INDEX "PartnerProfile_clientDiscountCode_idx" ON "PartnerProfile"("clientDiscountCode");

-- CreateIndex
CREATE UNIQUE INDEX "ClientOrder_dealId_key" ON "ClientOrder"("dealId");

-- CreateIndex
CREATE INDEX "ClientOrder_status_createdAt_idx" ON "ClientOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ClientOrder_partnerId_idx" ON "ClientOrder"("partnerId");

-- CreateIndex
CREATE INDEX "ClientOrder_productId_idx" ON "ClientOrder"("productId");

-- AddForeignKey
ALTER TABLE "ClientOrder" ADD CONSTRAINT "ClientOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientOrder" ADD CONSTRAINT "ClientOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientOrder" ADD CONSTRAINT "ClientOrder_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
