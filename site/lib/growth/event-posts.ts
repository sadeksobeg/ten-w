import { ParticipantStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export type EventPostCommentRow = {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  authorAvatarPreset: string | null;
};

export type EventPostRow = {
  id: string;
  body: string;
  kind: "POST" | "REPOST";
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  authorAvatarPreset: string | null;
  repostOf: { id: string; body: string; authorName: string } | null;
  likeCount: number;
  likedByMe: boolean;
  comments: EventPostCommentRow[];
};

const USER_POST_SELECT = {
  name: true,
  email: true,
  avatarUrl: true,
  avatarPreset: true,
  isVerifiedOfficial: true,
  officialDisplayName: true,
} as const;

function mapAuthor(user: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarPreset: string | null;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
}) {
  return {
    authorName: resolveChatSenderName(user),
    authorEmail: user.email,
    authorAvatarUrl: user.avatarUrl,
    authorAvatarPreset: user.avatarPreset,
  };
}

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
    where: { eventId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: USER_POST_SELECT },
      repostOf: {
        include: { user: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } } },
      },
      likes: { select: { userId: true } },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 50,
        include: { user: { select: USER_POST_SELECT } },
      },
    },
  });

  return posts.map((p) => {
    const author = mapAuthor(p.user);
    return {
      id: p.id,
      body: p.body,
      kind: p.kind,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorId: p.userId,
      ...author,
      repostOf: p.repostOf
        ? {
            id: p.repostOf.id,
            body: p.repostOf.body,
            authorName: resolveChatSenderName(p.repostOf.user),
          }
        : null,
      likeCount: p.likes.length,
      likedByMe: p.likes.some((l) => l.userId === userId),
      comments: p.comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        authorId: c.userId,
        ...mapAuthor(c.user),
      })),
    };
  });
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
      where: { id: repostOfId, eventId, deletedAt: null },
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

export async function updateEventPost(
  postId: string,
  userId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 4000) return { ok: false, error: "invalid_input" };

  const post = await prisma.eventPost.findFirst({
    where: { id: postId, deletedAt: null },
    select: { userId: true, eventId: true },
  });
  if (!post) return { ok: false, error: "not_found" };
  if (post.userId !== userId) return { ok: false, error: "unauthorized" };

  const member = await isAcceptedEventMember(post.eventId, userId);
  if (!member) return { ok: false, error: "not_member" };

  await prisma.eventPost.update({
    where: { id: postId },
    data: { body: trimmed },
  });
  return { ok: true };
}

export async function deleteEventPost(
  postId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const post = await prisma.eventPost.findFirst({
    where: { id: postId, deletedAt: null },
    select: { userId: true, eventId: true },
  });
  if (!post) return { ok: false, error: "not_found" };
  if (post.userId !== userId) return { ok: false, error: "unauthorized" };

  await prisma.eventPost.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });
  return { ok: true };
}

export async function toggleEventPostLike(
  postId: string,
  userId: string,
): Promise<{ ok: true; liked: boolean } | { ok: false; error: string }> {
  const post = await prisma.eventPost.findFirst({
    where: { id: postId, deletedAt: null },
    select: { eventId: true },
  });
  if (!post) return { ok: false, error: "not_found" };

  const member = await isAcceptedEventMember(post.eventId, userId);
  if (!member) return { ok: false, error: "not_member" };

  const existing = await prisma.eventPostLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.eventPostLike.delete({ where: { id: existing.id } });
    return { ok: true, liked: false };
  }

  await prisma.eventPostLike.create({ data: { postId, userId } });
  return { ok: true, liked: true };
}

export async function createEventPostComment(
  postId: string,
  userId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) return { ok: false, error: "invalid_input" };

  const post = await prisma.eventPost.findFirst({
    where: { id: postId, deletedAt: null },
    select: { eventId: true },
  });
  if (!post) return { ok: false, error: "not_found" };

  const member = await isAcceptedEventMember(post.eventId, userId);
  if (!member) return { ok: false, error: "not_member" };

  await prisma.eventPostComment.create({
    data: { postId, userId, body: trimmed },
  });
  return { ok: true };
}

export async function updateEventPostComment(
  commentId: string,
  userId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) return { ok: false, error: "invalid_input" };

  const comment = await prisma.eventPostComment.findFirst({
    where: { id: commentId, deletedAt: null },
    select: { userId: true, post: { select: { eventId: true } } },
  });
  if (!comment) return { ok: false, error: "not_found" };
  if (comment.userId !== userId) return { ok: false, error: "unauthorized" };

  const member = await isAcceptedEventMember(comment.post.eventId, userId);
  if (!member) return { ok: false, error: "not_member" };

  await prisma.eventPostComment.update({
    where: { id: commentId },
    data: { body: trimmed },
  });
  return { ok: true };
}

export async function deleteEventPostComment(
  commentId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const comment = await prisma.eventPostComment.findFirst({
    where: { id: commentId, deletedAt: null },
    select: { userId: true },
  });
  if (!comment) return { ok: false, error: "not_found" };
  if (comment.userId !== userId) return { ok: false, error: "unauthorized" };

  await prisma.eventPostComment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
  return { ok: true };
}
