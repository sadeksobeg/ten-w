-- CreateEnum
CREATE TYPE "CreatorWorkflowStatus" AS ENUM ('INVITED', 'JOINED', 'FILMING', 'SUBMITTED', 'FEATURED');

-- CreateTable
CREATE TABLE "CreatorArenaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CreatorWorkflowStatus" NOT NULL DEFAULT 'JOINED',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "CreatorArenaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorChallenge" (
    "id" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL DEFAULT '',
    "bodyAr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyFr" TEXT NOT NULL DEFAULT '',
    "xpReward" INTEGER NOT NULL DEFAULT 500,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorArenaVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorArenaVisit_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "InviteCard" ADD COLUMN "inviteeEmail" TEXT,
ADD COLUMN "linkedUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreatorArenaProfile_userId_key" ON "CreatorArenaProfile"("userId");

-- CreateIndex
CREATE INDEX "CreatorArenaProfile_status_idx" ON "CreatorArenaProfile"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorChallenge_weekKey_key" ON "CreatorChallenge"("weekKey");

-- CreateIndex
CREATE INDEX "CreatorSubmission_weekKey_idx" ON "CreatorSubmission"("weekKey");

-- CreateIndex
CREATE INDEX "CreatorSubmission_userId_idx" ON "CreatorSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorSubmission_userId_weekKey_key" ON "CreatorSubmission"("userId", "weekKey");

-- CreateIndex
CREATE INDEX "CreatorArenaVisit_utmSource_createdAt_idx" ON "CreatorArenaVisit"("utmSource", "createdAt");

-- CreateIndex
CREATE INDEX "CreatorArenaVisit_userId_idx" ON "CreatorArenaVisit"("userId");

-- CreateIndex
CREATE INDEX "InviteCard_inviteeEmail_idx" ON "InviteCard"("inviteeEmail");

-- AddForeignKey
ALTER TABLE "CreatorArenaProfile" ADD CONSTRAINT "CreatorArenaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubmission" ADD CONSTRAINT "CreatorSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCard" ADD CONSTRAINT "InviteCard_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
