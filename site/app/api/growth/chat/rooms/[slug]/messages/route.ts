import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  COMMUNITY_ROOM_SLUG,
  ensureCommunityMember,
  listRoomMessages,
  postCommunityMessage,
  seedOfficialWelcomeIfEmpty,
} from "@/lib/growth/chat-room-service";
import { touchLastSeen } from "@/lib/growth/presence";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({
  body: z.string().min(1).max(8000),
});

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  if (slug !== COMMUNITY_ROOM_SLUG) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const room = await ensureCommunityMember(session.user.id);
  await touchLastSeen(prisma, session.user.id);
  const url = new URL(req.url);
  const afterRaw = url.searchParams.get("after");
  const after = afterRaw ? new Date(afterRaw) : undefined;
  if (afterRaw && (after === undefined || Number.isNaN(after.getTime()))) {
    return NextResponse.json({ error: "invalid_after" }, { status: 400 });
  }

  if (session.user.role === "ADMIN") {
    await seedOfficialWelcomeIfEmpty(room.id, session.user.id);
  }

  const items = await listRoomMessages(room.id, { after, take: 150 });
  return NextResponse.json({ roomId: room.id, items });
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  if (slug !== COMMUNITY_ROOM_SLUG) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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

  const message = await postCommunityMessage(session.user.id, body.body);
  return NextResponse.json({ message });
}
