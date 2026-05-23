-- Safe insert: adds badge definitions only (no wipe). Run from site/:
--   npx prisma db execute --schema=./prisma/schema.prisma --stdin < scripts/add-new-badges.sql

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'content_creator', 'Content Creator', 'ADMIN', 'SOCIAL', false, NULL,
  'Featured content creator — shown in event chat.', NULL
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'content_creator');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'verified_partner', 'Verified Partner', 'ADMIN', 'META', false, NULL,
  'Official verified partner badge.', NULL
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'verified_partner');
