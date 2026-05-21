import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const updated = await prisma.notification.updateMany({
    where: { id, userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ ok: true, updated: updated.count });
}
