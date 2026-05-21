-- CreateEnum
CREATE TYPE "GrowthRewardStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "UserMissionDay" ADD COLUMN "rewardStatus" "GrowthRewardStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "rewardXp" INTEGER,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT;

-- Backfill: missions already completed before this migration had XP granted immediately
UPDATE "UserMissionDay" SET "rewardStatus" = 'APPROVED' WHERE "completedAt" IS NOT NULL;

-- CreateTable
CREATE TABLE "PendingChainReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chainGroup" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "xpAmount" INTEGER NOT NULL,
    "rewardStatus" "GrowthRewardStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingChainReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMissionDay_rewardStatus_idx" ON "UserMissionDay"("rewardStatus");

-- CreateIndex
CREATE UNIQUE INDEX "PendingChainReward_userId_chainGroup_day_key" ON "PendingChainReward"("userId", "chainGroup", "day");

-- CreateIndex
CREATE INDEX "PendingChainReward_rewardStatus_idx" ON "PendingChainReward"("rewardStatus");

-- AddForeignKey
ALTER TABLE "UserMissionDay" ADD CONSTRAINT "UserMissionDay_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingChainReward" ADD CONSTRAINT "PendingChainReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingChainReward" ADD CONSTRAINT "PendingChainReward_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
