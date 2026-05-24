-- Chat moderation: trusted moderators + soft edit/delete on room messages
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "chatModerator" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ChatRoomMessage" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ChatRoomMessage" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);
ALTER TABLE "ChatRoomMessage" ADD COLUMN IF NOT EXISTS "editedById" TEXT;

ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "editedById" TEXT;
