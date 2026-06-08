-- CreatorArenaProfile extensions
ALTER TABLE "CreatorArenaProfile" ADD COLUMN IF NOT EXISTS "bio" VARCHAR(280),
ADD COLUMN IF NOT EXISTS "specialty" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "contentIdeas" JSONB,
ADD COLUMN IF NOT EXISTS "notificationPreferences" JSONB;

-- CreatorSubmission extensions
ALTER TABLE "CreatorSubmission" ADD COLUMN IF NOT EXISTS "description" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "adminNote" TEXT;

-- ChatRoomMember read state
ALTER TABLE "ChatRoomMember" ADD COLUMN IF NOT EXISTS "lastReadAt" TIMESTAMP(3);

-- CreatorApplication
CREATE TABLE IF NOT EXISTS "CreatorApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mainPlatformUrl" TEXT NOT NULL,
    "platform" TEXT,
    "contentTypes" JSONB NOT NULL,
    "followersRange" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CreatorApplication_status_createdAt_idx" ON "CreatorApplication"("status", "createdAt");

-- ChatRoomMessageReaction
CREATE TABLE IF NOT EXISTS "ChatRoomMessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoomMessageReaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChatRoomMessageReaction_messageId_userId_emoji_key" ON "ChatRoomMessageReaction"("messageId", "userId", "emoji");
CREATE INDEX IF NOT EXISTS "ChatRoomMessageReaction_messageId_idx" ON "ChatRoomMessageReaction"("messageId");
ALTER TABLE "ChatRoomMessageReaction" DROP CONSTRAINT IF EXISTS "ChatRoomMessageReaction_messageId_fkey";
ALTER TABLE "ChatRoomMessageReaction" ADD CONSTRAINT "ChatRoomMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatRoomMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatRoomMessageReaction" DROP CONSTRAINT IF EXISTS "ChatRoomMessageReaction_userId_fkey";
ALTER TABLE "ChatRoomMessageReaction" ADD CONSTRAINT "ChatRoomMessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreatorDirectRoom
CREATE TABLE IF NOT EXISTS "CreatorDirectRoom" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorDirectRoom_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CreatorDirectRoom_roomId_key" ON "CreatorDirectRoom"("roomId");
CREATE UNIQUE INDEX IF NOT EXISTS "CreatorDirectRoom_userAId_userBId_key" ON "CreatorDirectRoom"("userAId", "userBId");
CREATE INDEX IF NOT EXISTS "CreatorDirectRoom_userAId_idx" ON "CreatorDirectRoom"("userAId");
CREATE INDEX IF NOT EXISTS "CreatorDirectRoom_userBId_idx" ON "CreatorDirectRoom"("userBId");
ALTER TABLE "CreatorDirectRoom" DROP CONSTRAINT IF EXISTS "CreatorDirectRoom_userAId_fkey";
ALTER TABLE "CreatorDirectRoom" ADD CONSTRAINT "CreatorDirectRoom_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorDirectRoom" DROP CONSTRAINT IF EXISTS "CreatorDirectRoom_userBId_fkey";
ALTER TABLE "CreatorDirectRoom" ADD CONSTRAINT "CreatorDirectRoom_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreatorDirectRoom" DROP CONSTRAINT IF EXISTS "CreatorDirectRoom_roomId_fkey";
ALTER TABLE "CreatorDirectRoom" ADD CONSTRAINT "CreatorDirectRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
