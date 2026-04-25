import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * SSE replay of a stored demo session (events read from DB, paced by delayMs / speed).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new Response("forbidden", { status: 403 });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId")?.trim();
  if (!sessionId) {
    return new Response("missing_sessionId", { status: 400 });
  }
  const speed = Math.min(10, Math.max(0.5, Number(url.searchParams.get("speed") ?? "1") || 1));

  const row = await prisma.demoSession.findUnique({
    where: { id: sessionId },
    include: { events: { orderBy: { seq: "asc" } } },
  });
  if (!row) {
    return new Response("not_found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const ev of row.events) {
          const payload = {
            type: "demo_event",
            seq: ev.seq,
            kind: ev.kind,
            delayMs: ev.delayMs,
            payload: ev.payload,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          await new Promise((r) => setTimeout(r, Math.max(60, ev.delayMs / speed)));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
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
