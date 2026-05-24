-- Replace auto-synced contact leads with the curated influencer outreach list (May 2026)

DELETE FROM "EventContactLead" WHERE "isManual" = false;

INSERT INTO "EventContactLead" ("id", "eventId", "normalizedKey", "name", "handle", "status", "isManual", "sourcePostId", "createdAt", "updatedAt")
SELECT
  md5(e."id" || '|' || seed."normalizedKey") || substr(md5(random()::text), 1, 9),
  e."id",
  seed."normalizedKey",
  seed."name",
  seed."handle",
  seed."status"::"EventContactStatus",
  false,
  NULL,
  NOW(),
  NOW()
FROM "GrowthEvent" e
CROSS JOIN (
  VALUES
    ('دلع-حسون', 'دلع حسون', NULL, 'CONTACTED'),
    ('دعاء-حمود', 'دعاء حمود', NULL, 'CONTACTED'),
    ('كريم-حسن', 'كريم حسن', NULL, 'CONTACTED'),
    ('وسيم-قداحة', 'وسيم قداحة', NULL, 'CONTACTED'),
    ('ميسم-حيدر', 'ميسم حيدر', NULL, 'CONTACTED'),
    ('مايا-جبر', 'مايا جبر', NULL, 'CONTACTED'),
    ('بتول-منصور', 'بتول منصور', NULL, 'PENDING'),
    ('ديما-دالاتي', 'ديما دالاتي', NULL, 'PENDING'),
    ('يارا-الشيخ', 'يارا الشيخ', NULL, 'PENDING'),
    ('ڤيوليت-رستم', 'ڤيوليت رستم', NULL, 'PENDING'),
    ('dr-rahaf-brand', 'رهف سلوم', 'dr_rahaf_brand', 'PENDING'),
    ('drhero-products', 'رغد سلوم', 'drhero_products', 'PENDING'),
    ('luna-albr', 'لونا ابراهيم', 'luna_albr', 'PENDING'),
    ('batoul-rstomm', 'بتول رستم', 'batoul_rstomm', 'PENDING')
) AS seed("normalizedKey", "name", "handle", "status")
ON CONFLICT ("eventId", "normalizedKey") DO UPDATE SET
  "name" = EXCLUDED."name",
  "handle" = EXCLUDED."handle",
  "status" = EXCLUDED."status",
  "isManual" = false,
  "updatedAt" = NOW()
WHERE "EventContactLead"."isManual" = false;
