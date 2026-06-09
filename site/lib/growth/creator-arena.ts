import { CreatorWorkflowStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  compositeLeaderboard,
  getActiveLeaderboardSeason,
  WEEK_MS,
} from "@/lib/growth/leaderboard";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { createNotification } from "@/lib/growth/notify";
import {
  addUserToCreatorRoom,
  CONTENT_CREATOR_BADGE,
  userHasContentCreatorBadge,
} from "@/lib/growth/creator-program";
import { grantIfMissingBadge } from "@/lib/growth/creator-arena-badge";

export type CreatorPulseStats = {
  onlineMembers: number;
  activeChallenges: number;
  postsThisWeek: number;
};

export type CreatorStatusCard = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  publicSlug: string | null;
  status: CreatorWorkflowStatus;
};

export type CreatorCupRow = {
  userId: string;
  name: string | null;
  score: number;
  rank: number;
  submissions: number;
  consentGiven: boolean;
  cupScoreBonus: number;
};

export type CreatorChallengeView = {
  weekKey: string;
  title: string;
  body: string;
  xpReward: number;
  endsAt: string;
  hasSubmitted: boolean;
  submissionUrl: string | null;
  submissionStatus: string | null;
};

export function currentWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekBounds(weekKey: string): { startsAt: Date; endsAt: Date } {
  const [yearStr, wPart] = weekKey.split("-W");
  const year = Number(yearStr);
  const week = Number(wPart);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - day + 1 + (week - 1) * 7);
  const endsAt = new Date(monday);
  endsAt.setUTCDate(monday.getUTCDate() + 7);
  return { startsAt: monday, endsAt };
}

function challengeCopy(locale: string, row: {
  titleAr: string;
  titleEn: string;
  titleFr: string;
  bodyAr: string;
  bodyEn: string;
  bodyFr: string;
}) {
  if (locale === "ar") return { title: row.titleAr, body: row.bodyAr };
  if (locale === "fr" && row.titleFr) return { title: row.titleFr, body: row.bodyFr || row.bodyEn };
  return { title: row.titleEn, body: row.bodyEn };
}

export type CreatorSubmissionPreview = {
  id: string;
  userId: string;
  name: string;
  postUrl: string;
  platform: string | null;
  createdAt: string;
  status: string;
};

export type CreatorPublicProfile = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  publicSlug: string | null;
  levelCode: string;
  status: CreatorWorkflowStatus;
  totalSubmissions: number;
  battlesWon: number;
  battlesLost: number;
  cupScore: number;
  recentSubmissions: { postUrl: string; createdAt: string }[];
};

function detectPlatform(url: string): string | null {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  return null;
}

async function notifyCreatorsNewChallenge(weekKey: string) {
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const ids = await getCreatorLoungeParticipantIds();
  const challenge = await prisma.creatorChallenge.findUnique({ where: { weekKey } });
  if (!challenge) return;

  await Promise.all(
    ids.map((userId) =>
      createNotification(prisma, {
        userId,
        type: NotificationType.SYSTEM,
        title: "تحدي أسبوع جديد",
        body: challenge.titleAr,
        link: "/growth/creators",
        metadata: { kind: "creator_weekly_challenge", weekKey },
      }),
    ),
  );
}

const DEFAULT_WEEKLY_CHALLENGE = {
  titleAr: "انشر محتوى عن ASCEND هذا الأسبوع",
  titleEn: "Post ASCEND content this week",
  titleFr: "Publiez du contenu ASCEND cette semaine",
  bodyAr:
    "صوّر أو اكتب عن تجربة ASCEND — الترتيب، المعارك، أو غرفة الصنّاع. ارفع رابط المنشور خلال 48 ساعة = +500 XP.",
  bodyEn:
    "Film or write about ASCEND — leaderboard, battles, or the creator lounge. Post your link within 48h for +500 XP.",
  bodyFr:
    "Filmez ou écrivez sur ASCEND — classement, batailles ou lounge créateurs. Publiez le lien sous 48h pour +500 XP.",
  xpReward: 500,
} as const;

const CINEMA_CHALLENGE_MARKERS = /cinema|سينما|تذكرة|ticket/i;

function isStaleCinemaChallenge(row: {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
}) {
  const blob = `${row.titleAr} ${row.titleEn} ${row.bodyAr} ${row.bodyEn}`;
  return CINEMA_CHALLENGE_MARKERS.test(blob);
}

export async function ensureWeeklyChallenge(weekKey = currentWeekKey()) {
  const existing = await prisma.creatorChallenge.findUnique({ where: { weekKey } });
  if (existing) {
    if (isStaleCinemaChallenge(existing)) {
      return prisma.creatorChallenge.update({
        where: { weekKey },
        data: { ...DEFAULT_WEEKLY_CHALLENGE, active: true },
      });
    }
    return existing;
  }

  const { startsAt, endsAt } = weekBounds(weekKey);
  const created = await prisma.creatorChallenge.create({
    data: {
      weekKey,
      ...DEFAULT_WEEKLY_CHALLENGE,
      active: true,
      startsAt,
      endsAt,
    },
  });

  void notifyCreatorsNewChallenge(weekKey);
  void notifyCreatorsWeeklyDigest(weekKey);
  return created;
}

export async function ensureCreatorArenaProfile(userId: string, status?: CreatorWorkflowStatus) {
  return prisma.creatorArenaProfile.upsert({
    where: { userId },
    create: { userId, status: status ?? CreatorWorkflowStatus.JOINED },
    update: status ? { status } : {},
  });
}

export async function getCreatorPulse(): Promise<CreatorPulseStats> {
  const weekKey = currentWeekKey();
  const weekStart = weekBounds(weekKey).startsAt;

  const [roomMembers, challenge, postsThisWeek] = await Promise.all([
    prisma.chatRoomMember.count({
      where: { room: { slug: "content-creators" } },
    }),
    prisma.creatorChallenge.findFirst({ where: { active: true }, orderBy: { startsAt: "desc" } }),
    prisma.creatorSubmission.count({
      where: { createdAt: { gte: weekStart } },
    }),
  ]);

  return {
    onlineMembers: roomMembers,
    activeChallenges: challenge ? 1 : 0,
    postsThisWeek,
  };
}

export async function listCreatorStatusCards(): Promise<CreatorStatusCard[]> {
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: CONTENT_CREATOR_BADGE },
    select: { id: true },
  });
  if (!badge) return [];

  const holders = await prisma.userBadge.findMany({
    where: { badgeId: badge.id },
    orderBy: { grantedAt: "desc" },
    take: 24,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          publicSlug: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
          creatorArenaProfile: { select: { status: true } },
        },
      },
    },
  });

  return holders.map((h) => ({
    userId: h.user.id,
    name: resolveChatSenderName(h.user),
    avatarUrl: h.user.avatarUrl,
    publicSlug: h.user.publicSlug,
    status: h.user.creatorArenaProfile?.status ?? CreatorWorkflowStatus.JOINED,
  }));
}

export async function updateCreatorWorkflowStatus(
  userId: string,
  status: CreatorWorkflowStatus,
  updatedById?: string,
) {
  await ensureCreatorArenaProfile(userId, status);
  return prisma.creatorArenaProfile.update({
    where: { userId },
    data: { status, updatedById: updatedById ?? null },
  });
}

export async function getCreatorChallengeForUser(
  userId: string,
  locale: string,
): Promise<CreatorChallengeView | null> {
  const weekKey = currentWeekKey();
  const challenge = await ensureWeeklyChallenge(weekKey);
  const submission = await prisma.creatorSubmission.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  });
  const copy = challengeCopy(locale, challenge);

  return {
    weekKey,
    title: copy.title,
    body: copy.body,
    xpReward: challenge.xpReward,
    endsAt: challenge.endsAt.toISOString(),
    hasSubmitted: Boolean(submission),
    submissionUrl: submission?.postUrl ?? null,
    submissionStatus: submission?.status ?? null,
  };
}

export async function submitCreatorPost(
  userId: string,
  postUrl: string,
  platform?: string | null,
  description?: string | null,
) {
  const weekKey = currentWeekKey();
  await ensureWeeklyChallenge(weekKey);
  const resolvedPlatform = platform ?? detectPlatform(postUrl);

  const beforeBoard = await creatorCupLeaderboard(20);
  const beforeRank = beforeBoard.findIndex((r) => r.userId === userId);

  const existing = await prisma.creatorSubmission.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  });

  const row = await prisma.creatorSubmission.upsert({
    where: { userId_weekKey: { userId, weekKey } },
    create: {
      userId,
      weekKey,
      postUrl,
      platform: resolvedPlatform,
      description: description ?? null,
      status: "pending",
    },
    update: {
      postUrl,
      platform: resolvedPlatform,
      description: description ?? null,
      status: "pending",
    },
  });

  if (!existing) {
    await prisma.creatorChallenge.update({
      where: { weekKey },
      data: { totalSubmissions: { increment: 1 } },
    });
    await prisma.creatorArenaProfile.upsert({
      where: { userId },
      create: {
        userId,
        status: CreatorWorkflowStatus.SUBMITTED,
        totalSubmissions: 1,
        lastActiveAt: new Date(),
      },
      update: {
        totalSubmissions: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });
  } else {
    await prisma.creatorArenaProfile.upsert({
      where: { userId },
      create: { userId, lastActiveAt: new Date() },
      update: { lastActiveAt: new Date() },
    });
  }

  await updateCreatorWorkflowStatus(userId, CreatorWorkflowStatus.SUBMITTED);

  const afterBoard = await creatorCupLeaderboard(20);
  const afterRank = afterBoard.findIndex((r) => r.userId === userId);
  if (
    afterRank >= 0 &&
    (beforeRank < 0 || afterRank < beforeRank) &&
    afterRank < afterBoard.length - 1
  ) {
    const overtaken = afterBoard[afterRank + 1];
    const submitter = afterBoard[afterRank];
    if (overtaken && submitter && overtaken.userId !== userId) {
      await createNotification(prisma, {
        userId: overtaken.userId,
        type: NotificationType.SYSTEM,
        title: "Creator Cup",
        body: `${submitter.name ?? "صانع"} تجاوزك في ترتيب هذا الأسبوع — انشر منشوراً جديداً.`,
        link: "/growth/creators",
        metadata: { kind: "creator_cup_overtaken" },
      });
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const { postCreatorChannelMessage } = await import("@/lib/growth/chat-room-service");
    await postCreatorChannelMessage("creator-challenges", userId, "·", {
      kind: "CHALLENGE_SUBMIT",
      metadata: {
        platform: resolvedPlatform,
        url: postUrl,
        creatorName: user?.name ?? user?.email ?? "Creator",
      },
      skipPostCheck: true,
    });
  } catch {
    /* chat optional */
  }

  return row;
}

export async function creatorCupLeaderboard(limit = 10): Promise<CreatorCupRow[]> {
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const creatorIds = await getCreatorLoungeParticipantIds();
  if (creatorIds.length === 0) return [];

  const season = await getActiveLeaderboardSeason();
  const board = await compositeLeaderboard(season.windowMs, season, 200);
  const filtered = board.filter((r) => creatorIds.includes(r.userId));

  const weekKey = currentWeekKey();
  const weekStart = weekBounds(weekKey).startsAt;
  const submissionCounts = await prisma.creatorSubmission.groupBy({
    by: ["userId"],
    where: {
      userId: { in: creatorIds },
      createdAt: { gte: weekStart },
      status: { in: ["pending", "approved", "featured"] },
    },
    _count: { id: true },
  });
  const subMap = new Map(submissionCounts.map((s) => [s.userId, s._count.id]));

  const visitCounts = await prisma.creatorArenaVisit.groupBy({
    by: ["userId"],
    where: {
      userId: { in: creatorIds },
      createdAt: { gte: weekStart },
      utmSource: "creator",
    },
    _count: { id: true },
  });
  const visitMap = new Map(
    visitCounts.filter((v) => v.userId).map((v) => [v.userId!, v._count.id]),
  );

  const scored = filtered.map((r) => {
    const submissions = subMap.get(r.userId) ?? 0;
    const visits = visitMap.get(r.userId) ?? 0;
    const bonus = submissions * 75 + visits * 10;
    return {
      userId: r.userId,
      name: r.name,
      score: Math.round((r.score + bonus) * 10) / 10,
      submissions,
      rank: 0,
    };
  });

  const profileRows = await prisma.creatorArenaProfile.findMany({
    where: { userId: { in: creatorIds } },
    select: {
      userId: true,
      consentGiven: true,
      consentVersion: true,
      cupScoreBonus: true,
    },
  });
  const { hasActiveCreatorConsent } = await import("@/lib/growth/creator-consent");
  const profileMap = new Map(profileRows.map((r) => [r.userId, r]));

  const scoredWithBonus = scored.map((row) => {
    const profile = profileMap.get(row.userId);
    const adminBonus = profile?.cupScoreBonus ?? 0;
    return {
      ...row,
      score: Math.round((row.score + adminBonus) * 10) / 10,
      consentGiven: hasActiveCreatorConsent(profile),
      cupScoreBonus: adminBonus,
    };
  });

  scoredWithBonus.sort((a, b) => b.score - a.score);
  return scoredWithBonus.slice(0, limit).map((row, i) => ({
    ...row,
    rank: i + 1,
  }));
}

export async function trackCreatorArenaVisit(opts: {
  path: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
  userId?: string | null;
}) {
  if (opts.userId) {
    await prisma.creatorArenaProfile.upsert({
      where: { userId: opts.userId },
      create: { userId: opts.userId, lastActiveAt: new Date() },
      update: { lastActiveAt: new Date() },
    });
  }
  return prisma.creatorArenaVisit.create({
    data: {
      path: opts.path,
      utmSource: opts.utmSource ?? null,
      utmCampaign: opts.utmCampaign ?? null,
      userId: opts.userId ?? null,
    },
  });
}

export async function listRecentCreatorSubmissions(limit = 3): Promise<CreatorSubmissionPreview[]> {
  const weekKey = currentWeekKey();
  const challenge = await prisma.creatorChallenge.findUnique({ where: { weekKey } });
  const rows = await prisma.creatorSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: resolveChatSenderName(r.user),
    postUrl: r.postUrl,
    platform: r.platform,
    createdAt: r.createdAt.toISOString(),
    status: r.status,
  }));
}

export async function getFeaturedCreator(): Promise<{
  userId: string;
  name: string;
  avatarUrl: string | null;
  publicSlug: string | null;
  featuredCount: number;
  status: CreatorWorkflowStatus;
} | null> {
  const featured = await prisma.creatorArenaProfile.findFirst({
    where: { status: CreatorWorkflowStatus.FEATURED },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
          publicSlug: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!featured) return null;

  return {
    userId: featured.userId,
    name: resolveChatSenderName(featured.user),
    avatarUrl: featured.user.avatarUrl,
    publicSlug: featured.user.publicSlug,
    featuredCount: featured.featuredCount,
    status: featured.status,
  };
}

export async function getViewerCreatorProfile(userId: string) {
  const profile = await prisma.creatorArenaProfile.findUnique({ where: { userId } });
  return {
    status: profile?.status ?? CreatorWorkflowStatus.JOINED,
    milestones: profile?.milestones ?? [],
    totalSubmissions: profile?.totalSubmissions ?? 0,
    featuredCount: profile?.featuredCount ?? 0,
  };
}

export async function getCreatorPublicProfile(userId: string): Promise<CreatorPublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      publicSlug: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
      creatorArenaProfile: true,
      partnerProfile: { select: { currentLevel: { select: { code: true } } } },
    },
  });
  if (!user) return null;

  const [wins, losses, board, recent] = await Promise.all([
    prisma.partnerBattle.count({
      where: { winnerId: userId, metric: "creator_posts", status: "COMPLETED" },
    }),
    prisma.partnerBattle.count({
      where: {
        metric: "creator_posts",
        status: "COMPLETED",
        winnerId: { not: userId },
        OR: [{ challengerId: userId }, { challengedId: userId }],
      },
    }),
    creatorCupLeaderboard(50),
    prisma.creatorSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { postUrl: true, createdAt: true },
    }),
  ]);

  const cupRow = board.find((r) => r.userId === userId);

  return {
    userId: user.id,
    name: resolveChatSenderName(user),
    avatarUrl: user.avatarUrl,
    publicSlug: user.publicSlug,
    levelCode: user.partnerProfile?.currentLevel.code ?? "STARTER",
    status: user.creatorArenaProfile?.status ?? CreatorWorkflowStatus.JOINED,
    totalSubmissions: user.creatorArenaProfile?.totalSubmissions ?? 0,
    battlesWon: wins,
    battlesLost: losses,
    cupScore: cupRow?.score ?? 0,
    recentSubmissions: recent.map((r) => ({
      postUrl: r.postUrl,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function countActiveCreatorBattles(userId: string) {
  return prisma.partnerBattle.count({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      status: { in: ["PENDING", "ACTIVE"] },
      metric: "creator_posts",
    },
  });
}

export async function listCreatorBattleHistory(userId: string, limit = 5) {
  const rows = await prisma.partnerBattle.findMany({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      metric: "creator_posts",
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      challenger: {
        select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
      challenged: {
        select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
    },
  });

  return rows.map((b) => {
    const won = b.status === "COMPLETED" && b.winnerId === userId;
    const rival =
      b.challengerId === userId
        ? resolveChatSenderName(b.challenged)
        : resolveChatSenderName(b.challenger);
    return {
      id: b.id,
      opponentName: rival,
      outcome: won ? ("won" as const) : b.status === "COMPLETED" ? ("lost" as const) : ("pending" as const),
      endedAt: b.status === "COMPLETED" ? b.createdAt.toISOString() : null,
    };
  });
}

export async function getAdminCreatorStats() {
  const weekStart = weekBounds(currentWeekKey()).startsAt;
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const ids = await getCreatorLoungeParticipantIds();

  const [total, activeWeek, featured, pending] = await Promise.all([
    prisma.creatorArenaProfile.count(),
    prisma.creatorSubmission.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: weekStart }, userId: { in: ids } },
    }),
    prisma.creatorArenaProfile.count({ where: { status: CreatorWorkflowStatus.FEATURED } }),
    prisma.creatorSubmission.count({ where: { status: "pending" } }),
  ]);

  return {
    totalCreators: ids.length,
    activeThisWeek: activeWeek.length,
    featured,
    pendingSubmissions: pending,
  };
}

export async function listAllChallenges() {
  return prisma.creatorChallenge.findMany({ orderBy: { startsAt: "desc" }, take: 20 });
}

export async function listChallengeSubmissions(weekKey: string) {
  return prisma.creatorSubmission.findMany({
    where: { weekKey },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
  });
}

export async function listPendingCreatorSubmissions(limit = 50) {
  const rows = await prisma.creatorSubmission.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
  });

  return rows.map((s) => ({
    id: s.id,
    userId: s.user.id,
    userName: resolveChatSenderName(s.user),
    userEmail: s.user.email,
    weekKey: s.weekKey,
    postUrl: s.postUrl,
    platform: s.platform,
    adminRating: s.adminRating,
    status: s.status,
    isFeatured: s.isFeatured,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function listCreatorsMissingWeeklySubmission() {
  const weekKey = currentWeekKey();
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const ids = await getCreatorLoungeParticipantIds();
  if (ids.length === 0) return [];

  const submitted = await prisma.creatorSubmission.findMany({
    where: { weekKey, userId: { in: ids } },
    select: { userId: true },
  });
  const submittedSet = new Set(submitted.map((s) => s.userId));
  const missingIds = ids.filter((id) => !submittedSet.has(id));
  if (missingIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: missingIds } },
    select: {
      id: true,
      name: true,
      email: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
    },
    orderBy: { name: "asc" },
  });

  return users.map((u) => ({
    userId: u.id,
    name: resolveChatSenderName(u),
    email: u.email,
  }));
}

export async function getCreatorBattleCandidates(userId: string) {
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const participantIds = (await getCreatorLoungeParticipantIds()).filter((id) => id !== userId);
  if (participantIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: participantIds.slice(0, 12) } },
    select: {
      id: true,
      name: true,
      email: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
      partnerProfile: { select: { currentLevel: { select: { code: true } } } },
    },
  });

  return users.map((h) => {
    const name = resolveChatSenderName(h);
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? (parts[0]![0]! + parts[1]![0]!).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    return {
      userId: h.id,
      name,
      levelCode: h.partnerProfile?.currentLevel.code ?? "STARTER",
      initials,
    };
  });
}

export async function isCreatorBattleTarget(challengerId: string, challengedId: string) {
  if (challengerId === challengedId) return false;
  const { canAccessCreatorLounge } = await import("@/lib/growth/creator-program");
  const [a, b] = await Promise.all([
    canAccessCreatorLounge(challengerId),
    canAccessCreatorLounge(challengedId),
  ]);
  return a && b;
}

export async function countCreatorPostsSince(userId: string, since: Date) {
  return prisma.creatorSubmission.count({
    where: {
      userId,
      createdAt: { gte: since },
      status: { in: ["pending", "approved", "featured"] },
    },
  });
}

export async function linkInviteToPartner(userId: string, email: string, inviteSlug?: string) {
  if (!inviteSlug) return false;

  const invite = await prisma.inviteCard.findUnique({ where: { slug: inviteSlug } });
  if (!invite || !invite.accepted) return false;
  const { isCreatorProgramInvite } = await import("@/lib/growth/creator-program");
  if (!isCreatorProgramInvite(invite.tier)) return false;
  if (invite.linkedUserId && invite.linkedUserId !== userId) return false;

  const emailMatch =
    !invite.inviteeEmail || invite.inviteeEmail.toLowerCase() === email.toLowerCase();

  if (!emailMatch) return false;

  const { grantCreatorLoungeAccess } = await import("@/lib/growth/creator-program");
  await grantIfMissingBadge(userId, CONTENT_CREATOR_BADGE);
  await grantCreatorLoungeAccess(userId, { notify: false });

  await prisma.inviteCard.update({
    where: { id: invite.id },
    data: { linkedUserId: userId, inviteeEmail: email },
  });

  await createNotification(prisma, {
    userId,
    type: NotificationType.SYSTEM,
    title: "مرحباً بك في غرفة الصنّاع",
    body: "تم تفعيل شارة صانع المحتوى — مرحباً بك في Creator Hub.",
    link: "/growth/creators",
  });

  return true;
}

export async function postsCountSinceWeekStart() {
  const weekStart = weekBounds(currentWeekKey()).startsAt;
  return prisma.creatorSubmission.count({ where: { createdAt: { gte: weekStart } } });
}

export async function creatorBadgeUserIds(): Promise<string[]> {
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: CONTENT_CREATOR_BADGE },
    select: { id: true },
  });
  if (!badge) return [];
  const rows = await prisma.userBadge.findMany({
    where: { badgeId: badge.id },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

export async function notifyCreatorRankOvertake(userId: string, locale: string) {
  const board = await creatorCupLeaderboard(20);
  const myIdx = board.findIndex((r) => r.userId === userId);
  if (myIdx < 0 || myIdx === 0) return;

  const ahead = board[myIdx - 1];
  if (!ahead) return;

  const titles = {
    ar: "تحدٍّ في Creator Cup",
    en: "Creator Cup update",
    fr: "Mise à jour Creator Cup",
  };
  const bodies = {
    ar: `${ahead.name ?? "صانع"} يتقدّم عليك — ارفع منشوراً جديداً اليوم.`,
    en: `${ahead.name ?? "A creator"} is ahead — post fresh content today.`,
    fr: `${ahead.name ?? "Un créateur"} vous dépasse — publiez aujourd'hui.`,
  };

  await createNotification(prisma, {
    userId,
    type: NotificationType.SYSTEM,
    title: titles[locale as keyof typeof titles] ?? titles.en,
    body: bodies[locale as keyof typeof bodies] ?? bodies.en,
    link: "/growth/creators",
    metadata: { kind: "creator_cup_overtake" },
  });
}

export type CreatorDashboardMetrics = {
  weekSubmissions: number;
  cupScore: number;
  cupRank: number | null;
  utmClicks: number;
  utmRegistrations: number;
  streakWeeks: number;
  weekPointsDelta: number;
};

export type CreatorDirectoryEntry = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  publicSlug: string | null;
  status: CreatorWorkflowStatus;
  levelCode: string;
  submissions: number;
  cupRank: number | null;
  cupScore: number;
  specialty: string[];
  consentGiven: boolean;
};

export type CreatorAnalyticsPoint = {
  weekKey: string;
  submissions: number;
  topSubmissions: number;
};

export async function getCreatorDashboardMetrics(userId: string): Promise<CreatorDashboardMetrics> {
  const weekKey = currentWeekKey();
  const weekStart = weekBounds(weekKey).startsAt;
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

  const [weekSubmissions, cupRows, visits, prevVisits, streak, deals] = await Promise.all([
    prisma.creatorSubmission.count({
      where: { userId, createdAt: { gte: weekStart } },
    }),
    creatorCupLeaderboard(50),
    prisma.creatorArenaVisit.count({
      where: { userId, createdAt: { gte: weekStart } },
    }),
    prisma.creatorArenaVisit.count({
      where: { userId, createdAt: { gte: prevWeekStart, lt: weekStart } },
    }),
    prisma.userStreak.findUnique({ where: { userId }, select: { currentStreak: true } }),
    prisma.deal.count({
      where: {
        partnerId: userId,
        createdAt: { gte: weekStart },
        status: { in: ["PENDING", "CLOSED"] },
      },
    }),
  ]);

  const myRow = cupRows.find((r) => r.userId === userId);
  return {
    weekSubmissions,
    cupScore: myRow?.score ?? 0,
    cupRank: myRow?.rank ?? null,
    utmClicks: visits,
    utmRegistrations: deals,
    streakWeeks: streak?.currentStreak ?? 0,
    weekPointsDelta: visits - prevVisits,
  };
}

export async function getCreatorUtmStats(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const rows = await prisma.creatorArenaVisit.groupBy({
    by: ["utmSource"],
    where: { userId, createdAt: { gte: since } },
    _count: { id: true },
  });
  return rows.map((r) => ({
    platform: r.utmSource ?? "direct",
    clicks: r._count.id,
    registrations: 0,
    conversionPct: 0,
  }));
}

export async function listCreatorDirectory(): Promise<CreatorDirectoryEntry[]> {
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const ids = await getCreatorLoungeParticipantIds();
  if (ids.length === 0) return [];

  const [users, cupRows] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        publicSlug: true,
        isVerifiedOfficial: true,
        officialDisplayName: true,
        creatorArenaProfile: {
          select: {
            status: true,
            specialty: true,
            totalSubmissions: true,
            consentGiven: true,
            consentVersion: true,
          },
        },
        partnerProfile: { select: { currentLevel: { select: { code: true } } } },
      },
    }),
    creatorCupLeaderboard(100),
  ]);

  const { hasActiveCreatorConsent } = await import("@/lib/growth/creator-consent");
  const cupMap = new Map(cupRows.map((r) => [r.userId, r]));
  return users.map((u) => {
    const cup = cupMap.get(u.id);
    const profile = u.creatorArenaProfile;
    return {
      userId: u.id,
      name: resolveChatSenderName(u),
      avatarUrl: u.avatarUrl,
      publicSlug: u.publicSlug,
      status: profile?.status ?? CreatorWorkflowStatus.JOINED,
      levelCode: u.partnerProfile?.currentLevel.code ?? "STARTER",
      submissions: profile?.totalSubmissions ?? 0,
      cupRank: cup?.rank ?? null,
      cupScore: cup?.score ?? 0,
      specialty: profile?.specialty ?? [],
      consentGiven: hasActiveCreatorConsent(profile),
    };
  });
}

export async function getCreatorAnalyticsSeries(userId: string): Promise<CreatorAnalyticsPoint[]> {
  const points: CreatorAnalyticsPoint[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = currentWeekKey(d);
    const start = weekBounds(wk).startsAt;
    const end = weekBounds(wk).endsAt;
    const [mine, top] = await Promise.all([
      prisma.creatorSubmission.count({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      prisma.creatorSubmission.count({ where: { createdAt: { gte: start, lt: end } } }),
    ]);
    points.push({ weekKey: wk, submissions: mine, topSubmissions: top });
  }
  return points;
}

export async function listWeekSubmissions(weekKey: string) {
  const rows = await prisma.creatorSubmission.findMany({
    where: { weekKey },
    orderBy: [{ adminRating: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
  });
  return rows.map((s) => ({
    id: s.id,
    userId: s.user.id,
    name: resolveChatSenderName(s.user),
    postUrl: s.postUrl,
    platform: s.platform,
    adminRating: s.adminRating,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function getActiveCreatorBattle(userId: string) {
  return prisma.partnerBattle.findFirst({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      status: { in: ["PENDING", "ACTIVE"] },
      metric: "creator_posts",
    },
    include: {
      challenger: {
        select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
      challenged: {
        select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
    },
  });
}

export async function listPendingBattleInvites(userId: string) {
  const rows = await prisma.partnerBattle.findMany({
    where: { challengedId: userId, status: "PENDING", metric: "creator_posts" },
    orderBy: { createdAt: "desc" },
    include: {
      challenger: {
        select: { id: true, name: true, email: true, avatarUrl: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
    },
  });
  return rows.map((b) => ({
    id: b.id,
    challengerName: resolveChatSenderName(b.challenger),
    stakesXp: b.stakesXp,
    target: b.target,
  }));
}

export type CreatorWeekStreakData = {
  consecutiveWeeks: number;
  weekSlots: boolean[];
};

export async function getCreatorWeekStreak(userId: string): Promise<CreatorWeekStreakData> {
  const slots: boolean[] = [];
  let consecutive = 0;
  let counting = true;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    const wk = currentWeekKey(d);
    const count = await prisma.creatorSubmission.count({
      where: { userId, weekKey: wk },
    });
    const active = count > 0;
    slots.unshift(active);
    if (counting) {
      if (active) consecutive += 1;
      else counting = false;
    }
  }
  return { consecutiveWeeks: consecutive, weekSlots: slots };
}

export async function getChallengeSubmissionCount(weekKey: string): Promise<number> {
  return prisma.creatorSubmission.count({ where: { weekKey } });
}

export async function getCreatorUtmWeeklySeries(userId: string) {
  const points: { label: string; clicks: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    const wk = currentWeekKey(d);
    const { startsAt, endsAt } = weekBounds(wk);
    const clicks = await prisma.creatorArenaVisit.count({
      where: { userId, createdAt: { gte: startsAt, lt: endsAt } },
    });
    points.push({ label: wk.slice(5), clicks });
  }
  return points;
}

export type CreatorReferralRow = {
  id: string;
  label: string;
  amountCents: number;
  createdAt: string;
};

export async function getCreatorReferralProof(userId: string): Promise<{
  rows: CreatorReferralRow[];
  totalCents: number;
}> {
  const rows = await prisma.commissionLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      deal: {
        select: {
          clientLabel: true,
          product: { select: { name: true } },
        },
      },
    },
  });
  const mapped = rows.map((r) => ({
    id: r.id,
    label: r.deal?.product?.name ?? r.deal?.clientLabel ?? "Commission",
    amountCents: r.amountCents,
    createdAt: r.createdAt.toISOString(),
  }));
  const totalCents = rows.reduce((s, r) => s + r.amountCents, 0);
  return { rows: mapped, totalCents };
}

export async function getCreatorAnalyticsBenchmarks() {
  const weekStart = weekBounds(currentWeekKey()).startsAt;
  const creators = await import("@/lib/growth/creator-program").then((m) =>
    m.getCreatorLoungeParticipantIds(),
  );
  if (creators.length === 0) {
    return { avgSubmissions: 0, avgClicks: 0 };
  }
  const [subs, clicks] = await Promise.all([
    prisma.creatorSubmission.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: weekStart }, userId: { in: creators } },
      _count: { id: true },
    }),
    prisma.creatorArenaVisit.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: weekStart }, userId: { in: creators } },
      _count: { id: true },
    }),
  ]);
  const avgSubmissions =
    subs.reduce((s, r) => s + r._count.id, 0) / Math.max(creators.length, 1);
  const avgClicks =
    clicks.reduce((s, r) => s + r._count.id, 0) / Math.max(creators.length, 1);
  return { avgSubmissions, avgClicks };
}

async function notifyCreatorsWeeklyDigest(weekKey: string) {
  const { getCreatorLoungeParticipantIds } = await import("@/lib/growth/creator-program");
  const ids = await getCreatorLoungeParticipantIds();
  const prev = new Date(weekBounds(weekKey).startsAt);
  prev.setUTCDate(prev.getUTCDate() - 7);
  const prevWeekKey = currentWeekKey(prev);

  await Promise.all(
    ids.map(async (userId) => {
      const subs = await prisma.creatorSubmission.count({
        where: { userId, weekKey: prevWeekKey },
      });
      const rank = (await creatorCupLeaderboard(50)).find((r) => r.userId === userId)?.rank;
      if (subs > 0) {
        await createNotification(prisma, {
          userId,
          type: NotificationType.SYSTEM,
          title: "أسبوعك الماضي",
          body: `${subs} منشور · ترتيب ${rank ? `#${rank}` : "—"}`,
          link: "/growth/creators",
          metadata: { kind: "creator_weekly_digest" },
        });
      } else {
        await createNotification(prisma, {
          userId,
          type: NotificationType.SYSTEM,
          title: "نفتقدك",
          body: "لم نرَك الأسبوع الماضي — التحدي الجديد بانتظارك.",
          link: "/growth/creators",
          metadata: { kind: "creator_reengage" },
        });
      }
    }),
  );
}

export { WEEK_MS };
