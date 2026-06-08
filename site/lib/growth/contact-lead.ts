import { DealStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { resolvePartnerFromDiscountCode } from "@/lib/growth/resolve-order-partner";

const SERVICE_SLUG_MAP: Record<string, string> = {
  website: "website",
  "automation-ai": "automation-ai",
  "mobile-app": "mobile-app",
  general: "website",
};

export type CreateContactLeadInput = {
  locale: "ar" | "en" | "fr";
  name: string;
  email: string;
  company?: string;
  message: string;
  serviceInterest?: string;
  discountCode?: string;
};

export type CreateContactLeadResult = {
  orderId: string | null;
  partnerName: string | null;
  discountValid: boolean;
  discountBps: number;
};

export async function createContactLead(
  input: CreateContactLeadInput,
): Promise<CreateContactLeadResult> {
  const slug = SERVICE_SLUG_MAP[input.serviceInterest ?? "general"] ?? "website";
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
  });

  if (!product) {
    return { orderId: null, partnerName: null, discountValid: false, discountBps: 0 };
  }

  let partner = null;
  if (input.discountCode?.trim()) {
    partner = await resolvePartnerFromDiscountCode(input.discountCode);
  }

  const discountBps = partner?.discountBps ?? 0;
  const clientLabel = [input.name, input.company ? `(${input.company})` : null, input.email]
    .filter(Boolean)
    .join(" ");

  const notes = [
    `مصدر: صفحة التواصل`,
    input.serviceInterest ? `الخدمة: ${input.serviceInterest}` : null,
    partner ? `كود الحسم: ${partner.discountCode} (3%)` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.clientOrder.create({
      data: {
        locale: input.locale,
        productId: product.id,
        partnerId: partner?.userId ?? null,
        clientName: input.name,
        clientEmail: input.email,
        company: input.company?.trim() || null,
        selectedFeatures: [],
        basePriceCents: 0,
        discountBps,
        discountCents: 0,
        finalPriceCents: 0,
        discountCode: partner?.discountCode ?? input.discountCode?.trim().toUpperCase() ?? null,
        notes,
      },
    });

    let dealId: string | null = null;
    if (partner) {
      const deal = await tx.deal.create({
        data: {
          partnerId: partner.userId,
          productId: product.id,
          status: DealStatus.PENDING,
          saleAmountCents: 0,
          clientLabel,
          notes: notes || null,
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

  if (partner) {
    await createNotification(prisma, {
      userId: partner.userId,
      type: NotificationType.CLIENT_ORDER,
      title: "عميل جديد من رابطك",
      body: `${input.name} تواصل عبر صفحة التواصل — بانتظار مراجعة الفريق.`,
      link: "/growth/earnings",
      metadata: { kind: "contact_lead", orderId: result.order.id },
    });
  }

  return {
    orderId: result.order.id,
    partnerName: partner?.name ?? null,
    discountValid: Boolean(partner),
    discountBps,
  };
}
