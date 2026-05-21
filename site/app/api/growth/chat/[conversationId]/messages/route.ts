import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { appendMessage, listMessages } from "@/lib/growth/chat-service";
import { getConversationForUser } from "@/lib/growth/chat-access";

const postSchema = z.object({
  body: z.string().min(1).max(8000),
  kind: z.string().max(32).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const ADMIN_KINDS = new Set(["TEXT", "SYSTEM", "ACTION", "WARNING"]);

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role = session.user.role === "ADMIN" ? "ADMIN" : "PARTNER";
  const { conversationId } = await ctx.params;
  const conv = await getConversationForUser({
    conversationId,
    userId: session.user.id,
    role,
  });
  if (!conv) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const url = new URL(req.url);
  const afterRaw = url.searchParams.get("after");
  const beforeRaw = url.searchParams.get("before");
  const after = afterRaw ? new Date(afterRaw) : undefined;
  const before = beforeRaw ? new Date(beforeRaw) : undefined;
  if (afterRaw && (after === undefined || Number.isNaN(after.getTime()))) {
    return NextResponse.json({ error: "invalid_after" }, { status: 400 });
  }
  if (beforeRaw && (before === undefined || Number.isNaN(before.getTime()))) {
    return NextResponse.json({ error: "invalid_before" }, { status: 400 });
  }
  const takeRaw = url.searchParams.get("take");
  const take = takeRaw ? Number(takeRaw) : undefined;
  const items = await listMessages(conversationId, {
    after,
    before,
    take: take && Number.isFinite(take) ? take : undefined,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role = session.user.role === "ADMIN" ? "ADMIN" : "PARTNER";
  const { conversationId } = await ctx.params;
  const conv = await getConversationForUser({
    conversationId,
    userId: session.user.id,
    role,
  });
  if (!conv) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (conv.status === "RESOLVED" && role === "PARTNER") {
    return NextResponse.json({ error: "conversation_closed" }, { status: 409 });
  }
  let body: z.infer<typeof postSchema>;
  try {
    const json = await req.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  let kind = body.kind?.trim() || "TEXT";
  if (role !== "ADMIN") {
    kind = "TEXT";
  } else if (kind !== "TEXT" && !ADMIN_KINDS.has(kind)) {
    kind = "TEXT";
  }

  const msg = await appendMessage({
    conversationId,
    senderUserId: session.user.id,
    body: body.body,
    kind,
    metadata: role === "ADMIN" && body.metadata ? body.metadata : undefined,
  });
  return NextResponse.json({
    message: {
      id: msg.id,
      conversationId: msg.conversationId,
      senderUserId: msg.senderUserId,
      body: msg.body,
      kind: msg.kind,
      createdAt: msg.createdAt.toISOString(),
      metadata: (msg.metadata as Record<string, unknown> | null) ?? null,
    },
  });
}
