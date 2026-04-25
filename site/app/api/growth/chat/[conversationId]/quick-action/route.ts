import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getConversationForUser } from "@/lib/growth/chat-access";
import { runChatAdminQuickAction } from "@/lib/growth/chat-quick-actions";

const bodySchema = z.object({
  action: z.enum(["bonus", "badge", "suggest"]),
  amountUsd: z.number().min(1).max(50_000).optional(),
  badgeKey: z.string().min(2).max(64).optional(),
  suggestTemplate: z
    .enum(["push_close", "offer_bonus", "ask_update", "commission_nudge"])
    .optional(),
});

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function POST(req: Request, ctx: RouteContext) {
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
  let body: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await runChatAdminQuickAction({
    conversationId,
    partnerUserId: conv.partnerUserId,
    adminUserId: session.user.id,
    action: body.action,
    amountUsd: body.amountUsd,
    badgeKey: body.badgeKey,
    suggestTemplate: body.suggestTemplate,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, messageId: result.messageId });
}
