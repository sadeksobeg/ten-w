-- Addictive growth features: territory, card numbers, DNA snapshots, Hall of Legends

ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "territory" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "cardNumber" INTEGER;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "dnaSnapshot" JSONB;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "dnaSnapshotAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerProfile_cardNumber_key" ON "PartnerProfile"("cardNumber");

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "PartnerProfile"
  WHERE "cardNumber" IS NULL
)
UPDATE "PartnerProfile" p
SET "cardNumber" = numbered.rn
FROM numbered
WHERE p.id = numbered.id;

CREATE TABLE IF NOT EXISTS "HallOfLegend" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "monthAdded" TEXT NOT NULL,
  "achievement" TEXT NOT NULL,
  "quote" TEXT,
  "addedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HallOfLegend_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HallOfLegend_partnerId_key" ON "HallOfLegend"("partnerId");
CREATE UNIQUE INDEX IF NOT EXISTS "HallOfLegend_rank_key" ON "HallOfLegend"("rank");

DO $$ BEGIN
  ALTER TABLE "HallOfLegend" ADD CONSTRAINT "HallOfLegend_partnerId_fkey"
    FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "HallOfLegend" ADD CONSTRAINT "HallOfLegend_addedById_fkey"
    FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
