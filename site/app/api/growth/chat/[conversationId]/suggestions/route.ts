import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConversationForUser } from "@/lib/growth/chat-access";
import { getPartnerChatContext } from "@/lib/growth/chat-partner-context";
import { buildChatSuggestions } from "@/lib/growth/chat-suggestions";

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
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
  const ctxData = await getPartnerChatContext(conv.partnerUserId, {
    linkedDealId: conv.linkedDealId,
  });
  if (!ctxData) {
    return NextResponse.json({ error: "partner_missing" }, { status: 404 });
  }
  const suggestions = buildChatSuggestions(ctxData);
  const modeledCloseProbability = ctxData.focusDeal?.closeProbability ?? null;
  return NextResponse.json({ suggestions, modeledCloseProbability });
}
