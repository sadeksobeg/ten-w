"use server";

import { revalidatePath } from "next/cache";
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
import { grantAdminBadge } from "@/lib/growth/badges";
import { applyMissionProgress } from "@/lib/growth/missions";
import { logActivityEvent } from "@/lib/growth/activity";
import { applyMonthlyLeaderboardBonuses } from "@/lib/growth/rewards";
import { partnerOverrideModelsAvailable } from "@/lib/growth/prisma-optional";
import { createNotification, createNotificationsForAllActivePartners, notifyAdmins } from "@/lib/growth/notify";
import { uniquePublicSlug, randomSlugSuffix } from "@/lib/growth/public-slug";
import {
  PartnerNetworkError,
  setPartnerUpline,
} from "@/lib/growth/partner-network";
import { logAdminAudit } from "@/lib/growth/audit-log";

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

  const res = await closeDealAsAdmin({
    dealId,
    actorUserId: session.user.id,
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
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

export async function updateProductAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    commissionBaseUsd: formData.get("commissionBaseUsd"),
    priceUsd: formData.get("priceUsd"),
  });
  if (!parsed.success) return;

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      priceCents: Math.round(parsed.data.priceUsd * 100),
      commissionBaseCents: Math.round(parsed.data.commissionBaseUsd * 100),
    },
  });

  revalidatePath("/");
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
  if (!badge || badge.type !== BadgeType.ADMIN) {
    return { ok: false, error: "invalid_badge" };
  }

  const granted = await grantAdminBadge(prisma, user.id, badge.key, session.user.id);
  if (!granted) return { ok: false, error: "badge_already_granted" };

  await createNotification(prisma, {
    userId: user.id,
    type: NotificationType.BADGE_EARNED,
    title: "شارة جديدة",
    body: badge.name,
    link: "/growth",
    metadata: { badgeKey: badge.key },
  });
  revalidateGrowth();
  return { ok: true, badgeName: badge.name, badgeKey: badge.key };
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
  revalidatePath("/");
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

const overrideSchema = z.object({
  partnerEmail: z.string().email(),
  productSlug: z.string().max(64).optional().or(z.literal("")),
  commissionBaseUsd: z.coerce.number().min(0).max(1_000_000),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function upsertPartnerCommissionOverrideAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }
  if (!partnerOverrideModelsAvailable(prisma)) {
    return;
  }
  const parsed = overrideSchema.safeParse({
    partnerEmail: formData.get("partnerEmail"),
    productSlug: formData.get("productSlug") ?? "",
    commissionBaseUsd: formData.get("commissionBaseUsd"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return;

  const partner = await prisma.user.findUnique({
    where: { email: parsed.data.partnerEmail.toLowerCase().trim() },
    include: { partnerProfile: true },
  });
  if (!partner?.partnerProfile) return;

  const slug = parsed.data.productSlug?.trim();
  let productId: string | null = null;
  if (slug) {
    const prod = await prisma.product.findUnique({ where: { slug } });
    if (!prod) return;
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
  revalidatePath("/");
}

const manualBonusSchema = z.object({
  email: z.string().email(),
  amountUsd: z.coerce.number().min(1).max(1_000_000),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function grantManualBonusAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }
  const parsed = manualBonusSchema.safeParse({
    email: formData.get("email"),
    amountUsd: formData.get("amountUsd"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user) return;

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
  revalidatePath("/");
}

const marketingKitSchema = z.object({
  productId: z.string().min(1),
  marketingKitJson: z.string().min(2).max(100_000),
});

export async function updateProductMarketingKitAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }
  const parsed = marketingKitSchema.safeParse({
    productId: formData.get("productId"),
    marketingKitJson: formData.get("marketingKitJson"),
  });
  if (!parsed.success) return;

  let kit: unknown;
  try {
    kit = JSON.parse(parsed.data.marketingKitJson) as unknown;
  } catch {
    return;
  }
  if (typeof kit !== "object" || kit === null) return;

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { marketingKit: kit as object },
  });
  revalidatePath("/");
}

export async function updateLevelAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const levelId = String(formData.get("levelId") ?? "").trim();
  const minClosedDeals = Number(formData.get("minClosedDeals"));
  if (!levelId || !Number.isFinite(minClosedDeals) || minClosedDeals < 0) {
    return;
  }

  const salaryRaw = formData.get("salaryUsd");
  let salaryUsd: number | null | undefined;
  if (salaryRaw === null || salaryRaw === "") {
    salaryUsd = undefined;
  } else {
    const n = Number(salaryRaw);
    if (!Number.isFinite(n) || n < 0) return;
    salaryUsd = n === 0 ? null : Math.trunc(n);
  }

  await prisma.levelDefinition.update({
    where: { id: levelId },
    data: {
      minClosedDeals: Math.trunc(minClosedDeals),
      ...(salaryUsd === undefined ? {} : { salaryUsd }),
    },
  });

  revalidatePath("/");
}

const tierSchema = z.object({
  id: z.string().min(1),
  tier1Bps: z.coerce.number().int().min(0).max(50_000),
  tier2Bps: z.coerce.number().int().min(0).max(50_000),
  tier3Bps: z.coerce.number().int().min(0).max(50_000),
});

export async function updateCommissionTierAdminAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const parsed = tierSchema.safeParse({
    id: formData.get("id"),
    tier1Bps: formData.get("tier1Bps"),
    tier2Bps: formData.get("tier2Bps"),
    tier3Bps: formData.get("tier3Bps"),
  });
  if (!parsed.success) return;

  await prisma.commissionTierConfig.update({
    where: { id: parsed.data.id },
    data: {
      tier1Bps: parsed.data.tier1Bps,
      tier2Bps: parsed.data.tier2Bps,
      tier3Bps: parsed.data.tier3Bps,
    },
  });

  revalidatePath("/");
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

  const nextXp = Math.max(0, profile.totalXp + parsed.data.amount);
  await prisma.$transaction(async (tx) => {
    await tx.xpEvent.create({
      data: {
        userId: parsed.data.partnerId,
        amount: parsed.data.amount,
        reason: parsed.data.reason?.trim() || "admin_adjustment",
        source: "manual_admin",
      },
    });
    await tx.partnerProfile.update({
      where: { userId: parsed.data.partnerId },
      data: { totalXp: nextXp },
    });
  });

  const updated = await prisma.partnerProfile.findUnique({
    where: { userId: parsed.data.partnerId },
    include: { currentLevel: true },
  });

  await createNotification(prisma, {
    userId: parsed.data.partnerId,
    type: NotificationType.XP_BOOST,
    title: "تحديث نقاط القوة",
    body: `${parsed.data.amount >= 0 ? "+" : ""}${parsed.data.amount} نقطة قوة`,
    link: "/growth",
  });

  revalidateGrowth();
  return {
    ok: true,
    newTotalXp: nextXp,
    newLevelName: updated?.currentLevel.name ?? profile.currentLevel.name,
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

  revalidateGrowth();
  return { ok: true, levelName: level.name };
}

function eventSlugFromTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return `${base || "event"}-${randomSlugSuffix()}`;
}

export async function adminCreateEventAction(
  formData: FormData,
): Promise<{ ok: true; eventId: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "unauthorized" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();
  const startAtRaw = String(formData.get("startAt") ?? "").trim();
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const maxRaw = String(formData.get("maxParticipants") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "DRAFT").trim();

  if (!title || !description || !rules || !startAtRaw) {
    return { ok: false, error: "invalid_input" };
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return { ok: false, error: "invalid_date" };

  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  if (endAt && Number.isNaN(endAt.getTime())) return { ok: false, error: "invalid_date" };

  const maxParticipants = maxRaw ? Number(maxRaw) : null;
  if (maxParticipants != null && (!Number.isFinite(maxParticipants) || maxParticipants < 1)) {
    return { ok: false, error: "invalid_max" };
  }

  const status =
    statusRaw === "PUBLISHED" ? EventStatus.PUBLISHED : EventStatus.DRAFT;

  const milestonesJson = String(formData.get("milestonesJson") ?? "[]");
  let milestones: Array<{
    title: string;
    description?: string;
    xpReward: number;
    order: number;
    requiredProgress: number;
  }> = [];
  try {
    const parsed = JSON.parse(milestonesJson) as unknown;
    if (Array.isArray(parsed)) {
      milestones = parsed
        .slice(0, 5)
        .map((m, i) => {
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
  } catch {
    return { ok: false, error: "invalid_milestones" };
  }

  let slug = eventSlugFromTitle(title);
  for (let i = 0; i < 10; i += 1) {
    const exists = await prisma.growthEvent.findUnique({ where: { slug } });
    if (!exists) break;
    slug = eventSlugFromTitle(title);
  }

  const coverRaw = String(formData.get("coverImage") ?? "").trim();
  let coverImage: string | null = null;
  if (coverRaw) {
    if (coverRaw.length > 2_800_000) return { ok: false, error: "image_too_large" };
    if (!coverRaw.startsWith("data:image/")) return { ok: false, error: "invalid_image" };
    coverImage = coverRaw;
  }

  const event = await prisma.$transaction(async (tx) => {
    const ev = await tx.growthEvent.create({
      data: {
        slug,
        title,
        description,
        rules,
        startAt,
        endAt,
        maxParticipants,
        coverImage,
        status,
        createdById: session.user!.id,
      },
    });
    if (milestones.length > 0) {
      await tx.eventMilestone.createMany({
        data: milestones.map((m) => ({
          eventId: ev.id,
          title: m.title,
          description: m.description ?? null,
          xpReward: m.xpReward,
          order: m.order,
          requiredProgress: m.requiredProgress,
        })),
      });
    }
    return ev;
  });

  if (status === EventStatus.PUBLISHED) {
    await createNotificationsForAllActivePartners({
      type: NotificationType.EVENT_INVITE,
      title: `فعالية جديدة: ${title}`,
      body: description.slice(0, 200),
      link: `/growth/events/${slug}`,
      eventId: event.id,
    });
  }

  revalidateGrowth();
  return { ok: true, eventId: event.id };
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
    if (coverRaw.length > 2_800_000) return { ok: false, error: "image_too_large" };
    if (!coverRaw.startsWith("data:image/")) return { ok: false, error: "invalid_image" };
    coverPatch = { coverImage: coverRaw };
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

  await notifyAdmins({
    type: NotificationType.ADMIN_MESSAGE,
    title: "انضمام لفعالية",
    body: `شريك انضم إلى: ${event.title}`,
    link: `/growth/admin/events`,
  });

  revalidateGrowth();
  return { ok: true };
}

const sendNotifSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  link: z.string().max(500).optional().or(z.literal("")),
});

export async function adminSendNotificationFormAction(formData: FormData): Promise<void> {
  await adminSendNotificationAction(formData);
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
  const raw = String(formData.get("avatarUrl") ?? "").trim();
  if (!raw) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: null },
    });
    revalidateGrowth();
    return { ok: true };
  }
  if (raw.length > 2_800_000 || !raw.startsWith("data:image/")) {
    return { ok: false, error: "invalid_image" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: raw },
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

export async function adminCloseSeasonFormAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return;
  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return;

  const { closeLeaderboardSeason } = await import("@/lib/growth/season-archive");
  await closeLeaderboardSeason(seasonId, session.user.id);
  revalidateGrowth();
}
