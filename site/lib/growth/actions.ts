"use server";

import { revalidatePath } from "next/cache";
import {
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
): Promise<{ ok: true } | { ok: false; error: string }> {
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
  return { ok: true };
}

const addLeadSchema = z.object({
  productId: z.string().min(1),
  clientLabel: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function addLeadDealAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return;
  }

  const parsed = addLeadSchema.safeParse({
    productId: formData.get("productId"),
    clientLabel: formData.get("clientLabel") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return;

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || !product.active) {
    return;
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

  revalidatePath("/");
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

export async function requestPayoutAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PARTNER) {
    return;
  }

  const parsed = payoutSchema.safeParse({
    amountUsd: formData.get("amountUsd"),
    method: formData.get("method") ?? "",
  });
  if (!parsed.success) return;

  const cents = parsed.data.amountUsd * 100;
  await prisma.payoutRequest.create({
    data: {
      userId: session.user.id,
      amountCents: cents,
      status: PayoutStatus.PENDING,
      method: parsed.data.method?.trim() || null,
    },
  });

  revalidatePath("/");
}

export async function closeDealAdminFormAction(formData: FormData): Promise<void> {
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return;
  await closeDealAdminAction(dealId);
}

export async function markDealLostAdminFormAction(formData: FormData): Promise<void> {
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) return;
  await markDealLostAdminAction(dealId);
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

export async function approvePayoutAdminFormAction(formData: FormData): Promise<void> {
  const parsed = payoutActionSchema.safeParse({
    payoutId: formData.get("payoutId"),
  });
  if (!parsed.success) return;
  await updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.APPROVED);
}

export async function rejectPayoutAdminFormAction(formData: FormData): Promise<void> {
  const parsed = payoutActionSchema.safeParse({
    payoutId: formData.get("payoutId"),
  });
  if (!parsed.success) return;
  await updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.REJECTED);
}

export async function markPayoutPaidAdminFormAction(formData: FormData): Promise<void> {
  const parsed = payoutActionSchema.safeParse({
    payoutId: formData.get("payoutId"),
  });
  if (!parsed.success) return;
  await updatePayoutStatusAdminAction(parsed.data.payoutId, PayoutStatus.PAID);
}

async function updatePayoutStatusAdminAction(
  payoutId: string,
  status: PayoutStatus,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const payout = await prisma.payoutRequest.findUnique({ where: { id: payoutId } });
  if (!payout) return;

  if (status === PayoutStatus.APPROVED && payout.status !== PayoutStatus.PENDING) {
    return;
  }
  if (status === PayoutStatus.REJECTED && payout.status === PayoutStatus.PAID) {
    return;
  }
  if (status === PayoutStatus.PAID && payout.status !== PayoutStatus.APPROVED) {
    return;
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

export async function assignAdminBadgeAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const parsed = assignBadgeSchema.safeParse({
    email: formData.get("email"),
    badgeKey: formData.get("badgeKey"),
  });
  if (!parsed.success) return;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user) return;

  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: parsed.data.badgeKey },
  });
  if (!badge || badge.type !== BadgeType.ADMIN) {
    return;
  }

  await grantAdminBadge(prisma, user.id, badge.key, session.user.id);
  await createNotification(prisma, {
    userId: user.id,
    type: NotificationType.BADGE_EARNED,
    title: "شارة جديدة",
    body: badge.name,
    link: "/growth",
    metadata: { badgeKey: badge.key },
  });
  revalidateGrowth();
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
  const ref = parsed.data.referralCode?.trim();
  if (ref) {
    const parentProfile = await prisma.partnerProfile.findUnique({
      where: { referralCode: ref },
    });
    if (!parentProfile) return { ok: false, error: "invalid_referral" };
    parentUserId = parentProfile.userId;
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
