"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createEventPostCommentAction,
  deleteEventPostAction,
  deleteEventPostCommentAction,
  repostEventPostAction,
  toggleEventPostLikeAction,
  updateEventPostAction,
  updateEventPostCommentAction,
} from "@/lib/growth/actions";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { IconComment, IconHeart, IconRepost } from "@/components/growth/icons/GrowthIcons";
import type { EventPostRow } from "@/lib/growth/event-posts";

type Props = {
  eventId: string;
  post: EventPostRow;
  currentUserId: string;
};

function formatTime(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));
}

export function EventPostCard({ eventId, post, currentUserId }: Props) {
  const t = useTranslations("Growth.events");
  const [commentsOpen, setCommentsOpen] = useState(post.comments.length > 0);
  const [editingPost, setEditingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const [, likeAction, likePending] = useActionState(toggleEventPostLikeAction, null);
  const [, commentAction, commentPending] = useActionState(createEventPostCommentAction, null);
  const [, updatePostAction, updatePostPending] = useActionState(updateEventPostAction, null);
  const [, deletePostAction] = useActionState(deleteEventPostAction, null);
  const [, repostAction] = useActionState(repostEventPostAction, null);
  const [, updateCommentAction] = useActionState(updateEventPostCommentAction, null);
  const [, deleteCommentAction] = useActionState(deleteEventPostCommentAction, null);

  const isOwner = post.authorId === currentUserId;
  const locale = typeof document !== "undefined" ? document.documentElement.lang || "ar" : "ar";

  return (
    <article className="group relative max-w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-black/40 to-black/60 p-px shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)]">
      <div className="relative rounded-[15px] bg-[#0a0c12]/90 p-3 sm:p-5">
        {post.kind === "REPOST" ? (
          <div
            className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-violet-500/15 blur-2xl motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          <div
            className="pointer-events-none absolute -start-6 -top-6 size-20 rounded-full bg-gold/10 blur-2xl"
            aria-hidden
          />
        )}

        <div className="relative flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="rounded-full bg-gradient-to-br from-gold/60 via-white/20 to-violet-400/40 p-[2px]">
              <GrowthAvatar
                name={post.authorName}
                email={post.authorEmail}
                avatarUrl={post.authorAvatarUrl}
                avatarPreset={post.authorAvatarPreset}
                size="md"
                className="ring-2 ring-[#0a0c12]"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">
                    {post.authorName}
                  </span>
                  {post.kind === "REPOST" ? (
                    <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                      {t("repost")}
                    </span>
                  ) : null}
                </div>
                <time className="text-[10px] text-white/40">{formatTime(post.createdAt, locale)}</time>
              </div>

              {isOwner ? (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingPost((v) => !v)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-white/70 hover:border-gold/30 hover:text-gold"
                  >
                    {t("postEdit")}
                  </button>
                  <form action={deletePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20"
                    >
                      {t("postDelete")}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>

            {post.repostOf ? (
              <blockquote className="mt-3 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3 py-2.5 text-xs">
                <span className="font-bold text-violet-200">{post.repostOf.authorName}</span>
                <p className="mt-1 break-words whitespace-pre-wrap text-white/70 [overflow-wrap:anywhere]">
                  {post.repostOf.body}
                </p>
              </blockquote>
            ) : null}

            {editingPost && isOwner ? (
              <form action={updatePostAction} className="mt-3 space-y-2">
                <input type="hidden" name="postId" value={post.id} />
                <textarea
                  name="body"
                  defaultValue={post.body}
                  required
                  maxLength={4000}
                  rows={3}
                  className="w-full rounded-xl border border-gold/30 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updatePostPending}
                    className="rounded-full bg-gold/20 px-3 py-1.5 text-xs font-bold text-gold"
                  >
                    {t("postSave")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(false)}
                    className="text-xs text-white/50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 break-words text-sm leading-relaxed text-white/85 [overflow-wrap:anywhere]">
                {post.body}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-3 sm:gap-2">
              <form action={likeAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  disabled={likePending}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition motion-safe:active:scale-95 ${
                    post.likedByMe
                      ? "border-gold/45 bg-gold/15 text-gold shadow-[0_0_16px_-4px_rgba(228,184,77,0.55)]"
                      : "border-white/10 bg-white/[0.04] text-white/65 hover:border-gold/35 hover:text-gold"
                  }`}
                >
                  <IconHeart size={16} filled={post.likedByMe} className={post.likedByMe ? "text-gold" : "text-white/55"} />
                  {post.likeCount > 0 ? post.likeCount : t("like")}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setCommentsOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/65 hover:border-gold/30 hover:text-gold"
              >
                <IconComment size={16} className="text-white/55 group-hover:text-gold" />
                {post.comments.length > 0 ? post.comments.length : t("comment")}
              </button>

              {!isOwner ? (
                <form action={repostAction}>
                  <input type="hidden" name="eventId" value={eventId} />
                  <input type="hidden" name="repostOfId" value={post.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-200 hover:bg-violet-500/20"
                  >
                    <IconRepost size={14} />
                    {t("repost")}
                  </button>
                </form>
              ) : null}
            </div>

            {commentsOpen ? (
              <div className="mt-4 space-y-3 rounded-xl border border-white/[0.06] bg-black/30 p-3">
                {post.comments.length === 0 ? (
                  <p className="text-center text-xs text-white/40">{t("commentsEmpty")}</p>
                ) : (
                  post.comments.map((c) => {
                    const commentOwner = c.authorId === currentUserId;
                    const isEditing = editingCommentId === c.id;
                    return (
                      <div key={c.id} className="flex gap-2">
                        <GrowthAvatar
                          name={c.authorName}
                          email={c.authorEmail}
                          avatarUrl={c.authorAvatarUrl}
                          avatarPreset={c.authorAvatarPreset}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white/90">{c.authorName}</span>
                            {commentOwner ? (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingCommentId(isEditing ? null : c.id)
                                  }
                                  className="text-[10px] font-bold text-gold/80"
                                >
                                  {t("postEdit")}
                                </button>
                                <form action={deleteCommentAction}>
                                  <input type="hidden" name="commentId" value={c.id} />
                                  <button
                                    type="submit"
                                    className="text-[10px] font-bold text-rose-400/80"
                                  >
                                    {t("postDelete")}
                                  </button>
                                </form>
                              </div>
                            ) : null}
                          </div>
                          {isEditing && commentOwner ? (
                            <form action={updateCommentAction} className="mt-1 space-y-1">
                              <input type="hidden" name="commentId" value={c.id} />
                              <input
                                name="body"
                                defaultValue={c.body}
                                required
                                maxLength={2000}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
                              />
                              <button type="submit" className="text-[10px] font-bold text-gold">
                                {t("postSave")}
                              </button>
                            </form>
                          ) : (
                            <p className="mt-0.5 text-xs leading-relaxed text-white/75">{c.body}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <form action={commentAction} className="flex gap-2 pt-1">
                  <input type="hidden" name="postId" value={post.id} />
                  <input
                    name="body"
                    required
                    maxLength={2000}
                    placeholder={t("commentPlaceholder")}
                    disabled={commentPending}
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/40"
                  />
                  <button
                    type="submit"
                    disabled={commentPending}
                    className="shrink-0 rounded-full bg-sky-500/20 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/30 disabled:opacity-50"
                  >
                    {t("commentSubmit")}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
