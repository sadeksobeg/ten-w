-- Legal consent ledger (immutable audit trail)
ALTER TABLE "CreatorArenaProfile"
  ADD COLUMN IF NOT EXISTS "consentLocale" TEXT,
  ADD COLUMN IF NOT EXISTS "consentTextHash" TEXT;

CREATE TABLE "CreatorConsentLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentLocale" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "consentTextSnapshot" TEXT NOT NULL,
    "consentTextHash" TEXT NOT NULL,
    "qualificationStatement" TEXT NOT NULL,
    "attestations" JSONB NOT NULL,
    "consentMethod" TEXT NOT NULL DEFAULT 'clickwrap_v1',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousRecordId" TEXT,

    CONSTRAINT "CreatorConsentLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreatorConsentLedger_userId_recordedAt_idx" ON "CreatorConsentLedger"("userId", "recordedAt");
CREATE INDEX "CreatorConsentLedger_consentVersion_idx" ON "CreatorConsentLedger"("consentVersion");
CREATE INDEX "CreatorConsentLedger_consentTextHash_idx" ON "CreatorConsentLedger"("consentTextHash");

ALTER TABLE "CreatorConsentLedger" ADD CONSTRAINT "CreatorConsentLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill ledger from existing profile consents (Arabic snapshot as stored historically)
INSERT INTO "CreatorConsentLedger" (
    "id", "userId", "consentVersion", "consentLocale", "signerName", "signerEmail",
    "consentTextSnapshot", "consentTextHash", "qualificationStatement", "attestations",
    "consentMethod", "ipAddress", "userAgent", "recordedAt"
)
SELECT
    'backfill_' || cap."id",
    cap."userId",
    COALESCE(cap."consentVersion", 'v1.0-2026-06'),
    COALESCE(cap."consentLocale", 'ar'),
    COALESCE(u."name", u."email", 'Unknown'),
    u."email",
    COALESCE(cap."consentText", ''),
    COALESCE(cap."consentTextHash", 'legacy'),
    COALESCE(cap."qualificationDetails", ''),
    jsonb_build_object(
        'scrolledToEnd', true,
        'readAndUnderstood', true,
        'contentResponsibility', true,
        'legalCapacity', true,
        'backfilled', true
    ),
    'clickwrap_v1',
    cap."consentIpAddress",
    cap."consentUserAgent",
    COALESCE(cap."consentGivenAt", cap."updatedAt")
FROM "CreatorArenaProfile" cap
JOIN "User" u ON u."id" = cap."userId"
WHERE cap."consentGiven" = true
  AND NOT EXISTS (
    SELECT 1 FROM "CreatorConsentLedger" l WHERE l."userId" = cap."userId"
  );
