"use server";

import { CreatorWorkflowStatus, NotificationType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isCreatorBattleTarget,
  submitCreatorPost,
  trackCreatorArenaVisit,
  updateCreatorWorkflowStatus,
} from "@/lib/growth/creator-arena";
import { canAccessCreatorLounge } from "@/lib/growth/creator-program";
import { createNotification } from "@/lib/growth/notify";
import { hasActiveBattle } from "@/lib/growth/battles";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { revalidatePartnerSurfaces } from "@/lib/growth/revalidate-partner";

type ActionResult = { ok: true } | { ok: false; error: string };

const statusSchema = z.object({
  status: z.enum(["INVITED", "JOINED", "FILMING", "SUBMITTED", "FEATURED"]),
});

const submitSchema = z.object({
  postUrl: z.string().url().max(500),
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

  const parsed = submitSchema.safeParse({ postUrl: formData.get("postUrl") });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await submitCreatorPost(session.user.id, parsed.data.postUrl);
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
