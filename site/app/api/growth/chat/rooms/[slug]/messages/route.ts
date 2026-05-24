import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  COMMUNITY_ROOM_SLUG,
  CREATOR_ROOM_SLUG,
  listRoomMessagesPage,
  postCommunityMessage,
  postCreatorRoomMessage,
  postEventRoomMessage,
  resolveChatRoomForUser,
  seedOfficialWelcomeIfEmpty,
} from "@/lib/growth/chat-room-service";
import { getChatModerationStatus } from "@/lib/growth/chat-moderation";
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

  let room;
  try {
    const resolved = await resolveChatRoomForUser(slug, session.user.id);
    if (!resolved) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    room = resolved.room;
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await touchLastSeen(prisma, session.user.id);
  const url = new URL(req.url);
  const afterRaw = url.searchParams.get("after");
  const after = afterRaw ? new Date(afterRaw) : undefined;
  if (afterRaw && (after === undefined || Number.isNaN(after.getTime()))) {
    return NextResponse.json({ error: "invalid_after" }, { status: 400 });
  }

  const limitRaw = url.searchParams.get("limit");
  const beforeRaw = url.searchParams.get("before");
  const before = beforeRaw ? new Date(beforeRaw) : undefined;
  const limit = limitRaw ? Number(limitRaw) : undefined;
  if (beforeRaw && (before === undefined || Number.isNaN(before.getTime()))) {
    return NextResponse.json({ error: "invalid_before" }, { status: 400 });
  }

  if (slug === COMMUNITY_ROOM_SLUG && session.user.role === "ADMIN") {
    await seedOfficialWelcomeIfEmpty(room.id, session.user.id);
  }

  const page = await listRoomMessagesPage(room.id, {
    after,
    before,
    take: limit && Number.isFinite(limit) ? limit : undefined,
  });
  const mod = await getChatModerationStatus(
    session.user.id,
    session.user.role === "ADMIN" ? "ADMIN" : "PARTNER",
  );
  return NextResponse.json({ roomId: room.id, ...page, canModerate: mod.canModerate });
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;

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

  try {
    const message =
      slug === COMMUNITY_ROOM_SLUG
        ? await postCommunityMessage(session.user.id, body.body)
        : slug === CREATOR_ROOM_SLUG
          ? await postCreatorRoomMessage(session.user.id, body.body)
          : await postEventRoomMessage(session.user.id, slug, body.body);
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
