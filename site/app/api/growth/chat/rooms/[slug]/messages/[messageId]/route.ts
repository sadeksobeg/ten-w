import { NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import {
  assertRoomMessageInRoom,
  editRoomMessage,
  softDeleteRoomMessage,
  userCanModerateChat,
} from "@/lib/growth/chat-moderation";
import { resolveChatRoomForUser } from "@/lib/growth/chat-room-service";
import { logAdminAudit } from "@/lib/growth/audit-log";

const patchSchema = z.object({
  body: z.string().min(1).max(8000),
});

type RouteContext = { params: Promise<{ slug: string; messageId: string }> };

async function resolveRoom(slug: string, userId: string) {
  try {
    const resolved = await resolveChatRoomForUser(slug, userId);
    if (!resolved) return null;
    return resolved.room;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role = session.user.role === "ADMIN" ? UserRole.ADMIN : UserRole.PARTNER;
  const canMod = await userCanModerateChat(session.user.id, role);
  if (!canMod) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { slug, messageId } = await ctx.params;
  const room = await resolveRoom(slug, session.user.id);
  if (!room) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    await assertRoomMessageInRoom(messageId, room.id);
    await editRoomMessage(messageId, body.body, session.user.id);
    await logAdminAudit(session.user.id, "edit_room_message", "ChatRoomMessage", messageId, {
      roomId: room.id,
      slug,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role = session.user.role === "ADMIN" ? UserRole.ADMIN : UserRole.PARTNER;
  const canMod = await userCanModerateChat(session.user.id, role);
  if (!canMod) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { slug, messageId } = await ctx.params;
  const room = await resolveRoom(slug, session.user.id);
  if (!room) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await assertRoomMessageInRoom(messageId, room.id);
    await softDeleteRoomMessage(messageId, session.user.id);
    await logAdminAudit(session.user.id, "delete_room_message", "ChatRoomMessage", messageId, {
      roomId: room.id,
      slug,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
