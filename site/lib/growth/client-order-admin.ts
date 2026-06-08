import { ClientOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminClientOrderRow = {
  id: string;
  status: ClientOrderStatus;
  locale: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  company: string | null;
  productName: string;
  productSlug: string;
  partnerName: string | null;
  partnerEmail: string | null;
  basePriceCents: number;
  discountBps: number;
  discountCents: number;
  finalPriceCents: number;
  discountCode: string | null;
  selectedFeatures: Array<{ label: string; priceDeltaCents: number }>;
  notes: string | null;
  dealId: string | null;
  dealStatus: string | null;
};

export type AdminOrderStats = {
  todayCount: number;
  todayValueCents: number;
  totalCount: number;
  totalValueCents: number;
  topCreatorName: string | null;
  topProductName: string | null;
};

function parseFeatures(raw: unknown): Array<{ label: string; priceDeltaCents: number }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object" && "label" in x)
    .map((x) => ({
      label: String((x as { label: string }).label),
      priceDeltaCents: Number((x as { priceDeltaCents: number }).priceDeltaCents) || 0,
    }));
}

export async function listAdminClientOrders(limit = 80): Promise<AdminClientOrderRow[]> {
  const rows = await prisma.clientOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      product: { select: { name: true, slug: true } },
      partner: { select: { name: true, email: true } },
      deal: { select: { id: true, status: true } },
    },
  });

  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    locale: o.locale,
    createdAt: o.createdAt.toISOString(),
    clientName: o.clientName,
    clientEmail: o.clientEmail,
    clientPhone: o.clientPhone,
    company: o.company,
    productName: o.product.name,
    productSlug: o.product.slug,
    partnerName: o.partner?.name ?? null,
    partnerEmail: o.partner?.email ?? null,
    basePriceCents: o.basePriceCents,
    discountBps: o.discountBps,
    discountCents: o.discountCents,
    finalPriceCents: o.finalPriceCents,
    discountCode: o.discountCode,
    selectedFeatures: parseFeatures(o.selectedFeatures),
    notes: o.notes,
    dealId: o.dealId,
    dealStatus: o.deal?.status ?? null,
  }));
}

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [today, all, topCreator, topProduct] = await Promise.all([
    prisma.clientOrder.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _count: true,
      _sum: { finalPriceCents: true },
    }),
    prisma.clientOrder.aggregate({
      _count: true,
      _sum: { finalPriceCents: true },
    }),
    prisma.clientOrder.groupBy({
      by: ["partnerId"],
      where: { partnerId: { not: null } },
      _count: true,
      orderBy: { _count: { partnerId: "desc" } },
      take: 1,
    }),
    prisma.clientOrder.groupBy({
      by: ["productId"],
      _count: true,
      orderBy: { _count: { productId: "desc" } },
      take: 1,
    }),
  ]);

  let topCreatorName: string | null = null;
  if (topCreator[0]?.partnerId) {
    const u = await prisma.user.findUnique({
      where: { id: topCreator[0].partnerId! },
      select: { name: true },
    });
    topCreatorName = u?.name ?? null;
  }

  let topProductName: string | null = null;
  if (topProduct[0]?.productId) {
    const p = await prisma.product.findUnique({
      where: { id: topProduct[0].productId },
      select: { name: true },
    });
    topProductName = p?.name ?? null;
  }

  return {
    todayCount: today._count,
    todayValueCents: today._sum.finalPriceCents ?? 0,
    totalCount: all._count,
    totalValueCents: all._sum.finalPriceCents ?? 0,
    topCreatorName,
    topProductName,
  };
}
