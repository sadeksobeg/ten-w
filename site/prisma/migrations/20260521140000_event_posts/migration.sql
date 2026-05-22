-- CreateEnum
CREATE TYPE "EventPostKind" AS ENUM ('POST', 'REPOST');

-- CreateTable
CREATE TABLE "EventPost" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" "EventPostKind" NOT NULL DEFAULT 'POST',
    "repostOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPost_eventId_createdAt_idx" ON "EventPost"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventPost_userId_idx" ON "EventPost"("userId");

-- AddForeignKey
ALTER TABLE "EventPost" ADD CONSTRAINT "EventPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GrowthEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPost" ADD CONSTRAINT "EventPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPost" ADD CONSTRAINT "EventPost_repostOfId_fkey" FOREIGN KEY ("repostOfId") REFERENCES "EventPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
