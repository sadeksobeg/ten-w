import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getConversationForUser } from "@/lib/growth/chat-access";

type RouteContext = { params: Promise<{ conversationId: string }> };

/**
 * Lightweight SSE: server polls SQLite for new rows (no LISTEN/NOTIFY).
 * Next step for “true” realtime: dedicated WebSocket service (or Pusher/Ably)
 * when you outgrow polling — keep the same message DTO contract.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("unauthorized", { status: 401 });
  }
  const role = session.user.role === "ADMIN" ? "ADMIN" : "PARTNER";
  const { conversationId } = await ctx.params;
  const conv = await getConversationForUser({
    conversationId,
    userId: session.user.id,
    role,
  });
  if (!conv) {
    return new Response("not_found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let cursor = new Date(0);
      const tick = async () => {
        const rows = await prisma.chatMessage.findMany({
          where: { conversationId, createdAt: { gt: cursor } },
          orderBy: { createdAt: "asc" },
          take: 50,
        });
        for (const m of rows) {
          cursor = m.createdAt;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "message",
                id: m.id,
                senderUserId: m.senderUserId,
                body: m.body,
                kind: m.kind,
                createdAt: m.createdAt.toISOString(),
                metadata: m.metadata,
              })}\n\n`,
            ),
          );
        }
      };

      try {
        for (let i = 0; i < 900; i++) {
          await tick();
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch {
        /* client disconnected */
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
