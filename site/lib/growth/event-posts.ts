import { ParticipantStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type EventPostRow = {
  id: string;
  body: string;
  kind: "POST" | "REPOST";
  createdAt: Date;
  authorName: string;
  authorImage: string | null;
  repostOf: { id: string; body: string; authorName: string } | null;
};

export async function isAcceptedEventMember(eventId: string, userId: string): Promise<boolean> {
  const row = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { status: true },
  });
  return row?.status === ParticipantStatus.ACCEPTED;
}

export async function listEventPostsForMember(
  eventId: string,
  userId: string,
  limit = 50,
): Promise<EventPostRow[] | null> {
  const ok = await isAcceptedEventMember(eventId, userId);
  if (!ok) return null;

  const posts = await prisma.eventPost.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, image: true } },
      repostOf: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    body: p.body,
    kind: p.kind,
    createdAt: p.createdAt,
    authorName: p.user.name ?? "Partner",
    authorImage: p.user.image,
    repostOf: p.repostOf
      ? {
          id: p.repostOf.id,
          body: p.repostOf.body,
          authorName: p.repostOf.user.name ?? "Partner",
        }
      : null,
  }));
}

export async function createEventPost(
  eventId: string,
  userId: string,
  body: string,
  kind: "POST" | "REPOST" = "POST",
  repostOfId?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 4000) return { ok: false, error: "invalid_input" };

  const member = await isAcceptedEventMember(eventId, userId);
  if (!member) return { ok: false, error: "not_member" };

  if (repostOfId) {
    const original = await prisma.eventPost.findFirst({
      where: { id: repostOfId, eventId },
    });
    if (!original) return { ok: false, error: "not_found" };
  }

  await prisma.eventPost.create({
    data: {
      eventId,
      userId,
      body: trimmed,
      kind,
      repostOfId: repostOfId ?? null,
    },
  });

  return { ok: true };
}
