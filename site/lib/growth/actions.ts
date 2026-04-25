"use server";

import { revalidatePath } from "next/cache";
import { UserRole, DealStatus, PayoutStatus, BadgeType } from "@prisma/client";
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
  revalidatePath("/");
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
