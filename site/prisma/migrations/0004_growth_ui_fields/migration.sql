-- Growth UI: event cover images
ALTER TABLE "GrowthEvent" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
