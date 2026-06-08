import { NextResponse } from "next/server";
import { DealStatus, NotificationType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimitContact } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendOrderNotificationEmail, isSmtpConfigured, getContactEmailTo } from "@/lib/contact-smtp";
import {
  computeOrderPrice,
  featureLabel,
  productFeaturesForSlug,
  type ProductFeatureOption,
} from "@/lib/growth/product-features";
import {
  resolvePartnerFromCreatorSlug,
  resolvePartnerFromDiscountCode,
} from "@/lib/growth/resolve-order-partner";
import { createNotification } from "@/lib/growth/notify";

const bodySchema = z.object({
  locale: z.enum(["ar", "en", "fr"]).default("ar"),
  productId: z.string().min(1),
  selectedFeatureIds: z.array(z.string()).default([]),
  discountCode: z.string().max(20).optional(),
  creatorSlug: z.string().max(80).optional(),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().max(320),
  clientPhone: z.string().max(40).optional(),
  company: z.string().max(200).optional(),
  notes: z.string().max(4000).optional(),
  companyWebsite: z.string().optional(),
  turnstileToken: z.string().max(4000).optional(),
});

function parseFeatures(raw: unknown, slug: string): ProductFeatureOption[] {
  if (raw && typeof raw === "object" && "features" in raw) {
    const cfg = raw as { features: ProductFeatureOption[] };
    if (Array.isArray(cfg.features)) return cfg.features;
  }
  return productFeaturesForSlug(slug).features;
}

export async function POST(req: Request) {
  if (!isSmtpConfigured() || !getContactEmailTo()) {
    return NextResponse.json(
      { ok: false, error: "service_unconfigured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const limited = await rateLimitContact(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.companyWebsite && parsed.data.companyWebsite.length > 0) {
    return NextResponse.json({ ok: true, orderId: "honeypot" });
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstileToken(parsed.data.turnstileToken ?? "");
    if (!ok) {
      return NextResponse.json({ ok: false, error: "turnstile_failed" }, { status: 400 });
    }
  }

  const product = await prisma.product.findFirst({
    where: {
      id: parsed.data.productId,
      active: true,
      publicVisible: true,
    },
  });

  if (!product) {
    return NextResponse.json({ ok: false, error: "invalid_product" }, { status: 400 });
  }

  const features = parseFeatures(product.featuresJson, product.slug);
  const validFeatureIds = new Set(features.map((f) => f.id));
  const selectedFeatureIds = parsed.data.selectedFeatureIds.filter((id) =>
    validFeatureIds.has(id),
  );

  let partner = null;
  if (parsed.data.discountCode?.trim()) {
    partner = await resolvePartnerFromDiscountCode(parsed.data.discountCode);
  } else if (parsed.data.creatorSlug?.trim()) {
    partner = await resolvePartnerFromCreatorSlug(parsed.data.creatorSlug);
  }

  const discountBps = partner?.discountBps ?? 0;
  const pricing = computeOrderPrice({
    basePriceCents: product.priceCents,
    selectedFeatureIds,
    features,
    discountBps,
  });

  const selectedFeaturesPayload = pricing.selectedFeatures.map((f) => ({
    featureId: f.id,
    label: featureLabel(f, parsed.data.locale),
    priceDeltaCents: f.priceDeltaCents,
  }));

  const clientLabel = [
    parsed.data.clientName,
    parsed.data.company ? `(${parsed.data.company})` : null,
    parsed.data.clientEmail,
  ]
    .filter(Boolean)
    .join(" ");

  const dealNotes = [
    parsed.data.notes?.trim(),
    partner ? `كود الحسم: ${partner.discountCode}` : null,
    selectedFeaturesPayload.length
      ? `ميزات: ${selectedFeaturesPayload.map((f) => f.label).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.clientOrder.create({
      data: {
        locale: parsed.data.locale,
        productId: product.id,
        partnerId: partner?.userId ?? null,
        clientName: parsed.data.clientName,
        clientEmail: parsed.data.clientEmail,
        clientPhone: parsed.data.clientPhone?.trim() || null,
        company: parsed.data.company?.trim() || null,
        selectedFeatures: selectedFeaturesPayload,
        basePriceCents: pricing.subtotalCents,
        discountBps,
        discountCents: pricing.discountCents,
        finalPriceCents: pricing.finalPriceCents,
        discountCode: partner?.discountCode ?? parsed.data.discountCode?.trim().toUpperCase() ?? null,
        notes: parsed.data.notes?.trim() || null,
      },
    });

    let dealId: string | null = null;
    if (partner) {
      const deal = await tx.deal.create({
        data: {
          partnerId: partner.userId,
          productId: product.id,
          status: DealStatus.PENDING,
          saleAmountCents: pricing.finalPriceCents,
          clientLabel,
          notes: dealNotes || null,
        },
      });
      dealId = deal.id;
      await tx.clientOrder.update({
        where: { id: order.id },
        data: { dealId },
      });
    }

    return { order, dealId };
  });

  const host = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://tenegta.com";
  const adminUrl = `${host}/${parsed.data.locale}/growth/admin/orders`;

  const emailOk = await sendOrderNotificationEmail({
    orderId: result.order.id,
    locale: parsed.data.locale,
    productName: product.name,
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail,
    clientPhone: parsed.data.clientPhone,
    company: parsed.data.company,
    basePriceCents: product.priceCents,
    discountBps,
    discountCents: pricing.discountCents,
    finalPriceCents: pricing.finalPriceCents,
    discountCode: partner?.discountCode,
    creatorName: partner?.name ?? undefined,
    creatorEmail: partner?.email,
    selectedFeatures: selectedFeaturesPayload.map((f) => ({
      label: f.label,
      priceDeltaCents: f.priceDeltaCents,
    })),
    notes: parsed.data.notes,
    adminUrl,
    sentAt: new Date().toISOString(),
  });

  if (!emailOk) {
    console.error("[order] Email delivery failed", { orderId: result.order.id });
  }

  if (partner) {
    await createNotification(prisma, {
      userId: partner.userId,
      type: NotificationType.CLIENT_ORDER,
      title: "طلب عميل جديد",
      body: `${parsed.data.clientName} طلب ${product.name} — ${(pricing.finalPriceCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
      link: "/growth/deals",
      metadata: { orderId: result.order.id, dealId: result.dealId },
    });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.order.id,
    finalPriceCents: pricing.finalPriceCents,
    discountApplied: discountBps > 0,
  });
}
