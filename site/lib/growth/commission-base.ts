import { prisma } from "@/lib/prisma";
import { partnerOverrideModelsAvailable } from "@/lib/growth/prisma-optional";

export async function effectiveCommissionBaseCents(
  partnerUserId: string,
  productId: string,
): Promise<number> {
  if (!partnerOverrideModelsAvailable(prisma)) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { commissionBaseCents: true },
    });
    return product?.commissionBaseCents ?? 0;
  }

  const specific = await prisma.partnerCommissionOverride.findFirst({
    where: { partnerUserId, productId },
    orderBy: { updatedAt: "desc" },
  });
  if (specific?.commissionBaseCents != null) {
    return specific.commissionBaseCents;
  }
  const globalOverride = await prisma.partnerCommissionOverride.findFirst({
    where: { partnerUserId, productId: null },
    orderBy: { updatedAt: "desc" },
  });
  if (globalOverride?.commissionBaseCents != null) {
    return globalOverride.commissionBaseCents;
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { commissionBaseCents: true },
  });
  return product?.commissionBaseCents ?? 0;
}
