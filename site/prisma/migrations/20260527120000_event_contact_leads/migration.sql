-- Smart assistant: influencer/contact names extracted from event posts

CREATE TYPE "EventContactStatus" AS ENUM ('PENDING', 'CONTACTED');

CREATE TABLE IF NOT EXISTS "EventContactLead" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "normalizedKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "handle" TEXT,
  "status" "EventContactStatus" NOT NULL DEFAULT 'PENDING',
  "sourcePostId" TEXT,
  "isManual" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventContactLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventContactLead_eventId_normalizedKey_key"
  ON "EventContactLead"("eventId", "normalizedKey");
CREATE INDEX IF NOT EXISTS "EventContactLead_eventId_status_idx"
  ON "EventContactLead"("eventId", "status");

DO $$ BEGIN
  ALTER TABLE "EventContactLead" ADD CONSTRAINT "EventContactLead_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
