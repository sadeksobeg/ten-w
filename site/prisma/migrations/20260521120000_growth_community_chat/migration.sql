-- CreateEnum
CREATE TYPE "ChatRoomType" AS ENUM ('COMMUNITY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarPreset" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerifiedOfficial" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "officialDisplayName" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatRoom" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ChatRoomType" NOT NULL DEFAULT 'COMMUNITY',
    "title" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatRoomMember" (
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoomMember_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatRoomMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "triggerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ChatRoom_slug_key" ON "ChatRoom"("slug");
CREATE INDEX IF NOT EXISTS "ChatRoomMember_userId_idx" ON "ChatRoomMember"("userId");
CREATE INDEX IF NOT EXISTS "ChatRoomMessage_roomId_createdAt_idx" ON "ChatRoomMessage"("roomId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "ChatRoomMember" ADD CONSTRAINT "ChatRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "ChatRoomMember" ADD CONSTRAINT "ChatRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "ChatRoomMessage" ADD CONSTRAINT "ChatRoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
 ALTER TABLE "ChatRoomMessage" ADD CONSTRAINT "ChatRoomMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
