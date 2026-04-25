import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "missing_sessionId" }, { status: 400 });
  }

  const row = await prisma.demoSession.findUnique({
    where: { id: sessionId },
    include: { events: { orderBy: { seq: "asc" } } },
  });
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: row.id,
    status: row.status,
    events: row.events.map((e) => ({
      id: e.id,
      seq: e.seq,
      kind: e.kind,
      delayMs: e.delayMs,
      payload: e.payload,
    })),
  });
}
