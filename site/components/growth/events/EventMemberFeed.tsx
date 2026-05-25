"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createEventPostAction } from "@/lib/growth/actions";
import { EventPostCard } from "@/components/growth/events/EventPostCard";
import { EventContactAssistantBubble } from "@/components/growth/events/EventContactAssistantBubble";
import type { EventPostRow } from "@/lib/growth/event-posts";
import type { EventContactLeadRow } from "@/lib/growth/event-contact-assistant";

type Props = {
  eventId: string;
  posts: EventPostRow[];
  currentUserId: string;
  contactLeads: EventContactLeadRow[];
};

export function EventMemberFeed({ eventId, posts, currentUserId, contactLeads }: Props) {
  const t = useTranslations("Growth.events");
  const [postState, postAction, postPending] = useActionState(createEventPostAction, null);

  useEffect(() => {
    if (postState && "ok" in postState && postState.ok) {
      const form = document.getElementById(`event-post-${eventId}`) as HTMLFormElement | null;
      form?.reset();
    }
  }, [postState, eventId]);

  return (
    <>
      <div className="event-posts-feed">
        <section className="event-posts-composer" aria-labelledby="event-posts-composer-title">
          <div className="event-posts-composer__mesh" aria-hidden />
          <div className="event-posts-composer__glow" aria-hidden />

          <div className="event-posts-composer__head">
            <div className="min-w-0 flex-1">
              <p className="event-posts-composer__badge">{t("feedBadge")}</p>
              <h2
                id="event-posts-composer-title"
                className="event-posts-composer__title font-[family-name:var(--font-cairo)]"
              >
                {t("memberHub")}
              </h2>
              <p className="event-posts-composer__hint">{t("memberOnlyHint")}</p>
            </div>
          </div>

          <form
            id={`event-post-${eventId}`}
            action={postAction}
            className="event-posts-composer__form"
          >
            <input type="hidden" name="eventId" value={eventId} />
            <label className="sr-only" htmlFor={`event-post-body-${eventId}`}>
              {t("postPlaceholder")}
            </label>
            <textarea
              id={`event-post-body-${eventId}`}
              name="body"
              required
              maxLength={4000}
              rows={4}
              disabled={postPending}
              placeholder={t("postPlaceholder")}
              className="event-posts-composer__input"
            />
            <div className="event-posts-composer__actions">
              <button
                type="submit"
                disabled={postPending}
                className="event-posts-composer__submit"
              >
                {postPending ? "…" : t("postSubmit")}
              </button>
            </div>
          </form>
        </section>

        <section className="event-posts-list" aria-label={t("tabPosts")}>
          {posts.length === 0 ? (
            <div className="event-posts-empty">
              <span className="event-posts-empty__icon" aria-hidden>
                ✦
              </span>
              <p>{t("feedEmpty")}</p>
            </div>
          ) : (
            posts.map((p) => (
              <EventPostCard key={p.id} eventId={eventId} post={p} currentUserId={currentUserId} />
            ))
          )}
        </section>
      </div>

      <EventContactAssistantBubble leads={contactLeads} />
    </>
  );
}
