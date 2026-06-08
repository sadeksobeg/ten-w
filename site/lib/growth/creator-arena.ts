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

export async function ensureWeeklyChallenge(weekKey = currentWeekKey()) {
  const existing = await prisma.creatorChallenge.findUnique({ where: { weekKey } });
  if (existing) return existing;

  const { startsAt, endsAt } = weekBounds(weekKey);
  return prisma.creatorChallenge.create({
    data: {
      weekKey,
      titleAr: "صوّر دخول Cinema OS من البوت حتى التذكرة",
      titleEn: "Film Cinema OS from boot to ticket",
      titleFr: "Filmez Cinema OS du démarrage au billet",
      bodyAr:
        "سجّل رحلة كاملة في تجربة السينما — من شاشة الإقلاع حتى التذكرة الرقمية. ارفع رابط المنشور خلال 48 ساعة = +500 XP.",
      bodyEn:
        "Record the full cinema journey — boot screen through the digital ticket. Post your link within 48h for +500 XP.",
      bodyFr:
        "Enregistrez le parcours cinéma complet — du boot au billet. Publiez le lien sous 48h pour +500 XP.",
      xpReward: 500,
      active: true,
      startsAt,
      endsAt,
    },
  });
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

export async function submitCreatorPost(userId: string, postUrl: string) {
  const weekKey = currentWeekKey();
  await ensureWeeklyChallenge(weekKey);

  const beforeBoard = await creatorCupLeaderboard(20);
  const beforeRank = beforeBoard.findIndex((r) => r.userId === userId);

  const row = await prisma.creatorSubmission.upsert({
    where: { userId_weekKey: { userId, weekKey } },
    create: { userId, weekKey, postUrl, status: "pending" },
    update: { postUrl, status: "pending" },
  });

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

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((row, i) => ({ ...row, rank: i + 1 }));
}

export async function trackCreatorArenaVisit(opts: {
  path: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
  userId?: string | null;
}) {
  return prisma.creatorArenaVisit.create({
    data: {
      path: opts.path,
      utmSource: opts.utmSource ?? null,
      utmCampaign: opts.utmCampaign ?? null,
      userId: opts.userId ?? null,
    },
  });
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
    body: "تم تفعيل شارة صانع المحتوى — ادخل غرفة ASCEND Creator Arena.",
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

export { WEEK_MS };
