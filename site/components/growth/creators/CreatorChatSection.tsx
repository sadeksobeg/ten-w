"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import {
  IconFire,
  IconStar,
  IconThumbUp,
  IconHeart,
  IconTrophy,
  IconLightning,
} from "@/components/growth/icons/GrowthIcons";
import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import { mergeChatRoomMessages } from "@/lib/growth/chat-display";
import type { CreatorChatRoomPreview } from "@/lib/growth/creator-chat";
import type { CreatorHubViewer } from "./CreatorHubTypes";

const CHAR_LIMIT = 280;
const REACTIONS = [
  { key: "fire", Icon: IconFire },
  { key: "star", Icon: IconStar },
  { key: "thumb", Icon: IconThumbUp },
  { key: "heart", Icon: IconHeart },
  { key: "trophy", Icon: IconTrophy },
  { key: "lightning", Icon: IconLightning },
] as const;

type Props = {
  locale: string;
  isRoomMember: boolean;
  viewer: CreatorHubViewer;
  rooms: CreatorChatRoomPreview[];
  isActive: boolean;
  onUnread?: (n: number) => void;
};

export function CreatorChatSection({
  locale: _locale,
  isRoomMember,
  viewer,
  rooms: initialRooms,
  isActive,
  onUnread,
}: Props) {
  const t = useTranslations("Creators.chat");
  const [rooms, setRooms] = useState(initialRooms);
  const [activeSlug, setActiveSlug] = useState(initialRooms[0]?.slug ?? "content-creators");
  const [messages, setMessages] = useState<ChatRoomMessageDTO[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [newBelow, setNewBelow] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  const viewerName = viewer.displayName ?? viewer.name ?? viewer.email;

  const loadMessages = useCallback(async (slug: string) => {
    const res = await fetch(`/api/growth/chat/rooms/${slug}/messages`);
    if (!res.ok) return;
    const data = (await res.json()) as { items?: ChatRoomMessageDTO[] };
    setMessages((prev) => mergeChatRoomMessages([], data.items ?? prev));
  }, []);

  useEffect(() => {
    if (!isRoomMember || !isActive) return;
    void loadMessages(activeSlug);
    void fetch(`/api/growth/chat/rooms/${activeSlug}/read`, { method: "POST" }).catch(() => {});
  }, [activeSlug, isRoomMember, isActive, loadMessages]);

  useEffect(() => {
    if (!isRoomMember || !isActive) return;
    const es = new EventSource(`/api/growth/chat/rooms/${activeSlug}/subscribe`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as {
          type?: string;
          items?: ChatRoomMessageDTO[];
          names?: string[];
        };
        if (data.type === "messages" && data.items?.length) {
          setMessages((prev) => mergeChatRoomMessages(prev, data.items!));
          if (!atBottomRef.current) {
            setNewBelow((n) => n + data.items!.length);
            onUnread?.(data.items!.length);
          }
        }
        if (data.type === "typing" && Array.isArray(data.names)) {
          setTypingNames(data.names as string[]);
        }
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [activeSlug, isRoomMember, isActive, onUnread]);

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(`/api/growth/chat/rooms/${activeSlug}/typing`);
      if (res.ok) {
        const data = (await res.json()) as { names?: string[] };
        setTypingNames(data.names ?? []);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [activeSlug]);

  async function send() {
    const text = body.trim();
    if (!text || sending) return;
    const optimistic: ChatRoomMessageDTO = {
      id: `opt-${Date.now()}`,
      roomId: "",
      senderUserId: viewer.userId,
      senderName: viewerName,
      senderEmail: viewer.email,
      senderAvatarUrl: viewer.avatarUrl ?? null,
      senderAvatarPreset: viewer.avatarPreset ?? null,
      senderLevelCode: viewer.levelCode,
      isVerifiedOfficial: false,
      officialDisplayName: null,
      senderChatBadges: [],
      body: text,
      kind: "TEXT",
      metadata: null,
      isOfficial: false,
      triggerKey: null,
      createdAt: new Date().toISOString(),
      editedAt: null,
      isDeleted: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    setSending(true);
    setFailedId(null);
    const fd = new FormData();
    fd.set("body", text);
    const res = await fetch(`/api/growth/chat/rooms/${activeSlug}/messages`, { method: "POST", body: fd });
    setSending(false);
    if (!res.ok) {
      setFailedId(optimistic.id);
      return;
    }
    void loadMessages(activeSlug);
    void fetch(`/api/growth/chat/rooms/${activeSlug}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing: false }),
    });
  }

  function onType(val: string) {
    setBody(val.slice(0, CHAR_LIMIT));
    void fetch(`/api/growth/chat/rooms/${activeSlug}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing: true, name: viewerName }),
    });
  }

  async function toggleReaction(messageId: string, emoji: string) {
    await fetch(`/api/growth/chat/rooms/${activeSlug}/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    void loadMessages(activeSlug);
  }

  if (!isRoomMember) {
    return (
      <div className="creator-card flex min-h-[50dvh] items-center justify-center p-8 text-center">
        <p className="max-w-sm text-sm text-amber-100/90">{t("accessPending")}</p>
      </div>
    );
  }

  return (
    <div className="creator-card flex min-h-[min(70dvh,640px)] overflow-hidden">
      <aside className="hidden w-56 shrink-0 flex-col border-e border-white/10 bg-[var(--creator-surface-2)] md:flex">
        <p className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-white/45">{t("rooms")}</p>
        <ul className="flex-1 overflow-y-auto">
          {rooms.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                onClick={() => {
                  setActiveSlug(r.slug);
                  setNewBelow(0);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-start text-xs ${
                  activeSlug === r.slug ? "creator-nav-active" : "text-white/65 hover:bg-white/[0.04]"
                }`}
              >
                <span className="font-mono text-white/40">#</span>
                <span className="min-w-0 flex-1 truncate">{r.title}</span>
                {r.unread > 0 ? (
                  <span className="rounded-full bg-[var(--creator-primary)] px-1.5 text-[9px] font-bold text-white">{r.unread}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-white/10 px-3 py-2 text-[10px] text-white/40">{t("direct")}</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-white/10 px-4 py-3">
          <h2 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">#{rooms.find((r) => r.slug === activeSlug)?.title ?? activeSlug}</h2>
          <p className="text-[11px] text-white/45">{t("charLimit", { max: CHAR_LIMIT })}</p>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
          onScroll={(e) => {
            const el = e.currentTarget;
            atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
            if (atBottomRef.current) setNewBelow(0);
          }}
        >
          {messages.map((m) => {
            const mine = m.senderUserId === viewer.userId;
            return (
              <div key={m.id} className={`group mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
                {!mine ? (
                  <GrowthAvatar name={m.senderName} email={m.senderUserId} avatarUrl={m.senderAvatarUrl} size="sm" className="me-2 shrink-0" />
                ) : null}
                <div className="max-w-[85%]">
                  {!mine ? <p className="mb-0.5 text-[10px] font-semibold text-[var(--creator-accent)]">{m.senderName}</p> : null}
                  <div className={`px-3 py-2 text-sm ${mine ? "creator-bubble-mine" : "creator-bubble-them"}`}>
                    {m.body}
                    {failedId === m.id ? <p className="mt-1 text-[10px] text-rose-300">{t("failed")}</p> : null}
                  </div>
                  <div className="mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    {REACTIONS.map(({ key, Icon }) => (
                      <button key={key} type="button" className="rounded p-0.5 text-white/50 hover:text-[var(--creator-secondary)]" onClick={() => void toggleReaction(m.id, key)}>
                        <Icon size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {newBelow > 0 ? (
          <button type="button" className="mx-4 mb-1 rounded-full bg-[var(--creator-primary)]/20 px-3 py-1 text-[11px] font-bold text-rose-200" onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })}>
            {t("newMessages", { n: newBelow })}
          </button>
        ) : null}

        {typingNames.length > 0 ? (
          <p className="px-4 pb-1 text-[11px] text-white/45">{t("typing", { name: typingNames[0]! })}</p>
        ) : null}

        <div className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={body}
            onChange={(e) => onType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--creator-primary)]/40"
            maxLength={CHAR_LIMIT}
          />
          <GoldButton type="button" disabled={!body.trim() || sending} onClick={() => void send()}>
            {sending ? t("sending") : "↑"}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
