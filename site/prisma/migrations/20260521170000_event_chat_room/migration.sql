-- Event-scoped chat rooms (one room per GrowthEvent)
ALTER TYPE "ChatRoomType" ADD VALUE IF NOT EXISTS 'EVENT';

ALTER TABLE "ChatRoom" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ChatRoom_eventId_key" ON "ChatRoom"("eventId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ChatRoom_eventId_fkey'
  ) THEN
    ALTER TABLE "ChatRoom"
      ADD CONSTRAINT "ChatRoom_eventId_fkey"
      FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
