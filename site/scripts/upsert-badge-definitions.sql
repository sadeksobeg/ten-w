-- Safe: inserts missing BadgeDefinition rows only. Does NOT touch UserBadge or partners.
-- Run: npx prisma db execute --schema=./prisma/schema.prisma --stdin < scripts/upsert-badge-definitions.sql

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'founding_partner', 'Founding Partner', 'ADMIN', 'META', false, NULL,
  'Early founding partner.', '{"kind":"admin_grant_only"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'founding_partner');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'network_10', 'Network of Ten', 'AUTO', 'SOCIAL', false, NULL,
  '10 partners in your network.', '{"kind":"min_downlines","value":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'network_10');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'streak_7', 'Unstoppable Week', 'AUTO', 'BEHAVIORAL', false, NULL,
  '7-day check-in streak.', '{"kind":"streak_days","value":7}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'streak_7');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'streak_30', 'Unquenchable', 'AUTO', 'BEHAVIORAL', false, NULL,
  '30-day check-in streak.', '{"kind":"streak_days","value":30}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'streak_30');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'revenue_1k', 'First Thousand', 'AUTO', 'FINANCIAL', false, NULL,
  '$1,000+ commissions.', '{"kind":"commission_cents","value":100000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'revenue_1k');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'events_5', 'Event Pro', 'AUTO', 'SOCIAL', false, NULL,
  'Joined 5 events.', '{"kind":"event_joins","value":5}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'events_5');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'speed_demon', 'Speed Demon', 'AUTO', 'BEHAVIORAL', false, NULL,
  'Closed in under 12 hours.', '{"kind":"fast_close_hours","value":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'speed_demon');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'perfect_week', 'Perfect Week', 'AUTO', 'BEHAVIORAL', false, NULL,
  '7 days of activity.', '{"kind":"streak_days","value":7}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'perfect_week');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'comeback_king', 'Comeback King', 'AUTO', 'BEHAVIORAL', true, NULL,
  'Returned after absence.', '{"kind":"hidden_manual"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'comeback_king');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'beta_tester', 'Beta Tester', 'ADMIN', 'META', false, NULL,
  'Early platform tester.', '{"kind":"admin_grant_only"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'beta_tester');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'mvp_quarter', 'MVP Quarter', 'ADMIN', 'META', false, NULL,
  'Top partner of the quarter.', '{"kind":"admin_grant_only"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'mvp_quarter');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'referral_chain', 'Referral Chain', 'AUTO', 'SOCIAL', false, NULL,
  '2-level network depth.', '{"kind":"network_depth","value":2}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'referral_chain');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'appreciation_received', 'Appreciated', 'AUTO', 'SOCIAL', false, NULL,
  '5 profile appreciations.', '{"kind":"appreciation_count","value":5}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'appreciation_received');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'content_creator', 'Content Creator', 'ADMIN', 'SOCIAL', false, NULL,
  'Featured content creator.', NULL
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'content_creator');

INSERT INTO "BadgeDefinition" (id, key, name, type, category, hidden, "iconKey", description, criteria)
SELECT gen_random_uuid()::text, 'verified_partner', 'Verified Partner', 'ADMIN', 'META', false, NULL,
  'Official verified partner.', NULL
WHERE NOT EXISTS (SELECT 1 FROM "BadgeDefinition" WHERE key = 'verified_partner');
