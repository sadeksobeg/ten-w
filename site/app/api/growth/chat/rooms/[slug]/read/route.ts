import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markCreatorRoomRead } from "@/lib/growth/creator-chat";
import { resolveChatRoomForUser } from "@/lib/growth/chat-room-service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  try {
    const resolved = await resolveChatRoomForUser(slug, session.user.id);
    if (!resolved) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await markCreatorRoomRead(session.user.id, slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
