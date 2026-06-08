import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveChatRoomForUser } from "@/lib/growth/chat-room-service";

type RouteContext = { params: Promise<{ slug: string; messageId: string }> };

const bodySchema = z.object({
  emoji: z.enum(["fire", "star", "thumb", "heart", "trophy", "lightning"]),
});

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug, messageId } = await ctx.params;
  try {
    const resolved = await resolveChatRoomForUser(slug, session.user.id);
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const existing = await prisma.chatRoomMessageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: session.user.id,
        emoji: parsed.data.emoji,
      },
    },
  });

  if (existing) {
    await prisma.chatRoomMessageReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, toggled: "off" });
  }

  await prisma.chatRoomMessageReaction.create({
    data: { messageId, userId: session.user.id, emoji: parsed.data.emoji },
  });
  return NextResponse.json({ ok: true, toggled: "on" });
}
