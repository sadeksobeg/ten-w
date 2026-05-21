-- Idempotent repair when 0003 is marked applied but tables are missing (migration drift).
-- Safe to re-run; skips objects that already exist.

DO $$ BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM (
    'EVENT_INVITE', 'EVENT_REMINDER', 'EVENT_MILESTONE', 'BADGE_EARNED',
    'LEVEL_UP', 'XP_BOOST', 'PAYOUT_UPDATE', 'DEAL_CLOSED', 'SYSTEM', 'ADMIN_MESSAGE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "publicSlug" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "User_publicSlug_key" ON "User"("publicSlug");

ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "displayTitle" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "LevelDefinition" ADD COLUMN IF NOT EXISTS "minXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "XpEvent" ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE TABLE IF NOT EXISTS "GrowthEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GrowthEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GrowthEvent_slug_key" ON "GrowthEvent"("slug");
CREATE INDEX IF NOT EXISTS "GrowthEvent_status_idx" ON "GrowthEvent"("status");
CREATE INDEX IF NOT EXISTS "GrowthEvent_startAt_idx" ON "GrowthEvent"("startAt");

CREATE TABLE IF NOT EXISTS "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "acceptedRules" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "rewardedMilestones" JSONB,
    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventParticipant_eventId_userId_key" ON "EventParticipant"("eventId", "userId");
CREATE INDEX IF NOT EXISTS "EventParticipant_userId_idx" ON "EventParticipant"("userId");

CREATE TABLE IF NOT EXISTS "EventMilestone" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    "requiredProgress" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "EventMilestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EventMilestone_eventId_idx" ON "EventMilestone"("eventId");

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "EventNotification" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    CONSTRAINT "EventNotification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventNotification_eventId_notificationId_key" ON "EventNotification"("eventId", "notificationId");

DO $$ BEGIN
  ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventMilestone" ADD CONSTRAINT "EventMilestone_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventNotification" ADD CONSTRAINT "EventNotification_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventNotification" ADD CONSTRAINT "EventNotification_notificationId_fkey"
    FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "GrowthEvent" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
