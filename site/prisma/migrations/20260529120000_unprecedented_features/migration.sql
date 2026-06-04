-- Unprecedented ASCEND features: oath, time capsule, vault, battles, mentorship, chronicles, memory

ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "oath" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "oathDate" TIMESTAMP(3);

ALTER TYPE "ChatRoomType" ADD VALUE IF NOT EXISTS 'MENTORSHIP';

ALTER TABLE "ChatRoom" ADD COLUMN IF NOT EXISTS "mentorUserId" TEXT;
ALTER TABLE "ChatRoom" ADD COLUMN IF NOT EXISTS "menteeUserId" TEXT;

CREATE TABLE IF NOT EXISTS "TimeCapsule" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "goals" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openAt" TIMESTAMP(3) NOT NULL,
  "openedAt" TIMESTAMP(3),
  "wasDelivered" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TimeCapsule_userId_key" ON "TimeCapsule"("userId");

DO $$ BEGIN
  ALTER TABLE "TimeCapsule" ADD CONSTRAINT "TimeCapsule_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "VaultItem" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "descAr" TEXT NOT NULL,
  "descEn" TEXT NOT NULL,
  "contentAr" TEXT NOT NULL,
  "contentEn" TEXT NOT NULL,
  "unlockCriteria" JSONB NOT NULL,
  "previewAr" TEXT,
  "previewEn" TEXT,
  "icon" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "VaultItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VaultItem_slug_key" ON "VaultItem"("slug");

CREATE TABLE IF NOT EXISTS "UserVaultUnlock" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vaultItemId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserVaultUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserVaultUnlock_userId_vaultItemId_key" ON "UserVaultUnlock"("userId", "vaultItemId");
CREATE INDEX IF NOT EXISTS "UserVaultUnlock_userId_idx" ON "UserVaultUnlock"("userId");

DO $$ BEGIN
  ALTER TABLE "UserVaultUnlock" ADD CONSTRAINT "UserVaultUnlock_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserVaultUnlock" ADD CONSTRAINT "UserVaultUnlock_vaultItemId_fkey"
    FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PartnerBattle" (
  "id" TEXT NOT NULL,
  "challengerId" TEXT NOT NULL,
  "challengedId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "metric" TEXT NOT NULL DEFAULT 'deals',
  "target" INTEGER NOT NULL DEFAULT 3,
  "stakesXp" INTEGER NOT NULL DEFAULT 500,
  "startedAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "winnerId" TEXT,
  "challengerProgress" INTEGER NOT NULL DEFAULT 0,
  "challengedProgress" INTEGER NOT NULL DEFAULT 0,
  "stakesDeducted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PartnerBattle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PartnerBattle_challengerId_status_idx" ON "PartnerBattle"("challengerId", "status");
CREATE INDEX IF NOT EXISTS "PartnerBattle_challengedId_status_idx" ON "PartnerBattle"("challengedId", "status");

DO $$ BEGIN
  ALTER TABLE "PartnerBattle" ADD CONSTRAINT "PartnerBattle_challengerId_fkey"
    FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PartnerBattle" ADD CONSTRAINT "PartnerBattle_challengedId_fkey"
    FOREIGN KEY ("challengedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PartnerBattle" ADD CONSTRAINT "PartnerBattle_winnerId_fkey"
    FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MentorOffer" (
  "id" TEXT NOT NULL,
  "mentorId" TEXT NOT NULL,
  "specialtyAr" TEXT NOT NULL,
  "specialtyEn" TEXT NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 30,
  "maxMentees" INTEGER NOT NULL DEFAULT 3,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "xpRewardPerMenteeDeal" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MentorOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MentorOffer_mentorId_key" ON "MentorOffer"("mentorId");

DO $$ BEGIN
  ALTER TABLE "MentorOffer" ADD CONSTRAINT "MentorOffer_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MentorshipSession" (
  "id" TEXT NOT NULL,
  "mentorId" TEXT NOT NULL,
  "menteeId" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "roomId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MentorshipSession_mentorId_menteeId_key" ON "MentorshipSession"("mentorId", "menteeId");
CREATE UNIQUE INDEX IF NOT EXISTS "MentorshipSession_roomId_key" ON "MentorshipSession"("roomId");
CREATE INDEX IF NOT EXISTS "MentorshipSession_menteeId_status_idx" ON "MentorshipSession"("menteeId", "status");

DO $$ BEGIN
  ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_menteeId_fkey"
    FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_offerId_fkey"
    FOREIGN KEY ("offerId") REFERENCES "MentorOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_roomId_fkey"
    FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "WeeklyChronicle" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "weekKey" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeeklyChronicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyChronicle_userId_weekKey_key" ON "WeeklyChronicle"("userId", "weekKey");
CREATE INDEX IF NOT EXISTS "WeeklyChronicle_userId_idx" ON "WeeklyChronicle"("userId");

DO $$ BEGIN
  ALTER TABLE "WeeklyChronicle" ADD CONSTRAINT "WeeklyChronicle_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PlatformMemoryDelivery" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "memoryKey" TEXT NOT NULL,
  "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformMemoryDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlatformMemoryDelivery_userId_memoryKey_key" ON "PlatformMemoryDelivery"("userId", "memoryKey");
CREATE INDEX IF NOT EXISTS "PlatformMemoryDelivery_userId_idx" ON "PlatformMemoryDelivery"("userId");

DO $$ BEGIN
  ALTER TABLE "PlatformMemoryDelivery" ADD CONSTRAINT "PlatformMemoryDelivery_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed vault items (idempotent by slug)
INSERT INTO "VaultItem" ("id", "slug", "titleAr", "titleEn", "descAr", "descEn", "contentAr", "contentEn", "unlockCriteria", "previewAr", "previewEn", "icon", "order", "isActive")
VALUES
  ('vault_deals_5', 'deals_5', 'سكريبت إغلاق الصفقات الكبيرة', 'Big Deal Close Script',
   'تقنيات إغلاق للصفقات ذات القيمة العالية', 'Closing techniques for high-value deals',
   E'## السكريبت\n\n1. **افتح بالقيمة** — لا بالسعر.\n2. **اعكس الاعتراض** — «فهمت أن التوقيت مهم. ماذا لو…»\n3. **اقفل بخطوة صغيرة** — موعد تجريبي أو عقد مرحلي.\n\nراجع كل صفقة مغلقة ودوّن الاعتراض الذي تغلبت عليه.',
   E'## Script\n\n1. **Lead with value** — not price.\n2. **Mirror the objection** — "I hear timing matters. What if…"\n3. **Close with a small step** — pilot or phased contract.\n\nReview each closed deal and note the objection you overcame.',
   '{"type":"deals","value":5}'::jsonb,
   'تقنية واحدة تحول أكبر اعتراض إلى موافقة…', 'One technique that turns the biggest objection into yes…',
   'deals', 1, true),
  ('vault_network_10', 'network_10', 'استراتيجية بناء شبكة 50 شريكاً', 'Network Build Strategy (50 partners)',
   'خطة إحالة منظمة على 90 يوماً', 'Structured referral plan over 90 days',
   E'## الاستراتيجية\n\n- **أسبوع 1–4:** 3 شركاء مباشرين — تدريب أسبوعي.\n- **أسبوع 5–8:** كل شريك يجلب 2 — راجع التقدم يوم الأحد.\n- **مكافأة:** شارة الشبكة عند 10 مباشرين.',
   E'## Strategy\n\n- **Weeks 1–4:** 3 direct partners — weekly coaching.\n- **Weeks 5–8:** each brings 2 — review every Sunday.\n- **Reward:** network badge at 10 direct.',
   '{"type":"direct_referrals","value":10}'::jsonb,
   'خطة 90 يوماً لشبكة تُغذّي الصفقات…', 'A 90-day plan for a deal-feeding network…',
   'network', 2, true),
  ('vault_level_elite', 'level_elite', 'خريطة المستثمرين والعملاء المؤسسيين', 'Enterprise Client Map',
   'قنوات الوصول للعملاء المؤسسيين', 'Channels to reach enterprise buyers',
   E'## الخريطة\n\n1. **قطاع الصحة** — مستشفيات + عيادات سلسلة.\n2. **التعليم** — جامعات ومراكز تدريب.\n3. **اللوجستيات** — شركات توصيل محلية.\n\nابدأ بقائمة 20 جهة في منطقتك هذا الأسبوع.',
   E'## Map\n\n1. **Healthcare** — hospitals + clinic chains.\n2. **Education** — universities and training centers.\n3. **Logistics** — local delivery firms.\n\nStart a list of 20 targets in your territory this week.',
   '{"type":"level_code","value":"elite"}'::jsonb,
   'قنوات لم تستكشفها بعد في منطقتك…', 'Channels you have not explored in your territory yet…',
   'map', 3, true),
  ('vault_streak_30', 'streak_30', 'نظام إدارة وقت المسوّق المتفرغ', 'Part-Time Marketer Time System',
   'جدول يومي 45 دقيقة', 'Daily 45-minute schedule',
   E'## النظام\n\n- **15 دقيقة:** متابعة عملاء محتملين.\n- **15 دقيقة:** محتوى أو رسالة شبكة.\n- **15 دقيقة:** صفقة واحدة — تحديث أو إغلاق.\n\nسلسلة 30 يوماً = عادة لا تُكسر.',
   E'## System\n\n- **15 min:** follow up leads.\n- **15 min:** content or network message.\n- **15 min:** one deal — update or close.\n\n30-day streak = unbreakable habit.',
   '{"type":"streak","value":30}'::jsonb,
   '45 دقيقة يومياً تغيّر معدل الإغلاق…', '45 minutes a day changes your close rate…',
   'streak', 4, true),
  ('vault_revenue_1k', 'revenue_1k', 'دليل التفاوض على العمولات', 'Commission Negotiation Guide',
   'كيف ترفع نسبتك بأدلة أداء', 'How to raise your split with performance proof',
   E'## الدليل\n\n1. اجمع **3 صفقات مغلقة** كدليل.\n2. قارن بمتوسط الشبكة.\n3. اطلب مراجعة مع الإدارة — مرة كل ربع سنة.',
   E'## Guide\n\n1. Gather **3 closed deals** as proof.\n2. Compare to network average.\n3. Request a review with admin — once per quarter.',
   '{"type":"revenue_cents","value":100000}'::jsonb,
   'تفاوض مبني على أرقام لا على أمل…', 'Negotiation built on numbers not hope…',
   'earnings', 5, true),
  ('vault_hall_member', 'hall_member', 'جلسة استراتيجية مع الفريق', 'Strategy Session with Team',
   'وصول حصري لقاعة الأساطير', 'Exclusive Hall of Legends access',
   E'## الجلسة\n\nتهانينا — أنت في **قاعة الأساطير**.\n\nتواصل مع الإدارة عبر المحادثة لحجز جلسة استراتيجية 30 دقيقة.',
   E'## Session\n\nCongratulations — you are in the **Hall of Legends**.\n\nContact admin via chat to book a 30-minute strategy session.',
   '{"type":"hall_member"}'::jsonb,
   'محتوى يُفتح لمن يصل للقمة فقط…', 'Content unlocked only at the summit…',
   'legends', 6, true)
ON CONFLICT ("slug") DO NOTHING;
