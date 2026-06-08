import { prisma } from "@/lib/prisma";

export type ResolvedOrderPartner = {
  userId: string;
  discountBps: number;
  discountCode: string;
  name: string | null;
  email: string;
};

export async function resolvePartnerFromDiscountCode(
  code: string,
): Promise<ResolvedOrderPartner | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;

  const profile = await prisma.partnerProfile.findFirst({
    where: { clientDiscountCode: trimmed },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
    },
  });

  if (!profile?.user.isActive) return null;

  return {
    userId: profile.user.id,
    discountBps: profile.discountBps,
    discountCode: profile.clientDiscountCode!,
    name: profile.user.name,
    email: profile.user.email,
  };
}

export async function resolvePartnerFromCreatorSlug(
  slug: string,
): Promise<ResolvedOrderPartner | null> {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed) return null;

  const user = await prisma.user.findFirst({
    where: { publicSlug: trimmed, isActive: true },
    include: { partnerProfile: true },
  });

  if (!user?.partnerProfile?.clientDiscountCode) return null;

  return {
    userId: user.id,
    discountBps: user.partnerProfile.discountBps,
    discountCode: user.partnerProfile.clientDiscountCode,
    name: user.name,
    email: user.email,
  };
}
