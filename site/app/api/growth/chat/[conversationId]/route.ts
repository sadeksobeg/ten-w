import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getConversationForUser } from "@/lib/growth/chat-access";

const patchSchema = z
  .object({
    status: z.enum(["OPEN", "RESOLVED"]).optional(),
    linkedDealId: z.string().min(1).nullable().optional(),
    priority: z.enum(["HIGH", "NORMAL", "LOW"]).optional(),
  })
  .refine(
    (d) => d.status !== undefined || d.linkedDealId !== undefined || d.priority !== undefined,
    { message: "empty_patch" },
  );

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { conversationId } = await ctx.params;
  const conv = await getConversationForUser({
    conversationId,
    userId: session.user.id,
    role: "ADMIN",
  });
  if (!conv) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  let body: z.infer<typeof patchSchema>;
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.linkedDealId !== undefined && body.linkedDealId !== null) {
    const deal = await prisma.deal.findUnique({
      where: { id: body.linkedDealId },
      select: { partnerId: true },
    });
    if (!deal || deal.partnerId !== conv.partnerUserId) {
      return NextResponse.json({ error: "invalid_deal" }, { status: 400 });
    }
  }

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.linkedDealId !== undefined ? { linkedDealId: body.linkedDealId } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
