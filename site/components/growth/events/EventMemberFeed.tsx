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
      <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] via-[#0a0c14] to-violet-950/30 p-px shadow-[0_0_60px_-20px_rgba(228,184,77,0.35)]">
        <div className="relative rounded-[23px] bg-[#080a10]/95 p-5 sm:p-6">
          <div
            className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-gold/20 blur-3xl"
            aria-hidden
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">
            {t("feedBadge")}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-cairo)] text-xl font-extrabold text-white sm:text-2xl">
            {t("memberHub")}
          </h2>
          <p className="mt-2 text-sm text-white/55">{t("memberOnlyHint")}</p>

          <form
            id={`event-post-${eventId}`}
            action={postAction}
            className="relative mt-5 space-y-3"
          >
            <input type="hidden" name="eventId" value={eventId} />
            <textarea
              name="body"
              required
              maxLength={4000}
              rows={3}
              disabled={postPending}
              placeholder={t("postPlaceholder")}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner outline-none transition focus:border-gold/45 focus:shadow-[0_0_24px_-8px_rgba(228,184,77,0.4)]"
            />
            <button
              type="submit"
              disabled={postPending}
              className="w-full rounded-full bg-gradient-to-r from-[#B07D2B] to-[#E4B84D] py-2.5 text-sm font-extrabold text-black shadow-[0_0_28px_-6px_rgba(228,184,77,0.55)] transition hover:brightness-110 disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {postPending ? "…" : t("postSubmit")}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-4xl opacity-40" aria-hidden>
              ✦
            </p>
            <p className="mt-3 text-sm font-semibold text-white/50">{t("feedEmpty")}</p>
          </div>
        ) : (
          posts.map((p) => (
            <EventPostCard key={p.id} eventId={eventId} post={p} currentUserId={currentUserId} />
          ))
        )}
      </div>
      </div>

      <EventContactAssistantBubble leads={contactLeads} />
    </>
  );
}
