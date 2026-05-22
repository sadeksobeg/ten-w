"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createEventPostAction, repostEventPostAction } from "@/lib/growth/actions";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import type { EventPostRow } from "@/lib/growth/event-posts";

type Props = {
  eventId: string;
  posts: EventPostRow[];
};

export function EventMemberFeed({ eventId, posts }: Props) {
  const t = useTranslations("Growth.events");
  const [postState, postAction, postPending] = useActionState(createEventPostAction, null);
  const [, repostAction] = useActionState(repostEventPostAction, null);

  useEffect(() => {
    if (postState && "ok" in postState && postState.ok) {
      const form = document.getElementById(`event-post-${eventId}`) as HTMLFormElement | null;
      form?.reset();
    }
  }, [postState, eventId]);

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold text-gold">{t("memberHub")}</h2>
      <p className="mt-1 text-xs text-white/50">{t("memberOnlyHint")}</p>

      <form
        id={`event-post-${eventId}`}
        action={postAction}
        className="mt-4 space-y-3"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <textarea
          name="body"
          required
          maxLength={4000}
          rows={3}
          disabled={postPending}
          placeholder={t("postPlaceholder")}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
        <button
          type="submit"
          disabled={postPending}
          className="rounded-full border border-gold/35 bg-gold/15 px-5 py-2 text-xs font-bold text-gold hover:bg-gold/25 disabled:opacity-50"
        >
          {t("postSubmit")}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <p className="text-sm text-white/50">{t("feedEmpty")}</p>
        ) : (
          posts.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex items-start gap-3">
                <GrowthAvatar
                  name={p.authorName}
                  email=""
                  avatarUrl={p.authorImage}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.authorName}</span>
                    {p.kind === "REPOST" ? (
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                        {t("repost")}
                      </span>
                    ) : null}
                    <time className="text-[10px] text-white/40">
                      {new Date(p.createdAt).toLocaleString()}
                    </time>
                  </div>
                  {p.repostOf ? (
                    <blockquote className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">
                      <span className="font-semibold text-white/80">{p.repostOf.authorName}</span>
                      <p className="mt-1 whitespace-pre-wrap">{p.repostOf.body}</p>
                    </blockquote>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{p.body}</p>
                  <form action={repostAction} className="mt-2">
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="repostOfId" value={p.id} />
                    <button
                      type="submit"
                      className="text-[10px] font-bold text-gold hover:underline"
                    >
                      {t("repost")}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </GlassCard>
  );
}
