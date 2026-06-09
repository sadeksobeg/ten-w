-- Creator Experience Overhaul (additive)
ALTER TABLE "CreatorApplication" ADD COLUMN IF NOT EXISTS "applicantNote" TEXT;

CREATE TABLE IF NOT EXISTS "CreatorNomination" (
    "id" TEXT NOT NULL,
    "nominatorUserId" TEXT NOT NULL,
    "nomineeUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorNomination_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreatorNomination_nominatorUserId_nomineeUserId_key"
    ON "CreatorNomination"("nominatorUserId", "nomineeUserId");
CREATE INDEX IF NOT EXISTS "CreatorNomination_nomineeUserId_idx" ON "CreatorNomination"("nomineeUserId");

ALTER TABLE "CreatorNomination" ADD CONSTRAINT "CreatorNomination_nominatorUserId_fkey"
    FOREIGN KEY ("nominatorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorNomination" ADD CONSTRAINT "CreatorNomination_nomineeUserId_fkey"
    FOREIGN KEY ("nomineeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
