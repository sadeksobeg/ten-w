-- Remove demo seed reviews (no link to partner User accounts)
DELETE FROM "CreatorPlatformReview" WHERE "id" IN ('seed_cpr_1', 'seed_cpr_2', 'seed_cpr_3');
