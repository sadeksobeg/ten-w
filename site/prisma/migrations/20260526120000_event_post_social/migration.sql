-- Event post likes, comments, soft delete

ALTER TABLE "EventPost" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "EventPostLike" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventPostLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventPostLike_postId_userId_key" ON "EventPostLike"("postId", "userId");
CREATE INDEX IF NOT EXISTS "EventPostLike_postId_idx" ON "EventPostLike"("postId");

CREATE TABLE IF NOT EXISTS "EventPostComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventPostComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EventPostComment_postId_createdAt_idx" ON "EventPostComment"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "EventPostComment_userId_idx" ON "EventPostComment"("userId");

DO $$ BEGIN
  ALTER TABLE "EventPostLike" ADD CONSTRAINT "EventPostLike_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "EventPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventPostLike" ADD CONSTRAINT "EventPostLike_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventPostComment" ADD CONSTRAINT "EventPostComment_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "EventPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventPostComment" ADD CONSTRAINT "EventPostComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
