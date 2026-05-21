-- LeaderboardSeason: composite scoring weights
CREATE TABLE IF NOT EXISTS "LeaderboardSeason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "windowMs" BIGINT NOT NULL,
    "weightDeals" INTEGER NOT NULL DEFAULT 40,
    "weightXp" INTEGER NOT NULL DEFAULT 40,
    "weightStreak" INTEGER NOT NULL DEFAULT 20,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardSeason_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeaderboardSeason_active_idx" ON "LeaderboardSeason"("active");

-- UserActivityDay: heatmap / membership activity
CREATE TABLE IF NOT EXISTS "UserActivityDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserActivityDay_userId_day_key" ON "UserActivityDay"("userId", "day");
CREATE INDEX IF NOT EXISTS "UserActivityDay_userId_idx" ON "UserActivityDay"("userId");

ALTER TABLE "UserActivityDay" ADD CONSTRAINT "UserActivityDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "LeaderboardSeason" ("id", "name", "windowMs", "weightDeals", "weightXp", "weightStreak", "active", "updatedAt")
SELECT 'default-weekly', 'الأسبوع الحالي', 604800000, 40, 40, 20, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "LeaderboardSeason" WHERE "active" = true);
