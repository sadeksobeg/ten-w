"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  Prisma,
  UserRole,
  DealStatus,
  PayoutStatus,
  BadgeType,
  EventStatus,
  ParticipantStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { closeDealAsAdmin } from "@/lib/growth/commission";
import { evaluateAutoBadgesForUser, grantAdminBadge, grantNightOwlIfEligible } from "@/lib/growth/badges";
import { applyMissionProgress } from "@/lib/growth/missions";
import { logActivityEvent } from "@/lib/growth/activity";
import { applyMonthlyLeaderboardBonuses } from "@/lib/growth/rewards";
import { partnerOverrideModelsAvailable } from "@/lib/growth/prisma-optional";
import { createNotification, createNotificationsForAllActivePartners, notifyAdmins } from "@/lib/growth/notify";
import { uniquePublicSlug } from "@/lib/growth/public-slug";
import { PartnerNetworkError, setPartnerUpline } from "@/lib/growth/partner-network";
import { logAdminAudit } from "@/lib/growth/audit-log";
import { syncPartnerLevel } from "@/lib/growth/levels";
import { revalidatePartnerSurfaces } from "@/lib/growth/revalidate-partner";
import { rateLimitGrowthAction } from "@/lib/growth/growth-rate-limit";
import { nextPartnerCardNumber } from "@/lib/growth/partner-card-number";
import { TERRITORY_KEYS, isTerritoryKey } from "@/lib/growth/territories";
import { nextLegendRank } from "@/lib/growth/hall-of-legends";
import { rivalCacheTag } from "@/lib/growth/rival";
import {
  addUserToCreatorRoom,
  CONTENT_CREATOR_BADGE,
  removeUserFromCreatorRoom,
} from "@/lib/growth/creator-program";
import { setChatModerator } from "@/lib/growth/chat-moderation";
import { GAME_CONFIG } from "@/lib/growth/game-config";
import { touchActivityDay } from "@/lib/growth/streak";

type ActionResult = { ok: true } | { ok: false; error: string };

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
  referralCode: z.string().max(16).optional().or(z.literal("")),
});

function randomReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = randomReferralCode();
    const exists = await prisma.partnerProfile.findUnique({
      where: { referralCode: code },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate referral code");
}

export async function growthSignOutAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "ar").trim();
  const safeLocale = ["ar", "en", "fr"].includes(locale) ? locale : "ar";
  await signOut({ redirect: true, redirectTo: `/${safeLocale}` });
}

export async function registerPartnerAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    referralCode: formData.get("referralCode") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "email_taken" };
  }

  let parentUserId: string | null = null;
  const ref = parsed.data.referralCode?.trim();
  if (ref) {
    const parentProfile = await prisma.partnerProfile.findUnique({
      where: { referralCode: ref },
    });
    if (!parentProfile) {
      return { ok: false, error: "invalid_referral" };
    }
    parentUserId = parentProfile.userId;
  }

  const starter = await prisma.levelDefinition.findFirst({
    orderBy: { order: "asc" },
  });
  if (!starter) {
    return { ok: false, error: "missing_seed" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const referralCode = await uniqueReferralCode();

  await prisma.$transaction(async (tx) => {
    const cardNumber = await nextPartnerCardNumber(tx);
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name,
        role: UserRole.PARTNER,
      },
    });

    await tx.partnerProfile.create({
      data: {
        userId: user.id,
        referralCode,
        parentUserId,
        currentLevelId: starter.id,
        cardNumber,
      },
    });
  });

  if (parentUserId) {
    await applyMissionProgress(prisma, parentUserId, "referral", 1);
    await logActivityEvent(prisma, {
      kind: "referral_joined",
      actorUserId: parentUserId,
      headline: `New partner joined: ${parsed.data.name}`,
      metadata: { name: parsed.data.name },
    });
  }

  revalidatePath("/", "layout");
  return { ok: true, email };
}

const addLeadSchema = z.object({
  productId: z.string().min(1),
  clientLabel: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function addLeadDealAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = addLeadSchema.safeParse({
    productId: formData.get("productId"),
    clientLabel: formData.get("clientLabel") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const limited = await rateLimitGrowthAction("add_lead", session.user.id);
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || !product.active) {
    return { ok: false, error: "invalid_input" };
  }

  await prisma.deal.create({
    data: {
      partnerId: session.user.id,
      productId: product.id,
      status: DealStatus.PENDING,
      saleAmountCents: product.priceCents,
      clientLabel: parsed.data.clientLabel?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  await applyMissionProgress(prisma, session.user.id, "add_lead", 1);
  revalidateGrowth();
  return { ok: true };
}

export async function updatePendingLeadAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const dealId = String(formData.get("dealId") ?? "").trim();
  const parsed = addLeadSchema.safeParse({
    productId: formData.get("productId"),
    clientLabel: formData.get("clientLabel") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!dealId || !parsed.success) return { ok: false, error: "invalid_input" };

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, partnerId: session.user.id, status: DealStatus.PENDING },
  });
  if (!deal) return { ok: false, error: "not_found" };

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active) return { ok: false, error: "invalid_input" };

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      productId: product.id,
      saleAmountCents: product.priceCents,
      clientLabel: parsed.data.clientLabel?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  revalidateGrowth();
  return { ok: true };
}

export async function deletePendingLeadAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return { ok: false, error: "invalid_input" };

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, partnerId: session.user.id, status: DealStatus.PENDING },
  });
  if (!deal) return { ok: false, error: "not_found" };

  await prisma.deal.delete({ where: { id: deal.id } });
  revalidateGrowth();
  return { ok: true };
}

export async function markPendingLeadLostAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return { ok: false, error: "invalid_input" };

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, partnerId: session.user.id, status: DealStatus.PENDING },
  });
  if (!deal) return { ok: false, error: "not_found" };

  await prisma.deal.update({
    where: { id: deal.id },
    data: { status: DealStatus.LOST, lostAt: new Date() },
  });

  await logActivityEvent(prisma, {
    kind: "deal_lost",
    actorUserId: session.user.id,
    headline: `Lead marked lost: ${deal.clientLabel ?? deal.id}`,
    metadata: { dealId: deal.id },
  });

  revalidateGrowth();
  return { ok: true };
}

const CLOSE_REQUEST_TAG = "[CLOSE REQUEST]";

export async function requestDealCloseAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return { ok: false, error: "invalid_input" };

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, partnerId: session.user.id, status: DealStatus.PENDING },
    include: { product: { select: { name: true } } },
  });
  if (!deal) return { ok: false, error: "invalid_input" };

  const noteLine = `${CLOSE_REQUEST_TAG} ${new Date().toISOString()}`;
  const notes = deal.notes?.includes(CLOSE_REQUEST_TAG)
    ? deal.notes
    : [deal.notes?.trim(), noteLine].filter(Boolean).join("\n");

  await prisma.deal.update({
    where: { id: deal.id },
    data: { notes },
  });

  await notifyAdmins({
    type: NotificationType.SYSTEM,
    title: "طلب إغلاق صفقة",
    body: `${deal.product.name} — ${deal.clientLabel ?? "—"}`,
    link: "/growth/admin/deals",
    metadata: { dealId: deal.id, partnerId: session.user.id },
  });

  const conv = await prisma.chatConversation.findFirst({
    where: { partnerUserId: session.user.id, status: "OPEN" },
    orderBy: { updatedAt: "desc" },
  });
  if (conv) {
    await prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        senderUserId: session.user.id,
        body: `طلب إغلاق صفقة: ${deal.product.name}`,
        kind: "system",
      },
    });
  }

  revalidateGrowth();
  return { ok: true };
}

export async function appreciationAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { ok: false, error: "invalid_input" };

  const limited = await rateLimitGrowthAction("appreciation", session.user.id);
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const target = await prisma.user.findFirst({
    where: { publicSlug: slug, isActive: true, role: UserRole.PARTNER },
    select: { id: true, name: true },
  });
  if (!target || target.id === session.user.id) {
    return { ok: false, error: "invalid_input" };
  }

  await logActivityEvent(prisma, {
    kind: "appreciation",
    actorUserId: session.user.id,
    headline: `Appreciation for ${target.name ?? slug}`,
    metadata: { targetUserId: target.id },
  });

  const { evaluateAutoBadgesForUser } = await import("@/lib/growth/badges");
  await evaluateAutoBadgesForUser(prisma, target.id);

  revalidateGrowth();
  return { ok: true };
}

export async function updateShowcasedBadgesAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const raw = String(formData.get("badgeKeys") ?? "");
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 5);

  await prisma.partnerProfile.update({
    where: { userId: session.user.id },
    data: { showcasedBadges: keys },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { publicSlug: true },
  });
  revalidateGrowth();
  revalidatePartnerSurfaces({ publicSlug: user?.publicSlug ?? null });
  return { ok: true };
}

export async function savePushSubscriptionAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthorized" };
  const json = String(formData.get("subscription") ?? "");
  if (!json) return { ok: false, error: "invalid_input" };
  try {
    JSON.parse(json);
  } catch {
    return { ok: false, error: "invalid_input" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushSubscription: json },
  });
  return { ok: true };
}

export async function recordMarketingKitHitAction(_formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { marketingKitHits: { increment: 1 } },
  });
  revalidatePath("/");
}

const payoutSchema = z.object({
  amountUsd: z.coerce.number().int().min(10).max(1_000_000),
  method: z.string().max(120).optional().or(z.literal("")),
});

export async function requestPayoutAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = payoutSchema.safeParse({
    amountUsd: formData.get("amountUsd"),
    method: formData.get("method") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const limited = await rateLimitGrowthAction("payout", session.user.id);
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const cents = parsed.data.amountUsd * 100;
  const { computePartnerWallet } = await import("@/lib/growth/wallet");
  const wallet = await computePartnerWallet(session.user.id);
  if (wallet.availableCents <= 0) {
    return { ok: false, error: "insufficient_balance" };
  }
  if (cents > wallet.availableCents) {
    return { ok: false, error: "insufficient_balance" };
  }

  await prisma.payoutRequest.create({
    data: {
      userId: session.user.id,
      amountCents: cents,
      status: PayoutStatus.PENDING,
      method: parsed.data.method?.trim() || null,
    },
  });

  revalidateGrowth();
  return { ok: true };
}

export async function closeDealAdminFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return { ok: false, error: "invalid_input" };
  return closeDealAdminAction(dealId);
}

export async function markDealLostAdminFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return { ok: false, error: "invalid_input" };
  return markDealLostAdminAction(dealId);
}

export async function markDealLostAdminAction(
  dealId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return { ok: false, error: "not_found" };
  if (deal.status !== DealStatus.PENDING) {
    return { ok: false, error: "bad_state" };
  }

  await prisma.deal.update({
    where: { id: dealId },
    data: { status: DealStatus.LOST, lostAt: new Date() },
  });

  await logActivityEvent(prisma, {
    kind: "deal_lost",
    actorUserId: deal.partnerId,
    headline: `Deal marked lost: ${deal.clientLabel ?? deal.id}`,
    metadata: { dealId },
  });

  revalidatePath("/");
  return { ok: true };
}

const payoutActionSchema = z.object({
  payoutId: z.string().min(1),
});

export async function approvePayoutAdminFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = payoutActionSchema.safeParse({ payoutId: formData.get("payoutId") });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  return updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.APPROVED);
}

export async function rejectPayoutAdminFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = payoutActionSchema.safeParse({ payoutId: formData.get("payoutId") });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  return updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.REJECTED);
}

export async function markPayoutPaidAdminFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = payoutActionSchema.safeParse({ payoutId: formData.get("payoutId") });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  return updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.PAID);
}

async function updatePayoutStatusAdminAction(
  payoutId: string,
  status: PayoutStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const payout = await prisma.payoutRequest.findUnique({ where: { id: payoutId } });
  if (!payout) return { ok: false, error: "not_found" };

  if (status === PayoutStatus.APPROVED && payout.status !== PayoutStatus.PENDING) {
    return { ok: false, error: "bad_state" };
  }
  if (status === PayoutStatus.REJECTED && payout.status === PayoutStatus.PAID) {
    return { ok: false, error: "bad_state" };
  }
  if (status === PayoutStatus.PAID && payout.status !== PayoutStatus.APPROVED) {
    return { ok: false, error: "bad_state" };
  }

  await prisma.payoutRequest.update({
    where: { id: payoutId },
    data: { status },
  });

  await logActivityEvent(prisma, {
    kind: "payout_status",
    actorUserId: payout.userId,
    headline: `Payout ${status.toLowerCase()}: $${(payout.amountCents / 100).toFixed(0)}`,
    amountCents: payout.amountCents,
    metadata: { payoutId, status },
  });

  await createNotification(prisma, {
    userId: payout.userId,
    type: NotificationType.PAYOUT_UPDATE,
    title: "تحديث السحب",
    body: `حالة الطلب: ${status}`,
    link: "/growth",
    metadata: { payoutId, status },
  });

  revalidateGrowth();
  return { ok: true };
}

export async function closeDealAdminAction(
  dealId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { partnerId: true },
  });

  const res = await closeDealAsAdmin({
    dealId,
    actorUserId: session.user.id,
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  if (deal?.partnerId) {
    revalidateTag(rivalCacheTag(deal.partnerId), "max");
  }

  revalidatePath("/");
  return { ok: true };
}

const createDealSchema = z.object({
  partnerEmail: z.string().email(),
  productId: z.string().min(1),
  clientLabel: z.string().max(200).optional().or(z.literal("")),
});

export async function createDealAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const parsed = createDealSchema.safeParse({
    partnerEmail: formData.get("partnerEmail"),
    productId: formData.get("productId"),
    clientLabel: formData.get("clientLabel") ?? "",
  });
  if (!parsed.success) return;

  const partner = await prisma.user.findUnique({
    where: { email: parsed.data.partnerEmail.toLowerCase().trim() },
    include: { partnerProfile: true },
  });
  if (!partner?.partnerProfile) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) return;

  await prisma.deal.create({
    data: {
      partnerId: partner.id,
      productId: product.id,
      status: DealStatus.PENDING,
      saleAmountCents: product.priceCents,
      clientLabel: parsed.data.clientLabel?.trim() || null,
    },
  });

  revalidatePath("/");
}

const updateProductSchema = z.object({
  productId: z.string().min(1),
  commissionBaseUsd: z.coerce.number().min(0).max(1_000_000),
  priceUsd: z.coerce.number().min(0).max(5_000_000),
});

export async function updateProductAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    commissionBaseUsd: formData.get("commissionBaseUsd"),
    priceUsd: formData.get("priceUsd"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      priceCents: Math.round(parsed.data.priceUsd * 100),
      commissionBaseCents: Math.round(parsed.data.commissionBaseUsd * 100),
    },
  });

  revalidateGrowth();
  return { ok: true };
}

const assignBadgeSchema = z.object({
  email: z.string().email(),
  badgeKey: z.string().min(2).max(64),
});

export async function assignAdminBadgeAction(
  formData: FormData,
): Promise<{ ok: true; badgeName: string; badgeKey: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = assignBadgeSchema.safeParse({
    email: formData.get("email"),
    badgeKey: formData.get("badgeKey"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
    select: { id: true, name: true, email: true },
  });
  if (!user) return { ok: false, error: "user_not_found" };

  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: parsed.data.badgeKey },
  });
  if (!badge) {
    return { ok: false, error: "invalid_badge" };
  }

  const granted = await grantAdminBadge(prisma, user.id, badge.key, session.user.id);
  if (!granted) return { ok: false, error: "badge_already_granted" };

  if (badge.key === CONTENT_CREATOR_BADGE) {
    await addUserToCreatorRoom(user.id);
  }

  await createNotification(prisma, {
    userId: user.id,
    type: NotificationType.BADGE_EARNED,
    title: badge.key === CONTENT_CREATOR_BADGE ? "برنامج صناع المحتوى" : "شارة جديدة",
    body:
      badge.key === CONTENT_CREATOR_BADGE
        ? "تم قبولك في برنامج الشراكة مع صناع المحتوى — اكتشف مزاياك الآن."
        : badge.name,
    link: badge.key === CONTENT_CREATOR_BADGE ? "/growth/creators" : "/growth",
    metadata: { badgeKey: badge.key },
  });
  revalidateGrowth();
  return { ok: true, badgeName: badge.name, badgeKey: badge.key };
}

export async function assignAdminBadgesBatchAction(
  userIds: string[],
  badgeKey: string,
): Promise<
  | { ok: true; granted: number; skipped: number; badgeName: string }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  if (userIds.length === 0 || !badgeKey) return { ok: false, error: "invalid_input" };

  const badge = await prisma.badgeDefinition.findUnique({ where: { key: badgeKey } });
  if (!badge) return { ok: false, error: "invalid_badge" };

  let granted = 0;
  let skipped = 0;

  for (const userId of userIds) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      skipped += 1;
      continue;
    }

    const didGrant = await grantAdminBadge(prisma, user.id, badge.key, session.user.id);
    if (!didGrant) {
      skipped += 1;
      continue;
    }
    granted += 1;

    if (badge.key === CONTENT_CREATOR_BADGE) {
      await addUserToCreatorRoom(user.id);
    }

    await createNotification(prisma, {
      userId: user.id,
      type: NotificationType.BADGE_EARNED,
      title: badge.key === CONTENT_CREATOR_BADGE ? "برنامج صناع المحتوى" : "شارة جديدة",
      body:
        badge.key === CONTENT_CREATOR_BADGE
          ? "تم قبولك في برنامج الشراكة مع صناع المحتوى — اكتشف مزاياك الآن."
          : badge.name,
      link: badge.key === CONTENT_CREATOR_BADGE ? "/growth/creators" : "/growth",
      metadata: { badgeKey: badge.key },
    });
  }

  if (granted > 0) {
    await logAdminAudit(session.user.id, "grant_badge_batch", "BadgeDefinition", badge.id, {
      badgeKey,
      granted,
      skipped,
      userIds,
    });
  }

  revalidateGrowth();
  return { ok: true, granted, skipped, badgeName: badge.name };
}

const revokeBadgeSchema = z.object({
  email: z.string().email(),
  badgeKey: z.string().min(2).max(64),
});

export async function revokeAdminBadgeAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }
  const parsed = revokeBadgeSchema.safeParse({
    email: formData.get("email"),
    badgeKey: formData.get("badgeKey"),
  });
  if (!parsed.success) return;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: parsed.data.badgeKey },
  });
  if (!user || !badge) return;

  await prisma.userBadge.deleteMany({
    where: { userId: user.id, badgeId: badge.id },
  });
  if (badge.key === CONTENT_CREATOR_BADGE) {
    await removeUserFromCreatorRoom(user.id);
  }
  revalidatePath("/");
}

const creatorRoomMemberSchema = z.object({
  userId: z.string().min(1),
});

export async function adminAddCreatorRoomMemberAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = creatorRoomMemberSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true },
  });
  if (!user) return { ok: false, error: "user_not_found" };

  await addUserToCreatorRoom(user.id);
  await createNotification(prisma, {
    userId: user.id,
    type: NotificationType.SYSTEM,
    title: "مجموعة صناع المحتوى",
    body: "تمت إضافتك إلى مجموعة الدردشة الخاصة لصناع المحتوى.",
    link: "/growth/chat?room=content-creators",
  });
  revalidateGrowth();
  return { ok: true };
}

export async function adminRemoveCreatorRoomMemberAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = creatorRoomMemberSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await removeUserFromCreatorRoom(parsed.data.userId);
  revalidateGrowth();
  return { ok: true };
}

const chatModeratorSchema = z.object({
  userId: z.string().min(1),
  enabled: z.enum(["0", "1"]),
});

export async function adminSetChatModeratorAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = chatModeratorSchema.safeParse({
    userId: formData.get("userId"),
    enabled: formData.get("enabled"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await setChatModerator(parsed.data.userId, parsed.data.enabled === "1");
  await logAdminAudit(session.user.id, "set_chat_moderator", "User", parsed.data.userId, {
    enabled: parsed.data.enabled === "1",
  });
  revalidateGrowth();
  return { ok: true };
}

export async function applyMonthlyRewardsAdminAction(_formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }
  await applyMonthlyLeaderboardBonuses(session.user.id);
  revalidatePath("/");
}

export async function saveLeaderboardSeasonAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;

  const name = String(formData.get("name") ?? "Season").trim().slice(0, 120);
  const windowDays = Math.min(90, Math.max(1, Number(formData.get("windowDays") ?? 7)));
  const weightDeals = Math.min(100, Math.max(0, Number(formData.get("weightDeals") ?? 40)));
  const weightXp = Math.min(100, Math.max(0, Number(formData.get("weightXp") ?? 40)));
  const weightStreak = Math.min(100, Math.max(0, Number(formData.get("weightStreak") ?? 20)));

  try {
    await prisma.leaderboardSeason.updateMany({ data: { active: false } });
    await prisma.leaderboardSeason.create({
      data: {
        name,
        windowMs: BigInt(windowDays * 24 * 60 * 60 * 1000),
        weightDeals,
        weightXp,
        weightStreak,
        active: true,
      },
    });
  } catch {
    return;
  }
  revalidatePath("/");
}

export async function adminSetLeaderboardBonusFormAction(formData: FormData): Promise<void> {
  await adminSetLeaderboardBonusAction(formData);
}

export async function adminSetLeaderboardBonusAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const partnerId = String(formData.get("partnerId") ?? "").trim();
  const bonusRaw = Number(formData.get("scoreBonus") ?? 0);
  if (!partnerId || !Number.isFinite(bonusRaw)) {
    return { ok: false, error: "invalid_input" };
  }
  const scoreBonus = Math.min(500, Math.max(-500, Math.round(bonusRaw)));

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: partnerId },
  });
  if (!profile) return { ok: false, error: "not_found" };

  const partnerUser = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { publicSlug: true },
  });

  await prisma.partnerProfile.update({
    where: { userId: partnerId },
    data: { leaderboardScoreBonus: scoreBonus },
  });

  revalidateGrowth();
  revalidatePartnerSurfaces({ publicSlug: partnerUser?.publicSlug ?? null });
  return { ok: true };
}

const overrideSchema = z.object({
  partnerEmail: z.string().email(),
  productSlug: z.string().max(64).optional().or(z.literal("")),
  commissionBaseUsd: z.coerce.number().min(0).max(1_000_000),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function upsertPartnerCommissionOverrideAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  if (!partnerOverrideModelsAvailable(prisma)) {
    return { ok: false, error: "invalid_input" };
  }
  const parsed = overrideSchema.safeParse({
    partnerEmail: formData.get("partnerEmail"),
    productSlug: formData.get("productSlug") ?? "",
    commissionBaseUsd: formData.get("commissionBaseUsd"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const partner = await prisma.user.findUnique({
    where: { email: parsed.data.partnerEmail.toLowerCase().trim() },
    include: { partnerProfile: true },
  });
  if (!partner?.partnerProfile) return { ok: false, error: "user_not_found" };

  const slug = parsed.data.productSlug?.trim();
  let productId: string | null = null;
  if (slug) {
    const prod = await prisma.product.findUnique({ where: { slug } });
    if (!prod) return { ok: false, error: "invalid_input" };
    productId = prod.id;
  }

  await prisma.partnerCommissionOverride.deleteMany({
    where: { partnerUserId: partner.id, productId },
  });
  await prisma.partnerCommissionOverride.create({
    data: {
      partnerUserId: partner.id,
      productId,
      commissionBaseCents: Math.round(parsed.data.commissionBaseUsd * 100),
      note: parsed.data.note?.trim() || null,
    },
  });
  revalidateGrowth();
  return { ok: true };
}

const manualBonusSchema = z.object({
  email: z.string().email(),
  amountUsd: z.coerce.number().min(1).max(1_000_000),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function grantManualBonusAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = manualBonusSchema.safeParse({
    email: formData.get("email"),
    amountUsd: formData.get("amountUsd"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user) return { ok: false, error: "user_not_found" };

  const cents = Math.round(parsed.data.amountUsd * 100);
  await prisma.commissionLedger.create({
    data: {
      dealId: null,
      userId: user.id,
      tier: 0,
      amountCents: cents,
      ruleSnapshot: {
        kind: "manual_bonus",
        note: parsed.data.note?.trim() || null,
        grantedBy: session.user.id,
      },
    },
  });
  await logActivityEvent(prisma, {
    kind: "manual_bonus",
    actorUserId: user.id,
    headline: `Bonus credited: $${parsed.data.amountUsd}`,
    amountCents: cents,
    metadata: { note: parsed.data.note?.trim() || undefined },
  });
  revalidateGrowth();
  return { ok: true };
}

const marketingKitSchema = z.object({
  productId: z.string().min(1),
  marketingKitJson: z.string().min(2).max(100_000),
});

export async function updateProductMarketingKitAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = marketingKitSchema.safeParse({
    productId: formData.get("productId"),
    marketingKitJson: formData.get("marketingKitJson"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  let kit: unknown;
  try {
    kit = JSON.parse(parsed.data.marketingKitJson) as unknown;
  } catch {
    return { ok: false, error: "invalid_input" };
  }
  if (typeof kit !== "object" || kit === null) return { ok: false, error: "invalid_input" };

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { marketingKit: kit as object },
  });
  revalidateGrowth();
  return { ok: true };
}

export async function updateLevelAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const levelId = String(formData.get("levelId") ?? "").trim();
  const minClosedDeals = Number(formData.get("minClosedDeals"));
  if (!levelId || !Number.isFinite(minClosedDeals) || minClosedDeals < 0) {
    return { ok: false, error: "invalid_input" };
  }

  const salaryRaw = formData.get("salaryUsd");
  let salaryUsd: number | null | undefined;
  if (salaryRaw === null || salaryRaw === "") {
    salaryUsd = undefined;
  } else {
    const n = Number(salaryRaw);
    if (!Number.isFinite(n) || n < 0) return { ok: false, error: "invalid_input" };
    salaryUsd = n === 0 ? null : Math.trunc(n);
  }

  await prisma.levelDefinition.update({
    where: { id: levelId },
    data: {
      minClosedDeals: Math.trunc(minClosedDeals),
      ...(salaryUsd === undefined ? {} : { salaryUsd }),
    },
  });

  revalidateGrowth();
  return { ok: true };
}

export async function updateLevelPerksAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const levelId = String(formData.get("levelId") ?? "").trim();
  const perksRaw = String(formData.get("perksLines") ?? "");
  if (!levelId) return { ok: false, error: "invalid_input" };

  const perks = perksRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  await prisma.levelDefinition.update({
    where: { id: levelId },
    data: { perksJson: perks },
  });
  revalidateGrowth();
  return { ok: true };
}

const tierSchema = z.object({
  id: z.string().min(1),
  tier1Bps: z.coerce.number().int().min(0).max(50_000),
  tier2Bps: z.coerce.number().int().min(0).max(50_000),
  tier3Bps: z.coerce.number().int().min(0).max(50_000),
});

export async function updateCommissionTierAdminAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = tierSchema.safeParse({
    id: formData.get("id"),
    tier1Bps: formData.get("tier1Bps"),
    tier2Bps: formData.get("tier2Bps"),
    tier3Bps: formData.get("tier3Bps"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  await prisma.commissionTierConfig.update({
    where: { id: parsed.data.id },
    data: {
      tier1Bps: parsed.data.tier1Bps,
      tier2Bps: parsed.data.tier2Bps,
      tier3Bps: parsed.data.tier3Bps,
    },
  });

  revalidateGrowth();
  return { ok: true };
}

function revalidateGrowth() {
  revalidatePath("/", "layout");
}

const adminCreatePartnerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  phone: z.string().max(32).optional().or(z.literal("")),
  referralCode: z.string().max(16).optional().or(z.literal("")),
});

export async function adminCreatePartnerAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true; partnerId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = adminCreatePartnerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
    referralCode: formData.get("referralCode") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "email_taken" };

  let parentUserId: string | null = null;
  const parentFromForm = String(formData.get("parentUserId") ?? "").trim();
  const networkOwnerId = String(formData.get("networkOwnerUserId") ?? "").trim();
  if (networkOwnerId && parentFromForm) {
    const { listDirectReferralUserIds } = await import("@/lib/growth/partner-network");
    const children = await listDirectReferralUserIds(networkOwnerId);
    const allowed = new Set([networkOwnerId, ...children]);
    if (!allowed.has(parentFromForm)) {
      return { ok: false, error: "invalid_upline_scope" };
    }
  }
  if (parentFromForm) {
    const parentProfile = await prisma.partnerProfile.findUnique({
      where: { userId: parentFromForm },
    });
    if (!parentProfile) return { ok: false, error: "invalid_referral" };
    parentUserId = parentProfile.userId;
  } else {
    const ref = parsed.data.referralCode?.trim();
    if (ref) {
      const parentProfile = await prisma.partnerProfile.findUnique({
        where: { referralCode: ref },
      });
      if (!parentProfile) return { ok: false, error: "invalid_referral" };
      parentUserId = parentProfile.userId;
    }
  }

  const starter = await prisma.levelDefinition.findFirst({ orderBy: { order: "asc" } });
  if (!starter) return { ok: false, error: "missing_seed" };

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const referralCode = await uniqueReferralCode();
    const publicSlug = await uniquePublicSlug(prisma, parsed.data.name);

    const user = await prisma.$transaction(async (tx) => {
      const cardNumber = await nextPartnerCardNumber(tx);
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: parsed.data.name,
          phone: parsed.data.phone?.trim() || null,
          publicSlug,
          role: UserRole.PARTNER,
          isActive: true,
        },
      });
      await tx.partnerProfile.create({
        data: {
          userId: u.id,
          referralCode,
          parentUserId,
          currentLevelId: starter.id,
          cardNumber,
        },
      });
      return u;
    });

    await createNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: "مرحباً بك في T.E.N.E.G.T.A",
      body: "تم إنشاء حسابك. سجّل الدخول وابدأ البناء.",
      link: "/growth/sign-in",
    });

    revalidateGrowth();
    return { ok: true, partnerId: user.id };
  } catch (err) {
    console.error("[adminCreatePartner]", err);
    return { ok: false, error: "server_error" };
  }
}

const adminUpdatePartnerCredentialsSchema = z.object({
  partnerId: z.string().min(1),
  email: z.string().email().max(320),
  newPassword: z.string().max(128).optional().or(z.literal("")),
});

export async function adminUpdatePartnerCredentialsAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = adminUpdatePartnerCredentialsSchema.safeParse({
    partnerId: formData.get("partnerId"),
    email: formData.get("email"),
    newPassword: formData.get("newPassword") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.partnerId },
  });
  if (!user || user.role !== UserRole.PARTNER) {
    return { ok: false, error: "not_found" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return { ok: false, error: "email_taken" };
  }

  const data: { email: string; passwordHash?: string } = { email };
  const pw = parsed.data.newPassword?.trim() ?? "";
  if (pw) {
    if (pw.length < 8) return { ok: false, error: "invalid_input" };
    data.passwordHash = await bcrypt.hash(pw, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  revalidateGrowth();
  return { ok: true };
}

const adminSetPartnerVerifiedSchema = z.object({
  partnerId: z.string().min(1),
  officialDisplayName: z.string().max(80).optional().or(z.literal("")),
});

export async function adminSetPartnerVerifiedAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = adminSetPartnerVerifiedSchema.safeParse({
    partnerId: formData.get("partnerId"),
    officialDisplayName: formData.get("officialDisplayName") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({ where: { id: parsed.data.partnerId } });
  if (!user || user.role !== UserRole.PARTNER) return { ok: false, error: "not_found" };

  const verified = formData.get("isVerifiedOfficial") === "on";
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerifiedOfficial: verified,
      officialDisplayName: parsed.data.officialDisplayName?.trim() || null,
    },
  });
  revalidateGrowth();
  return { ok: true };
}

const adminCreateBadgeSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  type: z.enum(["ADMIN", "AUTO"]),
});

export async function adminCreateBadgeDefinitionAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true; key: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = adminCreateBadgeSchema.safeParse({
    key: formData.get("key"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    type: formData.get("type") ?? "ADMIN",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const exists = await prisma.badgeDefinition.findUnique({ where: { key: parsed.data.key } });
  if (exists) return { ok: false, error: "key_taken" };

  await prisma.badgeDefinition.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      type: parsed.data.type === "AUTO" ? BadgeType.AUTO : BadgeType.ADMIN,
    },
  });
  revalidateGrowth();
  return { ok: true, key: parsed.data.key };
}

export async function togglePartnerActiveFormAction(formData: FormData): Promise<void> {
  await togglePartnerActiveAction(formData);
}

export async function togglePartnerActiveAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return { ok: false, error: "invalid_input" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== UserRole.PARTNER) {
    return { ok: false, error: "not_found" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidateGrowth();
  return { ok: true };
}

const setUplineSchema = z.object({
  partnerId: z.string().min(1),
  parentUserId: z.string().optional().or(z.literal("")),
});

export async function adminSetPartnerUplineFormAction(formData: FormData): Promise<void> {
  await adminSetPartnerUplineAction(undefined, formData);
}

export async function adminSetPartnerUplineAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = setUplineSchema.safeParse({
    partnerId: formData.get("partnerId"),
    parentUserId: formData.get("parentUserId") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const parentRaw = parsed.data.parentUserId?.trim();
  const parentUserId = parentRaw ? parentRaw : null;

  try {
    await setPartnerUpline(parsed.data.partnerId, parentUserId, session.user.id);
    revalidateGrowth();
    return { ok: true };
  } catch (e) {
    if (e instanceof PartnerNetworkError) {
      return { ok: false, error: e.code };
    }
    console.error("[adminSetPartnerUpline]", e);
    return { ok: false, error: "server_error" };
  }
}

const adjustXpSchema = z.object({
  partnerId: z.string().min(1),
  amount: z.coerce.number().int().min(-1_000_000).max(1_000_000),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export async function adminAdjustPartnerXpFormAction(formData: FormData): Promise<void> {
  await adminAdjustPartnerXpAction(formData);
}

export async function adminAdjustPartnerXpAction(
  formData: FormData,
): Promise<
  | { ok: true; newTotalXp: number; newLevelName: string }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = adjustXpSchema.safeParse({
    partnerId: formData.get("partnerId"),
    amount: formData.get("amount"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: parsed.data.partnerId },
    include: { currentLevel: true },
  });
  if (!profile) return { ok: false, error: "not_found" };

  const partnerUser = await prisma.user.findUnique({
    where: { id: parsed.data.partnerId },
    select: { publicSlug: true },
  });

  const nextXp = Math.max(0, profile.totalXp + parsed.data.amount);
  const reasonText = parsed.data.reason?.trim() || "مكافأة من الإدارة";

  await prisma.$transaction(async (tx) => {
    await tx.xpEvent.create({
      data: {
        userId: parsed.data.partnerId,
        amount: parsed.data.amount,
        reason: reasonText,
        source: "manual_admin",
      },
    });
    await tx.partnerProfile.update({
      where: { userId: parsed.data.partnerId },
      data: { totalXp: nextXp },
    });
  });

  await evaluateAutoBadgesForUser(prisma, parsed.data.partnerId);
  const syncResult = await syncPartnerLevel(prisma, parsed.data.partnerId);

  await createNotification(prisma, {
    userId: parsed.data.partnerId,
    type: NotificationType.XP_BOOST,
    title: `+${parsed.data.amount} نقطة قوة`,
    body: reasonText,
    link: "/growth",
    metadata: {
      amount: parsed.data.amount,
      newTotal: nextXp,
      reason: reasonText,
    },
  });

  revalidateGrowth();
  revalidatePartnerSurfaces({ publicSlug: partnerUser?.publicSlug ?? null });

  return {
    ok: true,
    newTotalXp: nextXp,
    newLevelName: syncResult.newLevelName ?? profile.currentLevel.name,
  };
}

export async function adminSetPartnerLevelFormAction(formData: FormData): Promise<void> {
  await adminSetPartnerLevelAction(formData);
}

export async function adminSetPartnerLevelAction(
  formData: FormData,
): Promise<{ ok: true; levelName: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const partnerId = String(formData.get("partnerId") ?? "").trim();
  const levelId = String(formData.get("levelId") ?? "").trim();
  if (!partnerId || !levelId) return { ok: false, error: "invalid_input" };

  const level = await prisma.levelDefinition.findUnique({ where: { id: levelId } });
  if (!level) return { ok: false, error: "level_not_found" };

  const profile = await prisma.partnerProfile.findUnique({ where: { userId: partnerId } });
  if (!profile) return { ok: false, error: "not_found" };

  await prisma.partnerProfile.update({
    where: { userId: partnerId },
    data: { currentLevelId: levelId },
  });

  await createNotification(prisma, {
    userId: partnerId,
    type: NotificationType.LEVEL_UP,
    title: "ترقية مستوى",
    body: `مستواك الآن: ${level.name}`,
    link: "/growth",
  });

  await logActivityEvent(prisma, {
    kind: "level_set_admin",
    actorUserId: partnerId,
    headline: `Level set to ${level.name} by admin`,
    metadata: { levelId, adminId: session.user.id },
  });

  const partnerUser = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { publicSlug: true },
  });

  revalidateGrowth();
  revalidatePartnerSurfaces({ publicSlug: partnerUser?.publicSlug ?? null });
  return { ok: true, levelName: level.name };
}

export async function adminCreateEventAction(
  formData: FormData,
): Promise<{ ok: true; eventId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const { createAdminEvent } = await import("@/lib/growth/admin-create-event");
  const result = await createAdminEvent(
    {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      rules: String(formData.get("rules") ?? ""),
      startAt: String(formData.get("startAt") ?? ""),
      endAt: String(formData.get("endAt") ?? ""),
      maxParticipants: String(formData.get("maxParticipants") ?? ""),
      status: String(formData.get("status") ?? "DRAFT"),
      coverImage: String(formData.get("coverImage") ?? ""),
      milestonesJson: String(formData.get("milestonesJson") ?? "[]"),
    },
    session.user.id,
    session.user.email,
  );

  if (!result.ok) return result;
  return { ok: true, eventId: result.eventId };
}

export async function adminUpdateEventStatusFormAction(formData: FormData): Promise<void> {
  await adminUpdateEventStatusAction(formData);
}

export async function adminUpdateEventStatusAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const eventId = String(formData.get("eventId") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  if (!eventId || !statusRaw) return { ok: false, error: "invalid_input" };

  const status = statusRaw as EventStatus;
  if (!Object.values(EventStatus).includes(status)) {
    return { ok: false, error: "invalid_status" };
  }

  const event = await prisma.growthEvent.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, error: "not_found" };

  await prisma.growthEvent.update({
    where: { id: eventId },
    data: { status },
  });

  if (event.status !== EventStatus.PUBLISHED && status === EventStatus.PUBLISHED) {
    await createNotificationsForAllActivePartners({
      type: NotificationType.EVENT_INVITE,
      title: `فعالية جديدة: ${event.title}`,
      body: event.description.slice(0, 200),
      link: `/growth/events/${event.slug}`,
      eventId: event.id,
    });
  }

  if (status === EventStatus.COMPLETED) {
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId, status: ParticipantStatus.ACCEPTED, progress: 100 },
    });
    for (const p of participants) {
      await prisma.eventParticipant.update({
        where: { id: p.id },
        data: { status: ParticipantStatus.COMPLETED },
      });
    }
  }

  revalidateGrowth();
  return { ok: true };
}

function parseEventMilestones(milestonesJson: string) {
  const parsed = JSON.parse(milestonesJson) as unknown;
  if (!Array.isArray(parsed)) return null;
  return parsed.slice(0, 5).map((m, i) => {
    const row = m as Record<string, unknown>;
    return {
      title: String(row.title ?? `Milestone ${i + 1}`),
      description: row.description ? String(row.description) : undefined,
      xpReward: Number(row.xpReward) || 0,
      order: i,
      requiredProgress: Math.min(100, Math.max(0, Number(row.requiredProgress) || 0)),
    };
  });
}

export async function adminUpdateEventAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const maxRaw = String(formData.get("maxParticipants") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();

  if (!eventId || !title || !description || !rules || !startAtRaw) {
    return { ok: false, error: "invalid_input" };
  }

  const event = await prisma.growthEvent.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participants: true } } },
  });
  if (!event) return { ok: false, error: "not_found" };

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return { ok: false, error: "invalid_date" };
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAt && Number.isNaN(endAt.getTime())) return { ok: false, error: "invalid_date" };

  const maxParticipants = maxRaw ? Number(maxRaw) : null;
  if (maxParticipants != null && (!Number.isFinite(maxParticipants) || maxParticipants < 1)) {
    return { ok: false, error: "invalid_max" };
  }

  let slug = slugRaw || event.slug;
  if (slug !== event.slug) {
    if (event._count.participants > 0) {
      return { ok: false, error: "slug_locked" };
    }
    const taken = await prisma.growthEvent.findFirst({
      where: { slug, id: { not: eventId } },
    });
    if (taken) return { ok: false, error: "slug_taken" };
  }

  const milestonesJson = String(formData.get("milestonesJson") ?? "[]");
  let milestones: ReturnType<typeof parseEventMilestones> = [];
  try {
    milestones = parseEventMilestones(milestonesJson);
    if (!milestones) return { ok: false, error: "invalid_milestones" };
  } catch {
    return { ok: false, error: "invalid_milestones" };
  }

  const coverRaw = String(formData.get("coverImage") ?? "").trim();
  let coverPatch: { coverImage?: string | null } = {};
  if (coverRaw === "__keep__") {
    /* omit */
  } else if (coverRaw) {
    if (coverRaw.length > 1_500_000) return { ok: false, error: "image_too_large" };
    if (!coverRaw.startsWith("data:image/")) return { ok: false, error: "invalid_image" };
    try {
      const { saveEventCoverToPublic } = await import("@/lib/growth/event-cover-storage");
      const publicPath = await saveEventCoverToPublic(eventId, coverRaw);
      coverPatch = { coverImage: publicPath };
    } catch {
      coverPatch = { coverImage: coverRaw };
    }
  } else {
    coverPatch = { coverImage: null };
  }

  await prisma.$transaction(async (tx) => {
    await tx.growthEvent.update({
      where: { id: eventId },
      data: {
        slug,
        title,
        description,
        rules,
        startAt,
        endAt,
        maxParticipants,
        ...coverPatch,
      },
    });
    await tx.eventMilestone.deleteMany({ where: { eventId } });
    if (milestones.length > 0) {
      await tx.eventMilestone.createMany({
        data: milestones.map((m) => ({
          eventId,
          title: m.title,
          description: m.description ?? null,
          xpReward: m.xpReward,
          order: m.order,
          requiredProgress: m.requiredProgress,
        })),
      });
    }
  });

  await logAdminAudit(session.user.id, "update_event", "GrowthEvent", eventId, { title });
  revalidateGrowth();
  return { ok: true };
}

export async function adminUpdateEventFormAction(formData: FormData): Promise<void> {
  await adminUpdateEventAction(formData);
}

export async function adminDeleteEventAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const eventId = String(formData.get("eventId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (!eventId) return { ok: false, error: "invalid_input" };

  const event = await prisma.growthEvent.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participants: true } } },
  });
  if (!event) return { ok: false, error: "not_found" };

  if (event._count.participants > 0 && confirm !== "DELETE") {
    return { ok: false, error: "confirm_required" };
  }

  await prisma.growthEvent.delete({ where: { id: eventId } });
  await logAdminAudit(session.user.id, "delete_event", "GrowthEvent", eventId, {
    title: event.title,
  });
  revalidateGrowth();
  return { ok: true };
}

export async function adminDeleteEventFormAction(formData: FormData): Promise<void> {
  await adminDeleteEventAction(formData);
}

type RewardedMap = Record<string, boolean>;

function parseRewardedMap(raw: unknown): RewardedMap {
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return raw as RewardedMap;
  }
  return {};
}

export async function adminUpdateParticipantProgressFormAction(formData: FormData): Promise<void> {
  await adminUpdateParticipantProgressAction(formData);
}

export async function adminUpdateParticipantProgressAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const eventId = String(formData.get("eventId") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();
  const progress = Number(formData.get("progress"));
  if (!eventId || !userId || !Number.isFinite(progress)) {
    return { ok: false, error: "invalid_input" };
  }
  const clamped = Math.min(100, Math.max(0, Math.trunc(progress)));

  const participant = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!participant) return { ok: false, error: "not_found" };

  const milestones = await prisma.eventMilestone.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
  });

  let rewarded = parseRewardedMap(participant.rewardedMilestones);
  let xpEarned = participant.xpEarned;

  for (const m of milestones) {
    if (clamped >= m.requiredProgress && !rewarded[m.id]) {
      rewarded = { ...rewarded, [m.id]: true };
      if (m.xpReward > 0) {
        xpEarned += m.xpReward;
        await prisma.$transaction(async (tx) => {
          await tx.xpEvent.create({
            data: {
              userId,
              amount: m.xpReward,
              reason: `event:${eventId}:milestone:${m.id}`,
              source: "event",
            },
          });
          await tx.partnerProfile.update({
            where: { userId },
            data: { totalXp: { increment: m.xpReward } },
          });
        });
        await createNotification(prisma, {
          userId,
          type: NotificationType.EVENT_MILESTONE,
          title: `إنجاز: ${m.title}`,
          body: `+${m.xpReward} نقطة قوة`,
          link: `/growth/events`,
        });
      }
    }
  }

  const nextStatus =
    clamped >= 100 ? ParticipantStatus.COMPLETED : participant.status;

  await prisma.eventParticipant.update({
    where: { id: participant.id },
    data: {
      progress: clamped,
      xpEarned,
      rewardedMilestones: rewarded,
      status: nextStatus,
    },
  });

  revalidateGrowth();
  return { ok: true };
}

export async function joinEventAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const acceptRules = formData.get("acceptRules") === "on" || formData.get("acceptRules") === "true";
  if (!eventId || !acceptRules) return { ok: false, error: "rules_required" };

  const limited = await rateLimitGrowthAction("join_event", session.user.id);
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const event = await prisma.growthEvent.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participants: true } } },
  });
  if (!event) return { ok: false, error: "not_found" };
  if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.ACTIVE) {
    return { ok: false, error: "not_open" };
  }
  if (
    event.maxParticipants != null &&
    event._count.participants >= event.maxParticipants
  ) {
    return { ok: false, error: "full" };
  }

  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });
  if (existing) return { ok: false, error: "already_joined" };

  await prisma.eventParticipant.create({
    data: {
      eventId,
      userId: session.user.id,
      status: ParticipantStatus.ACCEPTED,
      joinedAt: new Date(),
      acceptedRules: true,
      acceptedAt: new Date(),
    },
  });

  const { ensureEventRoom, ensureEventMember } = await import("@/lib/growth/chat-room-service");
  const room = await ensureEventRoom(eventId);
  await ensureEventMember(session.user.id, room.id);

  await notifyAdmins({
    type: NotificationType.ADMIN_MESSAGE,
    title: "انضمام لفعالية",
    body: `شريك انضم إلى: ${event.title}`,
    link: `/growth/admin/events`,
  });

  const { applyMissionProgress } = await import("@/lib/growth/missions");
  await applyMissionProgress(prisma, session.user.id, "join_event");

  revalidateGrowth();
  return { ok: true };
}

export async function createEventPostAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!eventId) return { ok: false, error: "invalid_input" };

  const { createEventPost } = await import("@/lib/growth/event-posts");
  const result = await createEventPost(eventId, session.user.id, body, "POST");
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function repostEventPostAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const repostOfId = String(formData.get("repostOfId") ?? "").trim();
  if (!eventId || !repostOfId) return { ok: false, error: "invalid_input" };

  const original = await prisma.eventPost.findFirst({
    where: { id: repostOfId, eventId },
    select: { body: true },
  });
  if (!original) return { ok: false, error: "not_found" };

  const { createEventPost } = await import("@/lib/growth/event-posts");
  const result = await createEventPost(
    eventId,
    session.user.id,
    original.body,
    "REPOST",
    repostOfId,
  );
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function toggleEventPostLikeAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  if (!postId) return { ok: false, error: "invalid_input" };

  const { toggleEventPostLike } = await import("@/lib/growth/event-posts");
  const result = await toggleEventPostLike(postId, session.user.id);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function createEventPostCommentAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!postId) return { ok: false, error: "invalid_input" };

  const { createEventPostComment } = await import("@/lib/growth/event-posts");
  const result = await createEventPostComment(postId, session.user.id, body);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function updateEventPostAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!postId) return { ok: false, error: "invalid_input" };

  const { updateEventPost } = await import("@/lib/growth/event-posts");
  const result = await updateEventPost(postId, session.user.id, body);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function deleteEventPostAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const postId = String(formData.get("postId") ?? "").trim();
  if (!postId) return { ok: false, error: "invalid_input" };

  const { deleteEventPost } = await import("@/lib/growth/event-posts");
  const result = await deleteEventPost(postId, session.user.id);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function updateEventPostCommentAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const commentId = String(formData.get("commentId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!commentId) return { ok: false, error: "invalid_input" };

  const { updateEventPostComment } = await import("@/lib/growth/event-posts");
  const result = await updateEventPostComment(commentId, session.user.id, body);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

export async function deleteEventPostCommentAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const commentId = String(formData.get("commentId") ?? "").trim();
  if (!commentId) return { ok: false, error: "invalid_input" };

  const { deleteEventPostComment } = await import("@/lib/growth/event-posts");
  const result = await deleteEventPostComment(commentId, session.user.id);
  if (!result.ok) return result;

  revalidateGrowth();
  return { ok: true };
}

const sendNotifSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  link: z.string().max(500).optional().or(z.literal("")),
});

export async function adminSendNotificationFormAction(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const result = await adminSendNotificationAction(formData);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function adminSendNotificationAction(
  formData: FormData,
): Promise<{ ok: true; sent: number } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = sendNotifSchema.safeParse({
    email: formData.get("email") ?? "",
    title: formData.get("title"),
    body: formData.get("body"),
    link: formData.get("link") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const link = parsed.data.link?.trim() || null;
  let sent = 0;

  if (parsed.data.email?.trim()) {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });
    if (!user) return { ok: false, error: "user_not_found" };
    const n = await createNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: parsed.data.title,
      body: parsed.data.body,
      link,
    });
    if (n) sent = 1;
  } else {
    sent = await createNotificationsForAllActivePartners({
      type: NotificationType.SYSTEM,
      title: parsed.data.title,
      body: parsed.data.body,
      link: link ?? undefined,
    });
  }

  revalidateGrowth();
  return { ok: true, sent };
}

const partnerProfileSchema = z.object({
  displayTitle: z.string().max(60).optional().or(z.literal("")),
  bio: z.string().max(280).optional().or(z.literal("")),
  whatsapp: z.string().max(120).optional().or(z.literal("")),
  linkedin: z.string().max(500).optional().or(z.literal("")),
  twitter: z.string().max(500).optional().or(z.literal("")),
  locale: z.string().min(2).max(5),
});

export async function updatePartnerProfileAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = partnerProfileSchema.safeParse({
    displayTitle: formData.get("displayTitle") ?? "",
    bio: formData.get("bio") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    twitter: formData.get("twitter") ?? "",
    locale: formData.get("locale") ?? "ar",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const social: Record<string, string> = {};
  const w = parsed.data.whatsapp?.trim();
  const li = parsed.data.linkedin?.trim();
  const tw = parsed.data.twitter?.trim();
  if (w) social.whatsapp = w;
  if (li) social.linkedin = li;
  if (tw) social.twitter = tw;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { publicSlug: true, partnerProfile: { select: { id: true } } },
  });
  if (!user?.partnerProfile) return { ok: false, error: "invalid_input" };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { bio: parsed.data.bio?.trim() || null },
    }),
    prisma.partnerProfile.update({
      where: { id: user.partnerProfile.id },
      data: {
        displayTitle: parsed.data.displayTitle?.trim() || null,
        socialLinks:
          Object.keys(social).length > 0 ? social : Prisma.JsonNull,
      },
    }),
  ]);

  revalidateGrowth();
  if (user.publicSlug) {
    revalidatePath(`/${parsed.data.locale}/growth/profile/${user.publicSlug}`);
  }
  return { ok: true };
}

export async function updatePartnerAvatarAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  try {
    const preset = String(formData.get("avatarPreset") ?? "").trim() || null;
    const raw = String(formData.get("avatarUrl") ?? "").trim();
    const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
    if (!raw && preset) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null, avatarPreset: preset },
      });
      revalidateGrowth();
      revalidatePath(`/${locale}/growth/settings`);
      return { ok: true };
    }
    if (!raw) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: null, avatarPreset: null },
      });
      revalidateGrowth();
      revalidatePath(`/${locale}/growth/settings`);
      return { ok: true };
    }
    if (raw.length > 900_000 || !raw.startsWith("data:image/")) {
      return { ok: false, error: "invalid_image" };
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: raw, avatarPreset: preset },
    });
    revalidateGrowth();
    revalidatePath(`/${locale}/growth/settings`);
    return { ok: true };
  } catch (err) {
    console.error("[updatePartnerAvatar]", err);
    return { ok: false, error: "server_error" };
  }
}

export async function adminUpdateOfficialProfileAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const isVerified = formData.get("isVerifiedOfficial") === "on";
  const officialDisplayName = String(formData.get("officialDisplayName") ?? "").trim() || null;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { isVerifiedOfficial: isVerified, officialDisplayName },
  });
  revalidateGrowth();
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidateGrowth();
}

export async function completeOnboardingStepFormAction(formData: FormData): Promise<void> {
  await completeOnboardingStepAction(formData);
}

export async function completeOnboardingStepAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }
  const step = String(formData.get("step") ?? "").trim();
  if (!step) return { ok: false, error: "invalid_input" };

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, onboardingSteps: true },
  });
  if (!profile) return { ok: false, error: "not_partner" };

  const prev =
    profile.onboardingSteps && typeof profile.onboardingSteps === "object"
      ? (profile.onboardingSteps as Record<string, boolean>)
      : {};
  await prisma.partnerProfile.update({
    where: { id: profile.id },
    data: { onboardingSteps: { ...prev, [step]: true } },
  });
  revalidateGrowth();
  return { ok: true };
}

const rewardRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  windowMs: z.coerce.number().int().positive(),
  rankMin: z.coerce.number().int().min(1),
  rankMax: z.coerce.number().int().min(1),
  bonusCents: z.coerce.number().int().min(0),
  badgeKey: z.string().max(64).optional().or(z.literal("")),
  active: z.coerce.boolean().optional(),
});

export async function adminUpsertRewardRuleFormAction(formData: FormData): Promise<void> {
  await adminUpsertRewardRuleAction(formData);
}

export async function adminUpsertRewardRuleAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = rewardRuleSchema.safeParse({
    id: formData.get("id") ?? undefined,
    name: formData.get("name"),
    windowMs: formData.get("windowMs"),
    rankMin: formData.get("rankMin"),
    rankMax: formData.get("rankMax"),
    bonusCents: formData.get("bonusCents"),
    badgeKey: formData.get("badgeKey") ?? "",
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const d = parsed.data;
  const badgeKey = d.badgeKey?.trim() || null;

  if (d.id) {
    await prisma.leaderboardRewardRule.update({
      where: { id: d.id },
      data: {
        name: d.name,
        windowMs: BigInt(d.windowMs),
        rankMin: d.rankMin,
        rankMax: d.rankMax,
        bonusCents: d.bonusCents,
        badgeKey,
        active: d.active ?? true,
      },
    });
  } else {
    await prisma.leaderboardRewardRule.create({
      data: {
        name: d.name,
        windowMs: BigInt(d.windowMs),
        rankMin: d.rankMin,
        rankMax: d.rankMax,
        bonusCents: d.bonusCents,
        badgeKey,
        active: d.active ?? true,
      },
    });
  }
  const { logAdminAudit } = await import("@/lib/growth/audit-log");
  await logAdminAudit(session.user.id, "upsert_reward_rule", "LeaderboardRewardRule", d.id, {
    name: d.name,
  });
  revalidateGrowth();
  return { ok: true };
}

export async function adminDeleteRewardRuleAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.leaderboardRewardRule.delete({ where: { id } }).catch(() => null);
  const { logAdminAudit } = await import("@/lib/growth/audit-log");
  await logAdminAudit(session.user.id, "delete_reward_rule", "LeaderboardRewardRule", id);
  revalidateGrowth();
}

const missionSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  xpReward: z.coerce.number().int().min(0),
  sortOrder: z.coerce.number().int().min(0).default(0),
  chainGroup: z.string().max(64).optional().or(z.literal("")),
  active: z.coerce.boolean().optional(),
  criteriaJson: z.string().min(2),
});

export async function adminUpsertMissionFormAction(formData: FormData): Promise<void> {
  await adminUpsertMissionAction(formData);
}

export async function adminUpsertMissionAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }
  const parsed = missionSchema.safeParse({
    id: formData.get("id") ?? undefined,
    key: formData.get("key"),
    title: formData.get("title"),
    xpReward: formData.get("xpReward"),
    sortOrder: formData.get("sortOrder"),
    chainGroup: formData.get("chainGroup") ?? "",
    active: formData.get("active") === "on" || formData.get("active") === "true",
    criteriaJson: formData.get("criteriaJson"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  let criteria: unknown;
  try {
    criteria = JSON.parse(parsed.data.criteriaJson);
  } catch {
    return { ok: false, error: "invalid_criteria" };
  }
  const chainGroup = parsed.data.chainGroup?.trim() || null;
  const payload = {
    key: parsed.data.key,
    title: parsed.data.title,
    xpReward: parsed.data.xpReward,
    sortOrder: parsed.data.sortOrder,
    chainGroup,
    active: parsed.data.active ?? true,
    criteria: criteria as object,
  };
  if (parsed.data.id) {
    await prisma.missionDefinition.update({
      where: { id: parsed.data.id },
      data: payload,
    });
  } else {
    await prisma.missionDefinition.create({ data: payload });
  }
  const { logAdminAudit } = await import("@/lib/growth/audit-log");
  await logAdminAudit(session.user.id, "upsert_mission", "MissionDefinition", parsed.data.id, {
    key: parsed.data.key,
  });
  revalidateGrowth();
  return { ok: true };
}

export async function adminDeleteMissionAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.missionDefinition.delete({ where: { id } }).catch(() => null);
  const { logAdminAudit } = await import("@/lib/growth/audit-log");
  await logAdminAudit(session.user.id, "delete_mission", "MissionDefinition", id);
  revalidateGrowth();
}

export async function adminApproveMissionRewardAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const kind = String(formData.get("kind") ?? "") as "mission" | "chain";
  const id = String(formData.get("id") ?? "");
  if (!id || (kind !== "mission" && kind !== "chain")) return;
  const { adminApproveMissionReward } = await import("@/lib/growth/mission-rewards");
  await adminApproveMissionReward(session.user.id, kind, id);
  revalidateGrowth();
}

export async function adminRejectMissionRewardAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const kind = String(formData.get("kind") ?? "") as "mission" | "chain";
  const id = String(formData.get("id") ?? "");
  if (!id || (kind !== "mission" && kind !== "chain")) return;
  const { adminRejectMissionReward } = await import("@/lib/growth/mission-rewards");
  await adminRejectMissionReward(session.user.id, kind, id);
  revalidateGrowth();
}

export async function dailyCheckInAction(
  _prev: unknown,
  _formData: FormData,
): Promise<
  | { ok: true; xp: number; bonusXp: number; totalDays: number }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const limited = await rateLimitGrowthAction("daily_checkin", session.user.id);
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const userId = session.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let streak = await prisma.userStreak.findUnique({ where: { userId } });
  if (streak?.lastCheckInDate) {
    const last = new Date(streak.lastCheckInDate);
    last.setUTCHours(0, 0, 0, 0);
    if (last.getTime() === today.getTime()) {
      return { ok: false, error: "already_checked_in" };
    }
  }

  const priorCheckIns = await prisma.xpEvent.count({
    where: { userId, reason: "daily_check_in" },
  });
  const totalDays = priorCheckIns + 1;
  let bonusXp = 0;
  for (const m of GAME_CONFIG.checkInMilestones) {
    if (totalDays === m.days) bonusXp += m.bonusXp;
  }
  const xp = GAME_CONFIG.dailyCheckInXp + bonusXp;

  await prisma.$transaction(async (tx) => {
    await tx.partnerProfile.update({
      where: { userId },
      data: { totalXp: { increment: xp } },
    });
    await tx.xpEvent.create({
      data: {
        userId,
        amount: xp,
        reason: "daily_check_in",
        source: "hub",
      },
    });
    if (streak) {
      await tx.userStreak.update({
        where: { userId },
        data: { lastCheckInDate: today },
      });
    } else {
      await tx.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckInDate: today,
        },
      });
    }
  });

  if (bonusXp > 0) {
    const milestone = GAME_CONFIG.checkInMilestones.find((m) => m.days === totalDays);
    await createNotification(prisma, {
      userId,
      type: NotificationType.XP_BOOST,
      title: "معلم تسجيل يومي",
      body: milestone
        ? `يوم ${totalDays}: +${bonusXp} نقطة إضافية`
        : `+${bonusXp} نقطة`,
      link: "/growth",
      metadata: { totalDays, bonusXp },
    });
  }

  await touchActivityDay(userId);
  await syncPartnerLevel(prisma, userId);
  await evaluateAutoBadgesForUser(prisma, userId);
  await grantNightOwlIfEligible(prisma, userId, new Date());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicSlug: true },
  });
  revalidateGrowth();
  revalidatePartnerSurfaces({ publicSlug: user?.publicSlug ?? null });

  return { ok: true, xp, bonusXp, totalDays };
}

export async function adminCloseSeasonFormAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return;

  const { closeLeaderboardSeason } = await import("@/lib/growth/season-archive");
  await closeLeaderboardSeason(seasonId, session.user.id);
  revalidateGrowth();
}

const territorySchema = z.object({
  locale: z.string().min(2).max(5),
  territory: z.string().min(1).max(32),
});

export async function updatePartnerTerritoryAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = territorySchema.safeParse({
    locale: formData.get("locale"),
    territory: formData.get("territory"),
  });
  if (!parsed.success || !isTerritoryKey(parsed.data.territory)) {
    return { ok: false, error: "invalid_input" };
  }

  await prisma.partnerProfile.update({
    where: { userId: session.user.id },
    data: { territory: parsed.data.territory },
  });

  revalidatePath(`/${parsed.data.locale}/growth/map`);
  revalidatePath(`/${parsed.data.locale}/growth/settings`);
  return { ok: true };
}

const hallLegendSchema = z.object({
  partnerUserId: z.string().min(1),
  achievement: z.string().min(2).max(200),
  quote: z.string().max(300).optional().or(z.literal("")),
  locale: z.string().min(2).max(5),
});

export async function addToHallOfLegendAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = hallLegendSchema.safeParse({
    partnerUserId: formData.get("partnerUserId"),
    achievement: formData.get("achievement"),
    quote: formData.get("quote") ?? "",
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const count = await prisma.hallOfLegend.count();
  if (count >= 10) return { ok: false, error: "hall_full" };

  const existing = await prisma.hallOfLegend.findUnique({
    where: { partnerId: parsed.data.partnerUserId },
  });
  if (existing) return { ok: false, error: "already_in_hall" };

  const rank = await nextLegendRank();
  const monthAdded = new Date().toISOString().slice(0, 7);

  await prisma.hallOfLegend.create({
    data: {
      partnerId: parsed.data.partnerUserId,
      rank,
      monthAdded,
      achievement: parsed.data.achievement.trim(),
      quote: parsed.data.quote?.trim() || null,
      addedById: session.user.id,
    },
  });

  await createNotification(prisma, {
    userId: parsed.data.partnerUserId,
    type: NotificationType.SYSTEM,
    title: "قاعة الأساطير",
    body: "تم إدخالك في قاعة أساطير T.E.N.E.G.T.A",
    link: "/growth/legends",
  });

  revalidatePath(`/${parsed.data.locale}/growth/legends`);
  revalidatePath(`/${parsed.data.locale}/growth/admin/legends`);
  return { ok: true };
}
