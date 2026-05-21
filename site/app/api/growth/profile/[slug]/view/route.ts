import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  const trimmed = slug?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { publicSlug: trimmed, isActive: true, role: "PARTNER" },
    select: { id: true, partnerProfile: { select: { id: true } } },
  });
  if (!user?.partnerProfile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.partnerProfile.update({
    where: { id: user.partnerProfile.id },
    data: { profileViews: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
