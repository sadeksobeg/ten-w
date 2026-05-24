"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import { COMMUNITY_ROOM_SLUG } from "@/lib/growth/chat-room-service";
import { PartnerNameBadges } from "@/components/growth/badges/PartnerNameBadges";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { VerifiedBadge } from "@/components/growth/ui/VerifiedBadge";
import { RankEmblem } from "@/components/growth/ui/RankEmblem";

const PAGE_SIZE = 35;
const POLL_MS = 8000;

type Props = {
  locale: string;
  viewerUserId: string;
  viewerEmail: string;
  viewerName: string | null;
  roomSlug?: string;
  hintKey?: "communityHint" | "eventChatHint" | "creatorChatHint";
  placeholderKey?: "communityPlaceholder" | "eventChatPlaceholder" | "creatorChatPlaceholder";
};

function mergeMessages(prev: ChatRoomMessageDTO[], incoming: ChatRoomMessageDTO[]): ChatRoomMessageDTO[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) map.set(m.id, m);
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function GrowthCommunityChat({
  locale: _locale,
  viewerUserId,
  viewerEmail: _viewerEmail,
  viewerName: _viewerName,
  roomSlug = COMMUNITY_ROOM_SLUG,
  hintKey = "communityHint",
  placeholderKey = "communityPlaceholder",
}: Props) {
  const t = useTranslations("Growth.chat");
  const tKw = useTranslations("Growth.chat.keywords");
  const enableKeywords = roomSlug === COMMUNITY_ROOM_SLUG;
  const [messages, setMessages] = useState<ChatRoomMessageDTO[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [canModerate, setCanModerate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickBottomRef = useRef(true);
  const messagesRef = useRef<ChatRoomMessageDTO[]>([]);
  const lastPollAtRef = useRef(new Date().toISOString());
  const apiBase = `/api/growth/chat/rooms/${encodeURIComponent(roomSlug)}/messages`;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback((smooth: boolean) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const loadInitial = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}?limit=${PAGE_SIZE}`);
      if (!res.ok) {
        setError(t("communityLoadError"));
        return;
      }
      setError(null);
      const data = (await res.json()) as {
        items: ChatRoomMessageDTO[];
        hasMore: boolean;
        canModerate?: boolean;
      };
      setMessages(data.items);
      setHasMoreOlder(data.hasMore);
      setCanModerate(Boolean(data.canModerate));
      stickBottomRef.current = true;
    } catch {
      setError(t("communityLoadError"));
    } finally {
      setLoadingInitial(false);
    }
  }, [apiBase, t]);

  const pollNew = useCallback(async () => {
    const list = messagesRef.current;
    const last = list[list.length - 1];
    const deletedSince = encodeURIComponent(lastPollAtRef.current);
    const qs = last
      ? `?after=${encodeURIComponent(last.createdAt)}&limit=50&deletedSince=${deletedSince}`
      : `?limit=${PAGE_SIZE}&deletedSince=${deletedSince}`;
    try {
      const res = await fetch(`${apiBase}${qs}`);
      if (!res.ok) return;
      lastPollAtRef.current = new Date().toISOString();
      const data = (await res.json()) as {
        items: ChatRoomMessageDTO[];
        deletedIds?: string[];
      };
      const removed = new Set(data.deletedIds ?? []);
      if (removed.size > 0) {
        setMessages((prev) => prev.filter((m) => !removed.has(m.id)));
      }
      if (data.items.length === 0) return;
      setMessages((prev) => mergeMessages(prev, data.items));
      if (stickBottomRef.current) scrollToBottom(false);
    } catch {
      /* ignore */
    }
  }, [apiBase, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    const list = messagesRef.current;
    const first = list[0];
    if (!first || loadingOlder || !hasMoreOlder) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const res = await fetch(
        `${apiBase}?before=${encodeURIComponent(first.createdAt)}&limit=${PAGE_SIZE}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { items: ChatRoomMessageDTO[]; hasMore: boolean };
      setMessages((prev) => mergeMessages(data.items, prev));
      setHasMoreOlder(data.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [apiBase, loadingOlder, hasMoreOlder]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (loadingInitial) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void pollNew();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadingInitial, pollNew]);

  useEffect(() => {
    if (loadingInitial || !stickBottomRef.current) return;
    scrollToBottom(messages.length > 1);
  }, [messages.length, loadingInitial, scrollToBottom]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 48 && hasMoreOlder && !loadingOlder) {
      void loadOlder();
    }
  }

  async function send() {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        setError(t("sendError"));
        return;
      }
      setBody("");
      stickBottomRef.current = true;
      await pollNew();
    } catch {
      setError(t("sendError"));
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(id: string) {
    if (!canModerate || !window.confirm(t("moderateConfirmDelete"))) return;
    const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function saveEdit(id: string) {
    const text = editDraft.trim();
    if (!text) return;
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, body: text, editedAt: new Date().toISOString() } : m,
        ),
      );
      setEditingId(null);
      setEditDraft("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 bg-gold/5 px-4 py-2 text-center text-[11px] text-gold/90">
        {t(hintKey)}
      </div>
      {error ? (
        <p className="shrink-0 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4"
      >
        {loadingOlder ? (
          <p className="py-2 text-center text-[10px] text-white/40">{t("loadingOlder")}</p>
        ) : hasMoreOlder ? (
          <button
            type="button"
            className="mx-auto block text-[10px] font-semibold text-gold/80 hover:text-gold"
            onClick={() => void loadOlder()}
          >
            {t("loadOlder")}
          </button>
        ) : null}
        {loadingInitial ? (
          <p className="py-8 text-center text-xs text-white/45">{t("loadingMessages")}</p>
        ) : null}
        {messages.filter((m) => !m.isDeleted && m.kind !== "DELETED").map((m) => {
          if (enableKeywords && m.kind === "ACTION" && m.metadata?.links) {
            const links = m.metadata.links as { labelKey: string; href: string }[];
            return (
              <div key={m.id} className="flex justify-center py-1">
                <div className="max-w-[92%] rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3">
                  <p className="mb-2 text-center text-[11px] font-bold text-sky-200">
                    {t("keywordPaths")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/25"
                      >
                        {tKw(l.labelKey as "deals")}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          if (m.kind === "SYSTEM") {
            const welcome =
              m.body === "welcome_official" ? t("communityWelcome") : m.body;
            return (
              <div key={m.id} className="flex justify-center">
                <p className="max-w-[90%] rounded-2xl border border-gold/30 bg-gold/10 px-4 py-2 text-center text-xs text-gold">
                  {welcome}
                </p>
              </div>
            );
          }

          const mine = m.senderUserId === viewerUserId;
          const official = m.isOfficial;
          const verified = m.isVerifiedOfficial;
          const editing = editingId === m.id;

          return (
            <div
              key={m.id}
              className={`group flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
            >
              <GrowthAvatar
                name={m.senderName}
                email={m.senderUserId}
                avatarUrl={m.senderAvatarUrl}
                avatarPreset={m.senderAvatarPreset}
                size="sm"
              />
              <div className={`max-w-[78%] min-w-0 ${mine ? "text-end" : "text-start"}`}>
                <div
                  className={`mb-0.5 flex flex-wrap items-center gap-1.5 ${mine ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-[11px] font-bold text-white/80">{m.senderName}</span>
                  <PartnerNameBadges badgeKeys={m.senderChatBadges ?? []} size="xs" />
                  {official ? <VerifiedBadge label={t("verifiedOfficial")} variant="gold" /> : null}
                  {!official && verified ? (
                    <VerifiedBadge label={t("verifiedPartner")} variant="gold" />
                  ) : null}
                  {m.senderLevelCode && !official ? (
                    <RankEmblem
                      levelCode={m.senderLevelCode}
                      size="sm"
                      className="!flex-row scale-75"
                    />
                  ) : null}
                  {m.editedAt ? (
                    <span className="text-[9px] text-white/35">{t("editedLabel")}</span>
                  ) : null}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full rounded-xl border border-gold/30 bg-black/40 px-3 py-2 text-sm text-white"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-gold/20 px-2 py-1 text-[10px] font-bold text-gold"
                        onClick={() => void saveEdit(m.id)}
                      >
                        {t("moderateSave")}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-[10px] text-white/50"
                        onClick={() => setEditingId(null)}
                      >
                        {t("moderateCancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        official
                          ? "border border-gold/40 bg-gradient-to-br from-gold/20 to-gold/5 text-white"
                          : mine
                            ? "bg-gold/20 text-white"
                            : "border border-white/10 bg-white/[0.06] text-white/90"
                      }`}
                    >
                      {m.body}
                    </div>
                    {canModerate && m.kind === "TEXT" ? (
                      <div
                        className={`mt-1 flex gap-2 opacity-0 transition group-hover:opacity-100 ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <button
                          type="button"
                          className="text-[9px] font-bold text-sky-300 hover:underline"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditDraft(m.body);
                          }}
                        >
                          {t("moderateEdit")}
                        </button>
                        <button
                          type="button"
                          className="text-[9px] font-bold text-rose-300 hover:underline"
                          onClick={() => void deleteMessage(m.id)}
                        >
                          {t("moderateDelete")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form
        className="shrink-0 border-t border-white/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t(placeholderKey)}
            className="min-h-[var(--growth-touch-min)] flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-gold/40"
            maxLength={8000}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="growth-touch-target shrink-0 rounded-xl bg-gradient-to-r from-gold/80 to-gold-bright px-4 text-sm font-bold text-bg disabled:opacity-50"
          >
            {t("send")}
          </button>
        </div>
      </form>
    </div>
  );
}
