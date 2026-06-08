-- AlterTable CreatorArenaProfile
ALTER TABLE "CreatorArenaProfile" ADD COLUMN "notes" TEXT,
ADD COLUMN "lastActiveAt" TIMESTAMP(3),
ADD COLUMN "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "featuredCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "milestones" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable CreatorChallenge
ALTER TABLE "CreatorChallenge" ADD COLUMN "featuredSubmissionId" TEXT,
ADD COLUMN "totalSubmissions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable CreatorSubmission
ALTER TABLE "CreatorSubmission" ADD COLUMN "platform" TEXT,
ADD COLUMN "adminRating" INTEGER,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
