"use server";

import { CreatorWorkflowStatus, NotificationType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  currentWeekKey,
  isCreatorBattleTarget,
  submitCreatorPost,
  trackCreatorArenaVisit,
  updateCreatorWorkflowStatus,
} from "@/lib/growth/creator-arena";
import { canAccessCreatorLounge, CONTENT_CREATOR_BADGE } from "@/lib/growth/creator-program";
import { grantIfMissingBadge } from "@/lib/growth/creator-arena-badge";
import { createNotification } from "@/lib/growth/notify";
import { hasActiveBattle } from "@/lib/growth/battles";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { revalidatePartnerSurfaces } from "@/lib/growth/revalidate-partner";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const statusSchema = z.object({
  status: z.enum(["INVITED", "JOINED", "FILMING", "SUBMITTED", "FEATURED"]),
});

const submitSchema = z.object({
  postUrl: z.string().url().max(500),
  platform: z.string().max(32).optional(),
});

const trackSchema = z.object({
  path: z.string().max(200),
  utmSource: z.string().max(80).optional(),
  utmCampaign: z.string().max(80).optional(),
});

const battleSchema = z.object({
  challengedId: z.string().min(1),
  target: z.coerce.number().int().min(1).max(5).default(1),
  stakesXp: z.coerce.number().int().min(100).max(2000).default(500),
});

const ratingSchema = z.object({
  submissionId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
});

const notesSchema = z.object({
  userId: z.string().min(1),
  notes: z.string().max(5000),
});

const milestoneSchema = z.object({
  userId: z.string().min(1),
  milestoneKey: z.string().min(1).max(80),
});

const challengeCreateSchema = z.object({
  weekKey: z.string().min(1),
  titleAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  titleFr: z.string().max(200).optional(),
  bodyAr: z.string().min(1).max(2000),
  bodyEn: z.string().min(1).max(2000),
  bodyFr: z.string().max(2000).optional(),
  xpReward: z.coerce.number().int().min(50).max(5000).default(500),
});

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  return { ok: true, userId: session.user.id };
}

export async function updateCreatorStatusAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthorized" };

  const parsed = statusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const isAdmin = session.user.role === UserRole.ADMIN;
  const targetUserId = String(formData.get("userId") ?? session.user.id);

  if (!isAdmin && targetUserId !== session.user.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin && !(await canAccessCreatorLounge(session.user.id))) {
    return { ok: false, error: "unauthorized" };
  }

  await updateCreatorWorkflowStatus(
    targetUserId,
    parsed.data.status as CreatorWorkflowStatus,
    session.user.id,
  );

  if (parsed.data.status === "FEATURED") {
    await prisma.creatorArenaProfile.updateMany({
      where: { userId: targetUserId },
      data: { featuredCount: { increment: 1 } },
    });
  }

  revalidatePath("/growth/creators");
  revalidatePath("/growth/admin/creators");
  return { ok: true };
}

export async function submitCreatorChallengeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !(await canAccessCreatorLounge(session.user.id))) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = submitSchema.safeParse({
    postUrl: formData.get("postUrl"),
    platform: formData.get("platform") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await submitCreatorPost(session.user.id, parsed.data.postUrl, parsed.data.platform);
  revalidatePath("/growth/creators");
  return { ok: true };
}

export async function trackCreatorVisitAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const parsed = trackSchema.safeParse({
    path: formData.get("path"),
    utmSource: formData.get("utmSource") ?? undefined,
    utmCampaign: formData.get("utmCampaign") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await trackCreatorArenaVisit({
    path: parsed.data.path,
    utmSource: parsed.data.utmSource,
    utmCampaign: parsed.data.utmCampaign,
    userId: session?.user?.id ?? null,
  });

  return { ok: true };
}

export async function challengeCreatorBattleAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  if (!(await canAccessCreatorLounge(session.user.id))) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = battleSchema.safeParse({
    challengedId: formData.get("challengedId"),
    target: formData.get("target") ?? 1,
    stakesXp: formData.get("stakesXp") ?? 500,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  if (!(await isCreatorBattleTarget(session.user.id, parsed.data.challengedId))) {
    return { ok: false, error: "invalid_target" };
  }
  if (await hasActiveBattle(session.user.id)) {
    return { ok: false, error: "battle_active" };
  }

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile || profile.totalXp < parsed.data.stakesXp) {
    return { ok: false, error: "insufficient_xp" };
  }

  const battle = await prisma.partnerBattle.create({
    data: {
      challengerId: session.user.id,
      challengedId: parsed.data.challengedId,
      metric: "creator_posts",
      target: parsed.data.target,
      stakesXp: parsed.data.stakesXp,
    },
  });

  const challenger = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
  });
  const name = challenger ? resolveChatSenderName(challenger) : "Creator";

  await createNotification(prisma, {
    userId: parsed.data.challengedId,
    type: NotificationType.SYSTEM,
    title: "تحدي صنّاع",
    body: `${name} يتحداك: أول من ينشر ${parsed.data.target} منشوراً هذا الأسبوع`,
    link: "/growth/battles",
    metadata: { kind: "creator_battle", battleId: battle.id },
  });

  revalidatePartnerSurfaces();
  revalidatePath("/growth/creators");
  return { ok: true };
}

export async function adminRateSubmissionAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const parsed = ratingSchema.safeParse({
    submissionId: formData.get("submissionId"),
    rating: formData.get("rating"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const status = parsed.data.rating >= 4 ? "approved" : "pending";
  await prisma.creatorSubmission.update({
    where: { id: parsed.data.submissionId },
    data: {
      adminRating: parsed.data.rating,
      status,
      isFeatured: parsed.data.rating === 5,
    },
  });

  revalidatePath("/growth/admin/creators");
  revalidatePath("/growth/creators");
  return { ok: true };
}

const submissionStatusSchema = z.object({
  submissionId: z.string().min(1),
  status: z.enum(["approved", "rejected", "pending"]),
});

export async function adminSetSubmissionStatusAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const parsed = submissionStatusSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const isFeatured = parsed.data.status === "approved";
  await prisma.creatorSubmission.update({
    where: { id: parsed.data.submissionId },
    data: {
      status: parsed.data.status,
      isFeatured,
      adminRating: parsed.data.status === "approved" ? 5 : parsed.data.status === "rejected" ? 1 : null,
    },
  });

  revalidatePath("/growth/admin/creators");
  revalidatePath("/growth/creators");
  return { ok: true };
}

export async function adminSaveCreatorNotesAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const parsed = notesSchema.safeParse({
    userId: formData.get("userId"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await prisma.creatorArenaProfile.upsert({
    where: { userId: parsed.data.userId },
    create: { userId: parsed.data.userId, notes: parsed.data.notes || null },
    update: { notes: parsed.data.notes || null, updatedById: admin.userId },
  });

  revalidatePath("/growth/admin/creators");
  return { ok: true };
}

export async function adminGrantMilestoneAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const parsed = milestoneSchema.safeParse({
    userId: formData.get("userId"),
    milestoneKey: formData.get("milestoneKey"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const profile = await prisma.creatorArenaProfile.findUnique({
    where: { userId: parsed.data.userId },
  });
  const current = profile?.milestones ?? [];
  if (!current.includes(parsed.data.milestoneKey)) {
    await prisma.creatorArenaProfile.upsert({
      where: { userId: parsed.data.userId },
      create: {
        userId: parsed.data.userId,
        milestones: [parsed.data.milestoneKey],
      },
      update: {
        milestones: { push: parsed.data.milestoneKey },
        updatedById: admin.userId,
      },
    });
  }

  revalidatePath("/growth/admin/creators");
  revalidatePath("/growth/creators");
  return { ok: true };
}

export async function adminCreateChallengeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const parsed = challengeCreateSchema.safeParse({
    weekKey: formData.get("weekKey") ?? currentWeekKey(),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    titleFr: formData.get("titleFr") ?? "",
    bodyAr: formData.get("bodyAr"),
    bodyEn: formData.get("bodyEn"),
    bodyFr: formData.get("bodyFr") ?? "",
    xpReward: formData.get("xpReward") ?? 500,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setUTCDate(endsAt.getUTCDate() + 7);

  await prisma.creatorChallenge.upsert({
    where: { weekKey: parsed.data.weekKey },
    create: {
      weekKey: parsed.data.weekKey,
      titleAr: parsed.data.titleAr,
      titleEn: parsed.data.titleEn,
      titleFr: parsed.data.titleFr ?? "",
      bodyAr: parsed.data.bodyAr,
      bodyEn: parsed.data.bodyEn,
      bodyFr: parsed.data.bodyFr ?? "",
      xpReward: parsed.data.xpReward,
      active: true,
      startsAt: now,
      endsAt,
    },
    update: {
      titleAr: parsed.data.titleAr,
      titleEn: parsed.data.titleEn,
      titleFr: parsed.data.titleFr ?? "",
      bodyAr: parsed.data.bodyAr,
      bodyEn: parsed.data.bodyEn,
      bodyFr: parsed.data.bodyFr ?? "",
      xpReward: parsed.data.xpReward,
      active: true,
    },
  });

  revalidatePath("/growth/admin/creators");
  revalidatePath("/growth/creators");
  return { ok: true };
}

export async function adminGrantCreatorBadgeAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, error: "invalid_input" };

  await grantIfMissingBadge(userId, CONTENT_CREATOR_BADGE);
  const { grantCreatorLoungeAccess } = await import("@/lib/growth/creator-program");
  await grantCreatorLoungeAccess(userId);

  revalidatePath("/growth/admin/creators");
  return { ok: true };
}

export async function adminCloseCreatorCupSeasonAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return admin;

  const { creatorCupLeaderboard } = await import("@/lib/growth/creator-arena");
  const board = await creatorCupLeaderboard(3);
  const badgeKeys = ["creator_cup_gold", "creator_cup_silver", "creator_cup_bronze"];

  for (let i = 0; i < board.length && i < 3; i++) {
    const row = board[i]!;
    const key = badgeKeys[i];
    if (key) await grantIfMissingBadge(row.userId, key);
    await createNotification(prisma, {
      userId: row.userId,
      type: NotificationType.SYSTEM,
      title: "Creator Cup",
      body: `مبروك! أنهيت الموسم في المركز #${i + 1}`,
      link: "/growth/creators",
      metadata: { kind: "creator_cup_season", rank: i + 1 },
    });
  }

  revalidatePath("/growth/admin/creators");
  return { ok: true };
}
