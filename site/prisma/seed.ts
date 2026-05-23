import {
  BadgeCategory,
  EventStatus,
  NotificationType,
  Prisma,
  PrismaClient,
  UserRole,
  BadgeType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomReferralCode();
    const exists = await prisma.partnerProfile.findUnique({
      where: { referralCode: code },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate referral code");
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && process.env.FORCE_GROWTH_SEED !== "1") {
    console.error(
      `[seed] ABORT: database already has ${existingUsers} user(s). ` +
        "Seed wipes all Growth data. Use FORCE_GROWTH_SEED=1 only on a dev reset.",
    );
    return;
  }

  await prisma.eventNotification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventMilestone.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.growthEvent.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.leaderboardGrantLog.deleteMany();
  await prisma.leaderboardRewardRule.deleteMany();
  await prisma.partnerCommissionOverride.deleteMany();
  await prisma.userMissionDay.deleteMany();
  await prisma.missionDefinition.deleteMany();
  await prisma.commissionTierConfig.deleteMany();
  await prisma.commissionLedger.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.badgeDefinition.deleteMany();
  await prisma.product.deleteMany();
  await prisma.levelDefinition.deleteMany();

  await prisma.commissionTierConfig.create({
    data: {
      id: "default",
      tier1Bps: 10_000,
      tier2Bps: 1_000,
      tier3Bps: 500,
    },
  });

  const levels = await prisma.$transaction([
    prisma.levelDefinition.create({
      data: {
        order: 1,
        code: "starter",
        name: "Starter",
        minClosedDeals: 0,
        minXp: 0,
        salaryUsd: null,
        perksJson: { tag: "Access" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 2,
        code: "hunter",
        name: "Hunter",
        minClosedDeals: 5,
        minXp: 500,
        salaryUsd: null,
        perksJson: { tag: "Badge unlock" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 3,
        code: "closer",
        name: "Closer",
        minClosedDeals: 10,
        minXp: 1500,
        salaryUsd: 100,
        perksJson: { tag: "$100 / mo stipend (configured)" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 4,
        code: "pro",
        name: "Pro",
        minClosedDeals: 20,
        minXp: 3600,
        salaryUsd: 200,
        perksJson: { tag: "$200 / mo stipend (configured)" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 5,
        code: "elite",
        name: "Elite",
        minClosedDeals: 40,
        minXp: 8000,
        salaryUsd: null,
        perksJson: { tag: "Bonus + higher split (configured)" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 6,
        code: "titan",
        name: "Titan",
        minClosedDeals: 80,
        minXp: 18000,
        salaryUsd: null,
        perksJson: { tag: "Double commission window (configured)" },
      },
    }),
    prisma.levelDefinition.create({
      data: {
        order: 7,
        code: "legend",
        name: "Legend",
        minClosedDeals: 150,
        minXp: 50000,
        salaryUsd: null,
        perksJson: { tag: "Near-passive income track (configured)" },
      },
    }),
  ]);

  const starter = levels[0]!;

  const badgeDefs: Array<{
    key: string;
    name: string;
    type: BadgeType;
    category?: BadgeCategory;
    hidden?: boolean;
    iconKey?: string;
    description?: string;
    criteria?: Record<string, unknown>;
  }> = [
    {
      key: "first_deal",
      name: "First Deal",
      type: BadgeType.AUTO,
      category: BadgeCategory.FINANCIAL,
      description: "Closed your first deal.",
      criteria: { kind: "min_closed_deals", value: 1 },
    },
    {
      key: "deals_5",
      name: "5 Deals Closed",
      type: BadgeType.AUTO,
      category: BadgeCategory.FINANCIAL,
      description: "Closed 5 deals.",
      criteria: { kind: "min_closed_deals", value: 5 },
    },
    {
      key: "deals_10",
      name: "10 Deals Milestone",
      type: BadgeType.AUTO,
      category: BadgeCategory.FINANCIAL,
      description: "Closed 10 deals.",
      criteria: { kind: "min_closed_deals", value: 10 },
    },
    {
      key: "first_referral",
      name: "First Referral",
      type: BadgeType.AUTO,
      category: BadgeCategory.SOCIAL,
      description: "Recruited your first partner.",
      criteria: { kind: "min_downlines", value: 1 },
    },
    {
      key: "top_performer",
      name: "Top Performer",
      type: BadgeType.AUTO,
      category: BadgeCategory.SOCIAL,
      description: "Weekly leaderboard winner (manual / cron).",
      criteria: { kind: "manual_or_cron" },
    },
    {
      key: "ai_seller",
      name: "AI Seller",
      type: BadgeType.AUTO,
      category: BadgeCategory.BEHAVIORAL,
      description: "Engaged marketing kit materials repeatedly.",
      criteria: { kind: "marketing_kit_hits", value: 3 },
    },
    {
      key: "fast_closer",
      name: "Fast Closer",
      type: BadgeType.AUTO,
      category: BadgeCategory.BEHAVIORAL,
      description: "Closed a deal within 24 hours of opening.",
      criteria: { kind: "fast_close_hours", value: 24 },
    },
    {
      key: "network_builder",
      name: "Network Builder",
      type: BadgeType.AUTO,
      category: BadgeCategory.SOCIAL,
      description: "3+ partners under you.",
      criteria: { kind: "min_downlines", value: 3 },
    },
    {
      key: "elite_pulse",
      name: "Elite Pulse",
      type: BadgeType.AUTO,
      category: BadgeCategory.META,
      hidden: true,
      iconKey: "pulse",
      description: "Hidden badge — awarded for exceptional streaks.",
      criteria: { kind: "hidden_manual" },
    },
    {
      key: "night_owl",
      name: "Night Owl",
      type: BadgeType.AUTO,
      category: BadgeCategory.BEHAVIORAL,
      hidden: true,
      description: "Checked in after midnight UTC.",
      criteria: { kind: "night_checkin" },
    },
    {
      key: "triple_close_day",
      name: "Hat Trick",
      type: BadgeType.AUTO,
      category: BadgeCategory.FINANCIAL,
      description: "Closed 3 deals in one day.",
      criteria: { kind: "closes_same_day", value: 3 },
    },
    {
      key: "revenue_10k",
      name: "Revenue Milestone",
      type: BadgeType.AUTO,
      category: BadgeCategory.FINANCIAL,
      description: "$10k+ commission earned.",
      criteria: { kind: "commission_cents", value: 1_000_000 },
    },
    {
      key: "trusted_partner",
      name: "Trusted Partner",
      type: BadgeType.ADMIN,
      category: BadgeCategory.META,
      description: "Awarded by admin.",
    },
    {
      key: "vip_seller",
      name: "VIP Seller",
      type: BadgeType.ADMIN,
      category: BadgeCategory.FINANCIAL,
      description: "Awarded by admin.",
    },
    {
      key: "strategic_agent",
      name: "Strategic Agent",
      type: BadgeType.ADMIN,
      category: BadgeCategory.BEHAVIORAL,
      description: "Awarded by admin.",
    },
    {
      key: "content_creator",
      name: "Content Creator",
      type: BadgeType.ADMIN,
      category: BadgeCategory.SOCIAL,
      description: "Featured content creator — shown in event chat.",
    },
    {
      key: "verified_partner",
      name: "Verified Partner",
      type: BadgeType.ADMIN,
      category: BadgeCategory.META,
      description: "Official verified partner badge.",
    },
  ];

  for (const b of badgeDefs) {
    await prisma.badgeDefinition.create({
      data: {
        key: b.key,
        name: b.name,
        type: b.type,
        category: b.category ?? BadgeCategory.META,
        hidden: b.hidden ?? false,
        iconKey: b.iconKey ?? null,
        description: b.description ?? null,
        criteria: (b.criteria ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  await prisma.missionDefinition.createMany({
    data: [
      {
        key: "daily_close_one",
        title: "Close 1 deal today",
        xpReward: 50,
        criteria: { type: "close_deal", count: 1 },
        sortOrder: 0,
      },
      {
        key: "daily_two_leads",
        title: "Add 2 leads today",
        xpReward: 20,
        criteria: { type: "add_lead", count: 2 },
        sortOrder: 1,
      },
      {
        key: "daily_referral",
        title: "Referral signed up today",
        xpReward: 100,
        criteria: { type: "referral", count: 1 },
        sortOrder: 2,
      },
      {
        key: "daily_join_event",
        title: "Join an event today",
        xpReward: 40,
        criteria: { type: "join_event", count: 1 },
        sortOrder: 3,
      },
    ],
  });

  await prisma.leaderboardRewardRule.create({
    data: {
      name: "Monthly #1 cash bonus",
      windowMs: BigInt(30 * 24 * 60 * 60 * 1000),
      rankMin: 1,
      rankMax: 1,
      bonusCents: 50_000,
      active: true,
    },
  });

  const kit = (slug: string) => ({
    version: 2,
    icp: {
      label:
        slug === "clinic-system"
          ? "عيادات خاصة تبحث عن تنظيم المواعيد وتحسين تجربة المريض"
          : "شركات تحتاج تسليم رقمي واضح وقابل للقياس",
      businessType: slug === "clinic-system" ? "الرعاية الصحية" : "خدمات رقمية / أعمال",
      teamSize: "5 إلى 80 موظف",
      ageRange: "أعمار صانع القرار 30–55",
    },
    painPoints: [
      "تأخير في المتابعة أو عدم وضوح المسار للعميل",
      "فوضى في التواصل بين القنوات",
      "ضياع فرص بسبب غياب عملية متابعة ثابتة",
    ],
    audience: [
      slug === "clinic-system"
        ? "العيادات الخاصة والأطباء المستقلون"
        : "شركات تريد تنفيذًا رقميًا احترافيًا بنتائج واضحة",
    ],
    pain: [
      "ضعف التنظيم",
      "هدر الوقت في التنسيق",
      "متابعات غير متسقة",
    ],
    solution: [
      "أتمتة التواصل والردود الأولية",
      "مسار عمل منظم مع تذكيرات",
      "لوحة تشغيل ومؤشرات متابعة",
    ],
    scripts: {
      direct:
        slug === "clinic-system"
          ? "هل تعانون من ضغط المواعيد؟ نقدر ننظم دخول الحالات عبر مسار واضح وسريع ونقلل الفوضى اليومية."
          : "إذا المشكلة في وضوح التنفيذ، نشتغل بخطة مراحل واضحة ومؤشرات قياس أسبوعية.",
      consultative:
        "ما الذي سيتغير في التشغيل لو أصبح كل عميل يسير في مسار واضح من أول تواصل حتى الإغلاق؟",
      whatsapp:
        "أهلاً {name}، نساعدكم في تحويل التواصل اليومي لمسار منظم يرفع الكفاءة ويقلل الضياع. مناسب أرسل مثال سريع؟",
      call: "ابدأ بالنتيجة المطلوبة، اسأل عن نقطة التعطّل الحالية، ثم اقترح خطوة تالية واضحة بتاريخ.",
    },
    objections: [
      {
        quote: "لدينا نظام بالفعل.",
        response: "ممتاز، نحن لا نهدم الموجود بل نغلق الفجوة بين النظام والتواصل الفعلي مع العميل.",
      },
      {
        quote: "ليس هذا الربع.",
        response: "مفهوم. نقدر نبدأ بخطوة صغيرة تثبت الأثر، ثم تتوسعوا بثقة في الربع القادم.",
      },
    ],
    script:
      slug === "clinic-system"
        ? "نرتب رحلة المريض من أول رسالة حتى الموعد النهائي بطريقة واضحة تقلل الضغط على فريق الاستقبال."
        : "نحوّل التنفيذ الرقمي إلى مسار عمل واضح بمراحل ومؤشرات أداء قابلة للقياس.",
    media: {
      videoUrl: "",
      posts: [] as string[],
    },
  });

  await prisma.product.createMany({
    data: [
      {
        slug: "clinic-system",
        name: "عقد العيادات",
        priceCents: 120_00,
        commissionBaseCents: 40_00,
        marketingKit: kit("clinic-system"),
        active: true,
      },
      {
        slug: "visual-identity",
        name: "هوية بصرية",
        priceCents: 300_00,
        commissionBaseCents: 100_00,
        marketingKit: kit("visual-identity"),
        active: true,
      },
      {
        slug: "website",
        name: "عقد الموقع",
        priceCents: 4500_00,
        commissionBaseCents: 500_00,
        marketingKit: kit("website"),
        active: true,
      },
      {
        slug: "mobile-app",
        name: "تطبيق الموبايل",
        priceCents: 9500_00,
        commissionBaseCents: 1000_00,
        marketingKit: kit("mobile-app"),
        active: true,
      },
    ],
  });

  const adminPassword =
    process.env.GROWTH_ADMIN_PASSWORD ?? "ChangeMeAdmin!123";
  const demoPassword =
    process.env.GROWTH_DEMO_PASSWORD ?? "ChangeMePartner!123";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const demoHash = await bcrypt.hash(demoPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@tenegta.local",
      passwordHash: adminHash,
      name: "Sadek Al-Etr Admin",
      phone: "+966500000000",
      publicSlug: "sadek-admin",
      role: UserRole.ADMIN,
    },
  });

  const demo = await prisma.user.create({
    data: {
      email: "partner@tenegta.local",
      passwordHash: demoHash,
      name: "Demo Partner",
      phone: "+966511111111",
      publicSlug: "demo-partner",
      bio: "شريك تجريبي لعرض قدرات محرك النمو.",
      role: UserRole.PARTNER,
    },
  });

  await prisma.partnerProfile.create({
    data: {
      userId: demo.id,
      referralCode: await uniqueReferralCode(),
      parentUserId: null,
      currentLevelId: starter.id,
      displayTitle: "Elite Partner",
      socialLinks: { whatsapp: "+966511111111", linkedin: "https://linkedin.com" },
      showcasedBadges: ["first_deal", "deals_5"],
    },
  });

  const sampleEvent = await prisma.growthEvent.create({
    data: {
      slug: "spring-challenge-2026",
      title: "تحدي الربيع 2026",
      description: "فعالية تجريبية لاختبار نظام المراحل والنقاط.",
      rules: "## القواعد\n- التزم بأخلاقيات العلامة\n- **لا وعود مضللة** للعملاء",
      startAt: new Date(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxParticipants: 50,
      status: EventStatus.PUBLISHED,
      createdById: admin.id,
      milestones: {
        create: [
          { title: "بداية قوية", order: 0, requiredProgress: 25, xpReward: 50 },
          { title: "منتصف الطريق", order: 1, requiredProgress: 50, xpReward: 100 },
          { title: "خط النهاية", order: 2, requiredProgress: 100, xpReward: 200 },
        ],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demo.id,
        type: NotificationType.EVENT_INVITE,
        title: `فعالية جديدة: ${sampleEvent.title}`,
        body: sampleEvent.description.slice(0, 120),
        link: `/growth/events/${sampleEvent.slug}`,
      },
      {
        userId: demo.id,
        type: NotificationType.SYSTEM,
        title: "مرحباً في Growth Engine",
        body: "استكشف لوحة التحكم، الفعاليات، والحزمة التسويقية.",
        link: "/growth",
      },
    ],
  });

  // eslint-disable-next-line no-console -- seed script
  console.log("Seeded levels, products, badges, tier config.");
  // eslint-disable-next-line no-console -- seed script
  console.log("Admin:", admin.email, "(set GROWTH_ADMIN_PASSWORD in prod)");
  // eslint-disable-next-line no-console -- seed script
  console.log("Demo partner:", demo.email, "(set GROWTH_DEMO_PASSWORD in prod)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console -- seed script
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
