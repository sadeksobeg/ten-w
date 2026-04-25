import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureOpenConversation, listAdminConversations } from "@/lib/growth/chat-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const items = await listAdminConversations();
  return NextResponse.json({ items });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARTNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const conv = await ensureOpenConversation(session.user.id);
  return NextResponse.json({
    conversationId: conv.id,
    status: conv.status,
  });
}
