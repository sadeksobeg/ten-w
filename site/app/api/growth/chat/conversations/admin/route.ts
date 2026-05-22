import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureOpenConversation } from "@/lib/growth/chat-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let partnerUserId: string | undefined;
  try {
    const body = (await req.json()) as { partnerUserId?: string };
    partnerUserId = body.partnerUserId?.trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!partnerUserId) {
    return NextResponse.json({ error: "partner_required" }, { status: 400 });
  }

  const partner = await prisma.user.findFirst({
    where: { id: partnerUserId, role: "PARTNER", isActive: true },
    select: { id: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "partner_not_found" }, { status: 404 });
  }

  const conv = await ensureOpenConversation(partner.id);
  return NextResponse.json({
    conversationId: conv.id,
    status: conv.status,
    partnerUserId: partner.id,
  });
}
