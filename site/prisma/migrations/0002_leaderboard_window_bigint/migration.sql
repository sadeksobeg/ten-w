-- 30 days in ms (2_592_000_000) exceeds INT4 max; store windowMs as BIGINT
ALTER TABLE "LeaderboardRewardRule" ALTER COLUMN "windowMs" SET DATA TYPE BIGINT;
