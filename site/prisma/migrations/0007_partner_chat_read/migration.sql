-- Partner chat read state + history support
ALTER TABLE "ChatConversation" ADD COLUMN IF NOT EXISTS "partnerLastReadAt" TIMESTAMP(3);
