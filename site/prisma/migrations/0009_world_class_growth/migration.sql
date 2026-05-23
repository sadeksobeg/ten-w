-- World-class growth: push subscription, daily check-in, badge showcase
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pushSubscription" TEXT;

ALTER TABLE "UserStreak" ADD COLUMN IF NOT EXISTS "lastCheckInDate" TIMESTAMP(3);

ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "showcasedBadges" TEXT[] DEFAULT ARRAY[]::TEXT[];
