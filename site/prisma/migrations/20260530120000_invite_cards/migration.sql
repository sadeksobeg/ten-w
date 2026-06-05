-- CreateTable InviteCard (additive — does not modify User/PartnerProfile rows)
CREATE TABLE "InviteCard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'CONTENT CREATOR',
    "scope" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCard_token_key" ON "InviteCard"("token");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCard_slug_key" ON "InviteCard"("slug");

-- CreateIndex
CREATE INDEX "InviteCard_accepted_idx" ON "InviteCard"("accepted");

-- CreateIndex
CREATE INDEX "InviteCard_createdAt_idx" ON "InviteCard"("createdAt");

-- AddForeignKey
ALTER TABLE "InviteCard" ADD CONSTRAINT "InviteCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
