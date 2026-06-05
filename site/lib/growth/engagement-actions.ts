"use server";

import { NotificationType, UserRole } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePartnerSurfaces } from "@/lib/growth/revalidate-partner";
import { createNotification } from "@/lib/growth/notify";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";
import { capsuleOpenDate } from "@/lib/growth/time-capsule";
import {
  acceptBattleStakes,
  hasActiveBattle,
} from "@/lib/growth/battles";
import { isAllowedBattleTarget } from "@/lib/growth/battle-candidates";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

type ActionResult = { ok: true } | { ok: false; error: string };

const capsuleSchema = z.object({
  message: z.string().min(10).max(500),
  dealsGoal: z.coerce.number().int().min(0).max(999).optional(),
  levelGoal: z.string().max(32).optional(),
  earningsGoal: z.coerce.number().int().min(0).optional(),
});

export async function createTimeCapsuleAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const existing = await prisma.timeCapsule.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) return { ok: false, error: "already_exists" };

  const parsed = capsuleSchema.safeParse({
    message: formData.get("message"),
    dealsGoal: formData.get("dealsGoal") || undefined,
    levelGoal: formData.get("levelGoal") || undefined,
    earningsGoal: formData.get("earningsGoal") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const now = new Date();
  const openAt = capsuleOpenDate(now);
  const goals = {
    deals: parsed.data.dealsGoal,
    level: parsed.data.levelGoal,
    earningsCents: parsed.data.earningsGoal
      ? parsed.data.earningsGoal * 100
      : undefined,
  };

  await prisma.timeCapsule.create({
    data: {
      userId: session.user.id,
      message: parsed.data.message.trim(),
      goals,
      openAt,
    },
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

export async function savePartnerOathFormAction(formData: FormData): Promise<void> {
  await savePartnerOathAction(null, formData);
}

export async function savePartnerOathAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const typedName = String(formData.get("typedName") ?? "").trim();
  if (typedName.length < 2) return { ok: false, error: "invalid_input" };

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, oath: true, onboardingSteps: true },
  });
  if (!profile) return { ok: false, error: "not_partner" };
  if (profile.oath) return { ok: false, error: "already_oath" };

  const now = new Date();
  const oathText = [
    `أنا ${typedName}`,
    "أتعهد أن أبني بصدق",
    "وأنمو بجدية",
    "وأحمل راية T.E.N.E.G.T.A",
    "بكل ما أملك",
    "",
    `اليوم ${now.toISOString().slice(0, 10)} — بدأت الرحلة`,
  ].join("\n");

  const prev =
    profile.onboardingSteps && typeof profile.onboardingSteps === "object"
      ? (profile.onboardingSteps as Record<string, boolean>)
      : {};

  await prisma.partnerProfile.update({
    where: { id: profile.id },
    data: {
      oath: oathText,
      oathDate: now,
      onboardingSteps: { ...prev, oath: true, profile: true },
    },
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

const battleSchema = z.object({
  challengedId: z.string().min(1),
  metric: z.enum(["deals", "xp", "streak"]).default("deals"),
  target: z.coerce.number().int().min(1).max(20).default(3),
  stakesXp: z.coerce.number().int().min(100).max(2000).default(500),
});

export async function challengePartnerFormAction(formData: FormData): Promise<void> {
  await challengePartnerAction(null, formData);
}

export async function challengePartnerAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = battleSchema.safeParse({
    challengedId: formData.get("challengedId"),
    metric: formData.get("metric") || "deals",
    target: formData.get("target") || 3,
    stakesXp: formData.get("stakesXp") || 500,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  if (parsed.data.challengedId === session.user.id) {
    return { ok: false, error: "self" };
  }
  if (!(await isAllowedBattleTarget(session.user.id, parsed.data.challengedId))) {
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
      metric: parsed.data.metric,
      target: parsed.data.target,
      stakesXp: parsed.data.stakesXp,
    },
  });

  const challenger = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
  });
  const name = challenger ? resolveChatSenderName(challenger) : "Partner";

  await createNotification(prisma, {
    userId: parsed.data.challengedId,
    type: NotificationType.SYSTEM,
    title: "تحدي وارد",
    body: `${name} يتحداك: أول من يصل ${parsed.data.target} (${parsed.data.metric})`,
    link: "/growth/battles",
    metadata: { kind: "battle_challenge", battleId: battle.id },
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

export async function acceptBattleAction(battleId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const battle = await prisma.partnerBattle.findUnique({ where: { id: battleId } });
  if (!battle || battle.challengedId !== session.user.id || battle.status !== "PENDING") {
    return { ok: false, error: "not_found" };
  }

  const [ch, cd] = await Promise.all([
    prisma.partnerProfile.findUnique({ where: { userId: battle.challengerId } }),
    prisma.partnerProfile.findUnique({ where: { userId: battle.challengedId } }),
  ]);
  if (!ch || !cd || ch.totalXp < battle.stakesXp || cd.totalXp < battle.stakesXp) {
    return { ok: false, error: "insufficient_xp" };
  }

  await acceptBattleStakes(battleId);

  await createNotification(prisma, {
    userId: battle.challengerId,
    type: NotificationType.SYSTEM,
    title: "قُبل التحدي",
    body: "المعركة بدأت — 7 أيام",
    link: "/growth/battles",
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

export async function declineBattleAction(battleId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const battle = await prisma.partnerBattle.findUnique({ where: { id: battleId } });
  if (!battle || battle.challengedId !== session.user.id || battle.status !== "PENDING") {
    return { ok: false, error: "not_found" };
  }

  await prisma.partnerBattle.update({
    where: { id: battleId },
    data: { status: "DECLINED" },
  });

  await createNotification(prisma, {
    userId: battle.challengerId,
    type: NotificationType.SYSTEM,
    title: "رُفض التحدي",
    body: "ابحث عن منافس آخر",
    link: "/growth/battles",
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

const mentorOfferSchema = z.object({
  specialtyAr: z.string().min(3).max(120),
  specialtyEn: z.string().min(3).max(120),
  duration: z.coerce.number().int().min(15).max(120).default(30),
  maxMentees: z.coerce.number().int().min(1).max(10).default(3),
});

export async function createMentorOfferFormAction(formData: FormData): Promise<void> {
  await createMentorOfferAction(null, formData);
}

export async function createTimeCapsuleFormAction(formData: FormData): Promise<void> {
  await createTimeCapsuleAction(null, formData);
}

export async function createMentorOfferAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: session.user.id },
    include: { currentLevel: true },
  });
  if (!profile || profile.currentLevel.order < 5) {
    return { ok: false, error: "level_required" };
  }

  const parsed = mentorOfferSchema.safeParse({
    specialtyAr: formData.get("specialtyAr"),
    specialtyEn: formData.get("specialtyEn"),
    duration: formData.get("duration") || 30,
    maxMentees: formData.get("maxMentees") || 3,
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await prisma.mentorOffer.upsert({
    where: { mentorId: session.user.id },
    create: {
      mentorId: session.user.id,
      specialtyAr: parsed.data.specialtyAr,
      specialtyEn: parsed.data.specialtyEn,
      duration: parsed.data.duration,
      maxMentees: parsed.data.maxMentees,
    },
    update: {
      specialtyAr: parsed.data.specialtyAr,
      specialtyEn: parsed.data.specialtyEn,
      duration: parsed.data.duration,
      maxMentees: parsed.data.maxMentees,
      isActive: true,
    },
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

export async function requestMentorshipAction(offerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const offer = await prisma.mentorOffer.findUnique({
    where: { id: offerId },
    include: { mentor: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } } },
  });
  if (!offer?.isActive || offer.mentorId === session.user.id) {
    return { ok: false, error: "not_found" };
  }

  const activeCount = await prisma.mentorshipSession.count({
    where: { offerId, status: { in: ["REQUESTED", "ACTIVE"] } },
  });
  if (activeCount >= offer.maxMentees) return { ok: false, error: "full" };

  const sessionRow = await prisma.mentorshipSession.upsert({
    where: { mentorId_menteeId: { mentorId: offer.mentorId, menteeId: session.user.id } },
    create: { mentorId: offer.mentorId, menteeId: session.user.id, offerId },
    update: { status: "REQUESTED" },
  });

  const mentee = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
  });

  await createNotification(prisma, {
    userId: offer.mentorId,
    type: NotificationType.SYSTEM,
    title: "طلب إرشاد",
    body: `${mentee ? resolveChatSenderName(mentee) : "شريك"} يطلب إرشاداً`,
    link: "/growth/mentors",
    metadata: { kind: "mentorship_request", sessionId: sessionRow.id },
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

export async function respondMentorshipAction(
  sessionId: string,
  accept: boolean,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const row = await prisma.mentorshipSession.findUnique({
    where: { id: sessionId },
    include: { offer: true, mentor: true, mentee: true },
  });
  if (!row || row.mentorId !== session.user.id || row.status !== "REQUESTED") {
    return { ok: false, error: "not_found" };
  }

  if (!accept) {
    await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: "DECLINED" },
    });
    revalidatePartnerSurfaces();
    return { ok: true };
  }

  const slug = `mentorship-${row.mentorId.slice(0, 8)}-${row.menteeId.slice(0, 8)}`;
  const room = await prisma.chatRoom.create({
    data: {
      slug,
      type: "MENTORSHIP",
      title: "إرشاد TENEGTA",
      isPublic: false,
      mentorUserId: row.mentorId,
      menteeUserId: row.menteeId,
      members: {
        create: [{ userId: row.mentorId }, { userId: row.menteeId }],
      },
    },
  });

  await prisma.mentorshipSession.update({
    where: { id: sessionId },
    data: { status: "ACTIVE", roomId: room.id },
  });

  await createNotification(prisma, {
    userId: row.menteeId,
    type: NotificationType.SYSTEM,
    title: "تم قبول الإرشاد",
    body: "افتح غرفة الإرشاد من صفحة المرشدين",
    link: "/growth/mentors",
  });

  revalidatePartnerSurfaces();
  return { ok: true };
}

const vaultItemSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2).max(64),
  titleAr: z.string().min(2),
  titleEn: z.string().min(2),
  descAr: z.string().min(2),
  descEn: z.string().min(2),
  contentAr: z.string().min(2),
  contentEn: z.string().min(2),
  previewAr: z.string().optional(),
  previewEn: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().int().default(0),
  unlockCriteriaJson: z.string().min(2),
  isActive: z.coerce.boolean().optional(),
});

export async function upsertVaultItemAdminFormAction(formData: FormData): Promise<void> {
  await upsertVaultItemAdminAction(null, formData);
}

export async function upsertVaultItemAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  let criteria: object;
  try {
    criteria = JSON.parse(String(formData.get("unlockCriteriaJson") ?? "{}")) as object;
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  const parsed = vaultItemSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    descAr: formData.get("descAr"),
    descEn: formData.get("descEn"),
    contentAr: formData.get("contentAr"),
    contentEn: formData.get("contentEn"),
    previewAr: formData.get("previewAr") || undefined,
    previewEn: formData.get("previewEn") || undefined,
    icon: formData.get("icon") || undefined,
    order: formData.get("order") || 0,
    unlockCriteriaJson: JSON.stringify(criteria),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const data = {
    slug: parsed.data.slug,
    titleAr: parsed.data.titleAr,
    titleEn: parsed.data.titleEn,
    descAr: parsed.data.descAr,
    descEn: parsed.data.descEn,
    contentAr: parsed.data.contentAr,
    contentEn: parsed.data.contentEn,
    previewAr: parsed.data.previewAr ?? null,
    previewEn: parsed.data.previewEn ?? null,
    icon: parsed.data.icon ?? null,
    order: parsed.data.order,
    unlockCriteria: criteria,
    isActive: parsed.data.isActive ?? true,
  };

  if (parsed.data.id) {
    await prisma.vaultItem.update({ where: { id: parsed.data.id }, data });
  } else {
    await prisma.vaultItem.create({ data });
  }

  return { ok: true };
}

export async function deleteVaultItemAdminAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  await prisma.vaultItem.delete({ where: { id } }).catch(() => null);
  return { ok: true };
}
