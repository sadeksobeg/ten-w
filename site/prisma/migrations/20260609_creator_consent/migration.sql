-- Creator legal consent (additive)
ALTER TABLE "CreatorArenaProfile"
  ADD COLUMN IF NOT EXISTS "consentGiven" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentGivenAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentIpAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "consentUserAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "consentVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "consentText" TEXT,
  ADD COLUMN IF NOT EXISTS "qualificationDeclared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "qualificationDeclaredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "qualificationDetails" TEXT;

ALTER TABLE "CreatorApplication"
  ADD COLUMN IF NOT EXISTS "applicationConsentGiven" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "applicationConsentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "applicationConsentVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "applicationConsentIp" TEXT;
