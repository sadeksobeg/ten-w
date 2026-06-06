-- Additive: legacy invite URL support (InviteCard only)
ALTER TABLE "InviteCard" ADD COLUMN IF NOT EXISTS "legacySlug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "InviteCard_legacySlug_key" ON "InviteCard"("legacySlug");
