import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listPartnerChatTimeline } from "@/lib/growth/chat-service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARTNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const beforeRaw = url.searchParams.get("before");
  const before = beforeRaw ? new Date(beforeRaw) : undefined;
  if (beforeRaw && (before === undefined || Number.isNaN(before.getTime()))) {
    return NextResponse.json({ error: "invalid_before" }, { status: 400 });
  }
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;

  const { items, hasMore } = await listPartnerChatTimeline(session.user.id, {
    before,
    limit: limit && Number.isFinite(limit) ? limit : undefined,
  });
  return NextResponse.json({ items, hasMore });
}
