-- Partner presence + large avatar storage
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ALTER COLUMN "avatarUrl" TYPE TEXT;
