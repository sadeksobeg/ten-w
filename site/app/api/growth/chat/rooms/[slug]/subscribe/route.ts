import { auth } from "@/auth";
import {
  listDeletedRoomMessageIdsSince,
  listRoomMessages,
  resolveChatRoomForUser,
} from "@/lib/growth/chat-room-service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("unauthorized", { status: 401 });
  }

  const { slug } = await ctx.params;
  let room;
  try {
    const resolved = await resolveChatRoomForUser(slug, session.user.id);
    if (!resolved) {
      return new Response("not_found", { status: 404 });
    }
    room = resolved.room;
  } catch {
    return new Response("forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let cursor = new Date(0);
      let deletedSince = new Date(0);
      const tickMs = 2000;
      const maxTicks = 900;

      const push = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        for (let i = 0; i < maxTicks; i++) {
          const items = await listRoomMessages(room.id, {
            after: cursor,
            take: 50,
          });

          if (items.length > 0) {
            const last = items[items.length - 1];
            cursor = new Date(last.createdAt);
            push({ type: "messages", items });
          }

          const deletedIds = await listDeletedRoomMessageIdsSince(room.id, deletedSince);
          if (deletedIds.length > 0) {
            deletedSince = new Date();
            push({ type: "deleted", ids: deletedIds });
          }

          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
          await new Promise((r) => setTimeout(r, tickMs));
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
