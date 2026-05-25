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
    <article className="event-post-card">
      <header className="event-post-card__header">
        <div className="event-post-card__avatar-ring">
          <GrowthAvatar
            name={post.authorName}
            email={post.authorEmail}
            avatarUrl={post.authorAvatarUrl}
            avatarPreset={post.authorAvatarPreset}
            size="md"
            className="ring-2 ring-[#0a0c12]"
          />
        </div>

        <div className="event-post-card__meta min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="event-post-card__author">{post.authorName}</span>
            {post.kind === "REPOST" ? (
              <span className="event-post-card__repost-badge">{t("repost")}</span>
            ) : null}
          </div>
          <time className="event-post-card__time">{formatTime(post.createdAt, locale)}</time>
        </div>

        {isOwner ? (
          <div className="event-post-card__owner-actions">
            <button
              type="button"
              onClick={() => setEditingPost((v) => !v)}
              className="event-post-card__owner-btn"
            >
              {t("postEdit")}
            </button>
            <form action={deletePostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <button type="submit" className="event-post-card__owner-btn event-post-card__owner-btn--danger">
                {t("postDelete")}
              </button>
            </form>
          </div>
        ) : null}
      </header>

      <div className="event-post-card__body">
        {post.repostOf ? (
          <blockquote className="event-post-card__quote">
            <span className="font-bold text-violet-200">{post.repostOf.authorName}</span>
            <p className="mt-1.5 break-words whitespace-pre-wrap text-white/75 [overflow-wrap:anywhere]">
              {post.repostOf.body}
            </p>
          </blockquote>
        ) : null}

        {editingPost && isOwner ? (
          <form action={updatePostAction} className="space-y-3">
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="body"
              defaultValue={post.body}
              required
              maxLength={4000}
              rows={4}
              className="event-posts-composer__input !min-h-[5.5rem]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatePostPending}
                className="rounded-full bg-gold/20 px-4 py-2 text-xs font-bold text-gold"
              >
                {t("postSave")}
              </button>
              <button
                type="button"
                onClick={() => setEditingPost(false)}
                className="px-3 py-2 text-xs text-white/50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <p className="event-post-card__text">{post.body}</p>
        )}
      </div>

      <div
        className={`event-post-card__toolbar ${isOwner ? "event-post-card__toolbar--two" : ""}`}
        role="group"
        aria-label={t("tabPosts")}
      >
        <form action={likeAction} className="event-post-card__toolbar-item">
          <input type="hidden" name="postId" value={post.id} />
          <button
            type="submit"
            disabled={likePending}
            className={`event-post-card__toolbar-btn ${post.likedByMe ? "event-post-card__toolbar-btn--active" : ""}`}
          >
            <IconHeart
              size={18}
              filled={post.likedByMe}
              className={post.likedByMe ? "text-gold" : "text-current"}
            />
            <span>{post.likeCount > 0 ? post.likeCount : t("like")}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className={`event-post-card__toolbar-btn ${commentsOpen ? "event-post-card__toolbar-btn--active" : ""}`}
        >
          <IconComment size={18} />
          <span>{post.comments.length > 0 ? post.comments.length : t("comment")}</span>
        </button>

        {!isOwner ? (
          <form action={repostAction} className="event-post-card__toolbar-item">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="repostOfId" value={post.id} />
            <button type="submit" className="event-post-card__toolbar-btn event-post-card__toolbar-btn--repost">
              <IconRepost size={16} />
              <span>{t("repost")}</span>
            </button>
          </form>
        ) : null}
      </div>

      {commentsOpen ? (
        <div className="event-post-card__comments">
          {post.comments.length === 0 ? (
            <p className="py-2 text-center text-xs text-white/40">{t("commentsEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {post.comments.map((c) => {
                const commentOwner = c.authorId === currentUserId;
                const isEditing = editingCommentId === c.id;
                return (
                  <li key={c.id} className="flex gap-3">
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
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(isEditing ? null : c.id)}
                              className="text-[10px] font-bold text-gold/80"
                            >
                              {t("postEdit")}
                            </button>
                            <form action={deleteCommentAction}>
                              <input type="hidden" name="commentId" value={c.id} />
                              <button type="submit" className="text-[10px] font-bold text-rose-400/80">
                                {t("postDelete")}
                              </button>
                            </form>
                          </div>
                        ) : null}
                      </div>
                      {isEditing && commentOwner ? (
                        <form action={updateCommentAction} className="mt-2 space-y-2">
                          <input type="hidden" name="commentId" value={c.id} />
                          <input
                            name="body"
                            defaultValue={c.body}
                            required
                            maxLength={2000}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                          />
                          <button type="submit" className="text-xs font-bold text-gold">
                            {t("postSave")}
                          </button>
                        </form>
                      ) : (
                        <p className="mt-1 break-words text-sm leading-relaxed text-white/75">
                          {c.body}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form action={commentAction} className="event-post-card__comment-form">
            <input type="hidden" name="postId" value={post.id} />
            <input
              name="body"
              required
              maxLength={2000}
              placeholder={t("commentPlaceholder")}
              disabled={commentPending}
              className="event-post-card__comment-input"
            />
            <button
              type="submit"
              disabled={commentPending}
              className="event-post-card__comment-submit"
            >
              {t("commentSubmit")}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
