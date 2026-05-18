-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARTNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('PENDING', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('AUTO', 'ADMIN');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('FINANCIAL', 'SOCIAL', 'BEHAVIORAL', 'META');

-- CreateEnum
CREATE TYPE "DemoSessionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "ChatConversationStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ChatPriority" AS ENUM ('HIGH', 'NORMAL', 'LOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PARTNER',
    "marketingKitHits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "parentUserId" TEXT,
    "currentLevelId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelDefinition" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minClosedDeals" INTEGER NOT NULL,
    "salaryUsd" INTEGER,
    "perksJson" JSONB,

    CONSTRAINT "LevelDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "commissionBaseCents" INTEGER NOT NULL,
    "marketingKit" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionTierConfig" (
    "id" TEXT NOT NULL,
    "tier1Bps" INTEGER NOT NULL DEFAULT 10000,
    "tier2Bps" INTEGER NOT NULL DEFAULT 1000,
    "tier3Bps" INTEGER NOT NULL DEFAULT 500,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionTierConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'PENDING',
    "saleAmountCents" INTEGER NOT NULL,
    "notes" TEXT,
    "clientLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "lostAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionLedger" (
    "id" TEXT NOT NULL,
    "dealId" TEXT,
    "userId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "ruleSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "category" "BadgeCategory" NOT NULL DEFAULT 'META',
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "iconKey" TEXT,
    "description" TEXT,
    "criteria" JSONB,

    CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedById" TEXT,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "dealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MissionDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMissionDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserMissionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardRewardRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "rankMin" INTEGER NOT NULL,
    "rankMax" INTEGER NOT NULL,
    "bonusCents" INTEGER NOT NULL DEFAULT 0,
    "badgeKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LeaderboardRewardRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardGrantLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "ruleId" TEXT,
    "bonusCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardGrantLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCommissionOverride" (
    "id" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "productId" TEXT,
    "commissionBaseCents" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "actorUserId" TEXT,
    "headline" TEXT NOT NULL,
    "amountCents" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "DemoSessionStatus" NOT NULL DEFAULT 'RUNNING',
    "scriptVariant" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "DemoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "status" "ChatConversationStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ChatPriority" NOT NULL DEFAULT 'NORMAL',
    "linkedDealId" TEXT,
    "subject" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "delayMs" INTEGER NOT NULL DEFAULT 900,
    "payload" JSONB NOT NULL,

    CONSTRAINT "DemoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_userId_key" ON "PartnerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerProfile_referralCode_key" ON "PartnerProfile"("referralCode");

-- CreateIndex
CREATE INDEX "PartnerProfile_parentUserId_idx" ON "PartnerProfile"("parentUserId");

-- CreateIndex
CREATE INDEX "PartnerProfile_referralCode_idx" ON "PartnerProfile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "LevelDefinition_order_key" ON "LevelDefinition"("order");

-- CreateIndex
CREATE UNIQUE INDEX "LevelDefinition_code_key" ON "LevelDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Deal_partnerId_status_idx" ON "Deal"("partnerId", "status");

-- CreateIndex
CREATE INDEX "Deal_closedAt_idx" ON "Deal"("closedAt");

-- CreateIndex
CREATE INDEX "CommissionLedger_userId_idx" ON "CommissionLedger"("userId");

-- CreateIndex
CREATE INDEX "CommissionLedger_dealId_idx" ON "CommissionLedger"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeDefinition_key_key" ON "BadgeDefinition"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "XpEvent_userId_createdAt_idx" ON "XpEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PayoutRequest_userId_status_idx" ON "PayoutRequest"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MissionDefinition_key_key" ON "MissionDefinition"("key");

-- CreateIndex
CREATE INDEX "UserMissionDay_userId_day_idx" ON "UserMissionDay"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "UserMissionDay_userId_missionKey_day_key" ON "UserMissionDay"("userId", "missionKey", "day");

-- CreateIndex
CREATE INDEX "LeaderboardGrantLog_userId_periodKey_idx" ON "LeaderboardGrantLog"("userId", "periodKey");

-- CreateIndex
CREATE INDEX "PartnerCommissionOverride_partnerUserId_idx" ON "PartnerCommissionOverride"("partnerUserId");

-- CreateIndex
CREATE INDEX "ActivityEvent_createdAt_idx" ON "ActivityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "DemoSession_createdById_startedAt_idx" ON "DemoSession"("createdById", "startedAt");

-- CreateIndex
CREATE INDEX "ChatConversation_partnerUserId_status_idx" ON "ChatConversation"("partnerUserId", "status");

-- CreateIndex
CREATE INDEX "ChatConversation_lastMessageAt_idx" ON "ChatConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatConversation_priority_idx" ON "ChatConversation"("priority");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "DemoEvent_sessionId_idx" ON "DemoEvent"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoEvent_sessionId_seq_key" ON "DemoEvent"("sessionId", "seq");

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerProfile" ADD CONSTRAINT "PartnerProfile_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "LevelDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedger" ADD CONSTRAINT "CommissionLedger_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedger" ADD CONSTRAINT "CommissionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "BadgeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMissionDay" ADD CONSTRAINT "UserMissionDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardGrantLog" ADD CONSTRAINT "LeaderboardGrantLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionOverride" ADD CONSTRAINT "PartnerCommissionOverride_partnerUserId_fkey" FOREIGN KEY ("partnerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionOverride" ADD CONSTRAINT "PartnerCommissionOverride_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoSession" ADD CONSTRAINT "DemoSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_partnerUserId_fkey" FOREIGN KEY ("partnerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_linkedDealId_fkey" FOREIGN KEY ("linkedDealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoEvent" ADD CONSTRAINT "DemoEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DemoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
