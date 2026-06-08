import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getRoomTyping, setRoomTyping } from "@/lib/growth/chat-typing";
import { resolveChatRoomForUser } from "@/lib/growth/chat-room-service";

type RouteContext = { params: Promise<{ slug: string }> };

const bodySchema = z.object({
  typing: z.boolean().optional(),
  name: z.string().max(80).optional(),
});

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const names = getRoomTyping(slug, session.user.id);
  return NextResponse.json({ names });
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  try {
    const resolved = await resolveChatRoomForUser(slug, session.user.id);
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (parsed.data.typing && parsed.data.name) {
    setRoomTyping(slug, session.user.id, parsed.data.name);
  }
  return NextResponse.json({ ok: true });
}
