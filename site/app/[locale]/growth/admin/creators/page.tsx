import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import {
  AdminCreatorGroupClient,
  type CreatorAdminPartner,
} from "@/components/growth/admin/AdminCreatorGroupClient";
import type {
  CreatorAdminChallenge,
  CreatorAdminChallengeSubmission,
  CreatorAdminSubmission,
} from "@/components/growth/admin/creator-admin-types";
import {
  ensureCreatorRoom,
  listContentCreatorPartners,
  listCreatorRoomMembers,
} from "@/lib/growth/creator-program";
import {
  creatorCupLeaderboard,
  getAdminCreatorStats,
  listAllChallenges,
  listChallengeSubmissions,
  listCreatorsMissingWeeklySubmission,
  listPendingCreatorSubmissions,
} from "@/lib/growth/creator-arena";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminCreatorsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/growth/sign-in`);
  }

  await ensureCreatorRoom();

  const [allPartners, badgeRows, roomMembers, stats, challengeRows, cupLeaderboard, pendingRows, missingThisWeek] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.PARTNER, partnerProfile: { isNot: null } },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          creatorArenaProfile: {
            select: {
              status: true,
              notes: true,
              totalSubmissions: true,
              featuredCount: true,
              milestones: true,
            },
          },
        },
      }),
      listContentCreatorPartners(),
      listCreatorRoomMembers(),
      getAdminCreatorStats(),
      listAllChallenges(),
      creatorCupLeaderboard(20),
      listPendingCreatorSubmissions(),
      listCreatorsMissingWeeklySubmission(),
    ]);

  const partnerIds = allPartners.map((u) => u.id);
  const weekKeys = challengeRows.map((c) => c.weekKey);

  const [submissionRows, ...challengeSubmissionGroups] = await Promise.all([
    prisma.creatorSubmission.findMany({
      where: { userId: { in: partnerIds } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        userId: true,
        weekKey: true,
        postUrl: true,
        platform: true,
        adminRating: true,
        status: true,
        isFeatured: true,
        createdAt: true,
      },
    }),
    ...weekKeys.map((weekKey) => listChallengeSubmissions(weekKey)),
  ]);

  const badgeMap = new Map(
    badgeRows.map((r) => [r.user.id, { grantedAt: r.grantedAt.toISOString() }]),
  );
  const roomSet = new Set(roomMembers.map((m) => m.userId));
  const cupScoreMap = new Map(cupLeaderboard.map((r) => [r.userId, r.score]));

  const submissionsByUser = new Map<string, CreatorAdminSubmission[]>();
  for (const row of submissionRows) {
    const list = submissionsByUser.get(row.userId) ?? [];
    list.push({
      id: row.id,
      weekKey: row.weekKey,
      postUrl: row.postUrl,
      platform: row.platform,
      adminRating: row.adminRating,
      status: row.status,
      isFeatured: row.isFeatured,
      createdAt: row.createdAt.toISOString(),
    });
    submissionsByUser.set(row.userId, list);
  }

  const submissionsByWeek: Record<string, CreatorAdminChallengeSubmission[]> = {};
  weekKeys.forEach((weekKey, index) => {
    const rows = challengeSubmissionGroups[index] ?? [];
    submissionsByWeek[weekKey] = rows.map((s) => ({
      id: s.id,
      userId: s.userId,
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
  });

  const partners: CreatorAdminPartner[] = allPartners.map((u) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    hasBadge: badgeMap.has(u.id),
    inRoom: roomSet.has(u.id),
    hasLoungeAccess: badgeMap.has(u.id) || roomSet.has(u.id),
    badgeGrantedAt: badgeMap.get(u.id)?.grantedAt ?? null,
    workflowStatus: u.creatorArenaProfile?.status ?? null,
    totalSubmissions: u.creatorArenaProfile?.totalSubmissions ?? 0,
    featuredCount: u.creatorArenaProfile?.featuredCount ?? 0,
    cupScore: cupScoreMap.get(u.id) ?? 0,
    notes: u.creatorArenaProfile?.notes ?? null,
    milestones: u.creatorArenaProfile?.milestones ?? [],
    submissions: submissionsByUser.get(u.id) ?? [],
  }));

  const challenges: CreatorAdminChallenge[] = challengeRows.map((c) => ({
    id: c.id,
    weekKey: c.weekKey,
    titleAr: c.titleAr,
    titleEn: c.titleEn,
    titleFr: c.titleFr,
    bodyAr: c.bodyAr,
    bodyEn: c.bodyEn,
    bodyFr: c.bodyFr,
    xpReward: c.xpReward,
    active: c.active,
    totalSubmissions: c.totalSubmissions,
    startsAt: c.startsAt.toISOString(),
    endsAt: c.endsAt.toISOString(),
  }));

  return (
    <div className="space-y-6 growth-page-enter">
      <AdminCreatorGroupClient
        partners={partners}
        stats={stats}
        challenges={challenges}
        submissionsByWeek={submissionsByWeek}
        pendingSubmissions={pendingRows}
        missingThisWeek={missingThisWeek}
        cupLeaderboard={cupLeaderboard}
      />
    </div>
  );
}
