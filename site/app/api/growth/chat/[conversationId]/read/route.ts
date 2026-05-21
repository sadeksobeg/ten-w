import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  markAllPartnerChatsRead,
  markPartnerConversationRead,
} from "@/lib/growth/chat-service";
import { getConversationForUser } from "@/lib/growth/chat-access";

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARTNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { conversationId } = await ctx.params;
  const conv = await getConversationForUser({
    conversationId,
    userId: session.user.id,
    role: "PARTNER",
  });
  if (!conv) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let markAll = false;
  try {
    const json = await req.json().catch(() => ({}));
    markAll = Boolean((json as { all?: boolean }).all);
  } catch {
    /* empty body */
  }

  if (markAll) {
    await markAllPartnerChatsRead(session.user.id);
  } else {
    await markPartnerConversationRead(conversationId, session.user.id);
  }
  return NextResponse.json({ ok: true });
}
