import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPartnerChatSummary } from "@/lib/growth/chat-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARTNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const summary = await getPartnerChatSummary(session.user.id);
  return NextResponse.json(summary);
}
