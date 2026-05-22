"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { VerifiedBadge } from "@/components/growth/ui/VerifiedBadge";
import { RankEmblem } from "@/components/growth/ui/RankEmblem";

type Props = {
  locale: string;
  viewerUserId: string;
  viewerEmail: string;
  viewerName: string | null;
};

export function GrowthCommunityChat({
  locale,
  viewerUserId,
  viewerEmail,
  viewerName,
}: Props) {
  const t = useTranslations("Growth.chat");
  const tKw = useTranslations("Growth.chat.keywords");
  const [messages, setMessages] = useState<ChatRoomMessageDTO[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/chat/rooms/community/messages");
      if (!res.ok) {
        setError(t("communityLoadError"));
        return;
      }
      setError(null);
      const data = (await res.json()) as { items: ChatRoomMessageDTO[] };
      setMessages(data.items);
    } catch {
      setError(t("communityLoadError"));
    }
  }, [t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/growth/chat/rooms/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        setError(t("sendError"));
        return;
      }
      setBody("");
      await load();
    } catch {
      setError(t("sendError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 bg-gold/5 px-4 py-2 text-center text-[11px] text-gold/90">
        {t("communityHint")}
      </div>
      {error ? (
        <p className="shrink-0 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((m) => {
          if (m.kind === "ACTION" && m.metadata?.links) {
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

          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
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
                </div>
                <div
                  className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                    official
                      ? "border border-gold/40 bg-gradient-to-br from-gold/20 to-gold/5 text-white"
                      : mine
                        ? "bg-gold/20 text-white"
                        : "border border-white/10 bg-white/[0.06] text-white/90"
                  }`}
                >
                  {m.body}
                </div>
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
            placeholder={t("communityPlaceholder")}
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
