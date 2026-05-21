"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ChatMessageDTO } from "@/lib/growth/chat-service";
import type { ChatSuggestionItem } from "@/lib/growth/chat-suggestions";
import { suggestImpactDelta } from "@/lib/growth/chat-suggestions";
import { GrowthChatMessageBubble } from "@/components/growth/chat/GrowthChatMessageBubble";
import { GrowthChatQuickActionsBar } from "@/components/growth/chat/GrowthChatQuickActionsBar";
import { playDemoChime } from "@/lib/demo/demo-sound";

type Props = {
  conversationId: string;
  viewerUserId: string;
  isAdmin: boolean;
  locale: string;
  preferRealtime?: boolean;
  hideThreadTitle?: boolean;
  /** @deprecated Use `embedded` + flex parent for height. Kept for partner page. */
  scrollMaxClassName?: string;
  /** Fills parent flex column (admin inbox center panel). */
  embedded?: boolean;
  className?: string;
};

const GROUP_MS = 5 * 60 * 1000;

function commitActionLine(
  t: (key: string) => string,
  tpl: ChatSuggestionItem["suggestTemplate"],
) {
  switch (tpl) {
    case "push_close":
      return t("commitAction_push_close");
    case "offer_bonus":
      return t("commitAction_offer_bonus");
    case "ask_update":
      return t("commitAction_ask_update");
    case "commission_nudge":
      return t("commitAction_commission_nudge");
    default:
      return t("commitAction_ask_update");
  }
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function chatSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("growthChatChime") === "1";
  } catch {
    return false;
  }
}

export function GrowthChatThread({
  conversationId,
  viewerUserId,
  isAdmin,
  locale,
  preferRealtime = true,
  hideThreadTitle = false,
  scrollMaxClassName,
  embedded = false,
  className = "",
}: Props) {
  const t = useTranslations("Growth.chat");
  const tMessage = useTranslations("Growth.chat.message");
  const tIntel = useTranslations("Growth.chat.intelligence");
  const [items, setItems] = useState<ChatMessageDTO[]>([]);
  const [suggestions, setSuggestions] = useState<ChatSuggestionItem[]>([]);
  const [modeledCloseProbability, setModeledCloseProbability] = useState<number | null>(
    null,
  );
  const [probShift, setProbShift] = useState<{ from: number; to: number } | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [inlineBusy, setInlineBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const lastTsRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sseDead, setSseDead] = useState(false);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const nfDate =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const nfTime =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const kindLabel = useCallback(
    (kind: string) => {
      switch (kind) {
        case "BONUS":
          return tMessage("kindBonus");
        case "BADGE":
          return tMessage("kindBadge");
        case "SYSTEM":
          return tMessage("kindSystem");
        case "WARNING":
          return tMessage("kindWarning");
        case "ACTION":
          return tMessage("kindAction");
        default:
          return kind;
      }
    },
    [tMessage],
  );

  const mergeIncoming = useCallback((rows: ChatMessageDTO[]) => {
    if (rows.length === 0) return;
    setItems((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      for (const m of rows) map.set(m.id, m);
      return [...map.values()].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
    const last = rows[rows.length - 1]!;
    lastTsRef.current = last.createdAt;
  }, []);

  const reloadAllMessages = useCallback(async () => {
    const res = await fetch(`/api/growth/chat/${conversationId}/messages`);
    if (!res.ok) return;
    const data = (await res.json()) as { items: ChatMessageDTO[] };
    setItems(data.items);
    if (data.items.length > 0) {
      lastTsRef.current = data.items[data.items.length - 1]!.createdAt;
    } else {
      lastTsRef.current = null;
    }
  }, [conversationId]);

  const loadInitial = reloadAllMessages;

  const loadSuggestions = useCallback(async () => {
    if (!isAdmin) {
      setSuggestions([]);
      setModeledCloseProbability(null);
      return;
    }
    const res = await fetch(`/api/growth/chat/${conversationId}/suggestions`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      suggestions: ChatSuggestionItem[];
      modeledCloseProbability?: number | null;
    };
    setSuggestions(data.suggestions);
    if (typeof data.modeledCloseProbability === "number") {
      setModeledCloseProbability(data.modeledCloseProbability);
    } else {
      setModeledCloseProbability(null);
    }
  }, [conversationId, isAdmin]);

  const poll = useCallback(async () => {
    const after = lastTsRef.current;
    if (!after) return;
    const res = await fetch(
      `/api/growth/chat/${conversationId}/messages?after=${encodeURIComponent(after)}`,
    );
    if (!res.ok) return;
    const data = (await res.json()) as { items: ChatMessageDTO[] };
    mergeIncoming(data.items);
  }, [conversationId, mergeIncoming]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    setSseDead(false);
    lastTsRef.current = null;
    setProbShift(null);
    setModeledCloseProbability(null);
    setItems([]);
  }, [conversationId]);

  useEffect(() => {
    if (!probShift) return;
    const id = window.setTimeout(() => setProbShift(null), 4200);
    return () => window.clearTimeout(id);
  }, [probShift]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => scrollToBottom(false));
    return () => window.cancelAnimationFrame(id);
  }, [items.length, conversationId, scrollToBottom]);

  const shouldPoll = !preferRealtime || sseDead;

  useEffect(() => {
    if (!shouldPoll) return;
    const id = window.setInterval(() => void poll(), 4000);
    return () => window.clearInterval(id);
  }, [shouldPoll, poll]);

  useEffect(() => {
    if (!preferRealtime || sseDead) return;
    if (typeof EventSource === "undefined") {
      setSseDead(true);
      return;
    }
    const url = `/api/growth/chat/${conversationId}/subscribe`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as {
          type?: string;
          id: string;
          senderUserId: string;
          body: string;
          kind: string;
          createdAt: string;
          metadata?: Record<string, unknown> | null;
        };
        if (msg.type === "message") {
          mergeIncoming([
            {
              id: msg.id,
              conversationId,
              senderUserId: msg.senderUserId,
              body: msg.body,
              kind: msg.kind,
              createdAt: msg.createdAt,
              metadata: msg.metadata ?? null,
            },
          ]);
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      es.close();
      setSseDead(true);
    };
    return () => {
      es.close();
    };
  }, [conversationId, mergeIncoming, preferRealtime, sseDead]);

  const runQuickSuggest = async (
    tpl: ChatSuggestionItem["suggestTemplate"],
  ) => {
    setInlineBusy(true);
    const delta =
      suggestions.find((s) => s.suggestTemplate === tpl)?.impactCloseDelta ??
      suggestImpactDelta(tpl);
    const fromProb = modeledCloseProbability ?? 52;
    try {
      const res = await fetch(`/api/growth/chat/${conversationId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", suggestTemplate: tpl }),
      });
      if (res.ok) {
        await reloadAllMessages();
        await loadSuggestions();
        const toProb = Math.min(99, fromProb + delta);
        setProbShift({ from: fromProb, to: toProb });
        window.setTimeout(() => flashToast(t("microCommitOk")), 280);
        playDemoChime(chatSoundEnabled());
        scrollToBottom(true);
      }
    } finally {
      setInlineBusy(false);
    }
  };

  const onSend = async () => {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/growth/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, kind: "TEXT" }),
      });
      if (!res.ok) {
        setError(t("sendError"));
        setBusy(false);
        return;
      }
      const data = (await res.json()) as { message: ChatMessageDTO };
      mergeIncoming([data.message]);
      setBody("");
      flashToast(t("microActionOk"));
      playDemoChime(chatSoundEnabled());
      scrollToBottom(true);
    } catch {
      setError(t("sendError"));
    } finally {
      setBusy(false);
    }
  };

  const showAvatarRow = useCallback(
    (idx: number) => {
      const m = items[idx];
      if (!m) return true;
      const prev = items[idx - 1];
      if (!prev) return true;
      if (prev.senderUserId !== m.senderUserId) return true;
      const dt =
        new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime();
      return dt > GROUP_MS;
    },
    [items],
  );

  const topSuggestion = suggestions[0];
  const scrollAreaClass = embedded
    ? "min-h-0 flex-1"
    : scrollMaxClassName ?? "max-h-[min(52vh,420px)]";

  const messageNodes = items.flatMap((m, idx) => {
    const prev = items[idx - 1];
    const showDay =
      idx === 0 || (prev && dayKey(prev.createdAt) !== dayKey(m.createdAt));
    const dayDate = new Date(m.createdAt);
    const dayLabel =
      new Date().toDateString() === dayDate.toDateString()
        ? t("timelineToday")
        : new Intl.DateTimeFormat(nfDate, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).format(dayDate);

    const mine = m.senderUserId === viewerUserId;
    const avatarLabel = mine
      ? isAdmin
        ? t("adminTag")
        : t("partnerTag")
      : isAdmin
        ? t("partnerTag")
        : t("adminTag");

    const row = (
      <GrowthChatMessageBubble
        key={m.id}
        message={m}
        viewerUserId={viewerUserId}
        isAdmin={isAdmin}
        locale={locale}
        showAvatarRow={showAvatarRow(idx)}
        kindLabel={kindLabel}
        partnerTag={t("partnerTag")}
        adminTag={t("adminTag")}
        avatarLabel={avatarLabel}
      />
    );

    if (showDay) {
      return [
        <div
          key={`day-${dayKey(m.createdAt)}`}
          className="flex justify-center py-3 first:pt-1"
        >
          <span className="rounded-full border border-white/10 bg-[#0a1020]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white/45 shadow-sm">
            {t("timelineDay", { date: dayLabel })}
          </span>
        </div>,
        row,
      ];
    }
    return [row];
  });

  const shellClass = embedded
    ? `flex h-full min-h-0 flex-col ${className}`
    : `space-y-3 ${className}`;

  return (
    <div dir={dir} className={shellClass}>
      <AnimatePresence>
        {probShift ? (
          <motion.div
            key="prob"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 overflow-hidden px-3 pt-2"
          >
            <div
              className="rounded-xl border border-violet-400/35 bg-gradient-to-br from-violet-950/60 to-black/50 px-4 py-2.5 text-center"
              role="status"
            >
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-200/90">
                {tIntel("probShiftLabel")}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-lg font-black tabular-nums text-white">
                <span>{probShift.from}%</span>
                <span className="text-gold">→</span>
                <span className="text-gold">{probShift.to}%</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {toast ? (
        <div
          className="mx-3 shrink-0 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-center text-xs font-semibold text-emerald-100"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div
        className={
          embedded
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "rounded-2xl border border-white/10 bg-[#050816]/80 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        }
      >
        {!embedded && !hideThreadTitle ? (
          <div className="border-b border-white/10 px-4 py-2.5 text-xs font-semibold text-white/50">
            {t("threadTitle")}
          </div>
        ) : null}

        {isAdmin && topSuggestion ? (
          <div className="shrink-0 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-[#050816] to-transparent px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-100 ring-1 ring-emerald-400/35">
                {tIntel("commitLockedBadge")}
              </span>
              <p className="min-w-0 flex-1 text-xs font-semibold leading-snug text-white/90">
                {commitActionLine(tIntel, topSuggestion.suggestTemplate)}
              </p>
            </div>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className={`overflow-y-auto px-3 py-3 ${scrollAreaClass} ${
            embedded ? "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Cpath d=%22M0 20h40M20 0v40%22 stroke=%22%23ffffff%22 stroke-opacity=%220.03%22/%3E%3C/svg%3E')]" : ""
          }`}
        >
          {items.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <p className="text-sm text-white/45">{t("empty")}</p>
              {!isAdmin ? (
                <p className="mt-1 text-xs text-white/30">{t("partnerSupportHint")}</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-0.5">{messageNodes}</div>
          )}
        </div>

        {isAdmin ? (
          <GrowthChatQuickActionsBar
            suggestions={suggestions}
            disabled={inlineBusy}
            onSuggest={(tpl) => void runQuickSuggest(tpl)}
          />
        ) : null}

        <div className="shrink-0 border-t border-white/10 bg-[#070b18]/95 p-3 backdrop-blur-md">
          <div className="flex items-end gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy && body.trim()) void onSend();
                }
              }}
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold/35"
              placeholder={t("placeholder")}
            />
            <button
              type="button"
              disabled={busy || !body.trim()}
              onClick={() => void onSend()}
              aria-label={t("send")}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/50 to-gold/20 text-lg font-bold text-white shadow-[0_0_20px_rgba(234,179,8,0.25)] transition hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              ↑
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
