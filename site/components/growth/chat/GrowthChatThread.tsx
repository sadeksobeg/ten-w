"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ChatMessageDTO } from "@/lib/growth/chat-service";
import type { ChatSuggestionItem } from "@/lib/growth/chat-suggestions";
import { suggestImpactDelta } from "@/lib/growth/chat-suggestions";
import { GrowthChatMessageBubble } from "@/components/growth/chat/GrowthChatMessageBubble";
import { playDemoChime } from "@/lib/demo/demo-sound";

type Props = {
  conversationId: string;
  viewerUserId: string;
  isAdmin: boolean;
  locale: string;
  /** Prefer SSE when true (falls back to polling if EventSource errors). */
  preferRealtime?: boolean;
  hideThreadTitle?: boolean;
  scrollMaxClassName?: string;
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
  scrollMaxClassName = "max-h-[min(52vh,420px)]",
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
  }, [conversationId]);

  useEffect(() => {
    if (!probShift) return;
    const id = window.setTimeout(() => setProbShift(null), 4200);
    return () => window.clearTimeout(id);
  }, [probShift]);

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
    tpl: "push_close" | "offer_bonus" | "ask_update" | "commission_nudge",
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
    } catch {
      setError(t("sendError"));
    } finally {
      setBusy(false);
    }
  };

  const showAvatarRow = useCallback((idx: number) => {
    const m = items[idx];
    if (!m) return true;
    const prev = items[idx - 1];
    if (!prev) return true;
    if (prev.senderUserId !== m.senderUserId) return true;
    const dt =
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return dt > GROUP_MS;
  }, [items]);

  const topSuggestions = suggestions.slice(0, 3);
  const moreSuggestions = suggestions.slice(3);

  const timelineNodes = items.flatMap((m, idx) => {
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

    const timeShort = new Intl.DateTimeFormat(nfTime, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(m.createdAt));

    const isEvent = ["SYSTEM", "BONUS", "BADGE", "WARNING", "ACTION"].includes(m.kind);

    const showInline =
      isAdmin &&
      m.senderUserId !== viewerUserId &&
      m.kind === "TEXT" &&
      m.body.trim().length > 0;

    const row = (
      <div
        key={m.id}
        className={`relative border-s border-white/10 ps-3 ms-0.5 ${
          isEvent ? "border-gold/30 bg-gold/[0.04]" : ""
        }`}
      >
        <div className="absolute start-0 top-3 h-2 w-2 -translate-x-[calc(50%+1px)] rounded-full bg-white/25 ring-2 ring-black/40" />
        <div className="flex items-baseline justify-between gap-2 pe-1 pt-1">
          <span className="font-mono text-[10px] font-semibold tabular-nums text-white/40">
            {timeShort}
          </span>
          {isEvent ? (
            <span className="text-[9px] font-bold uppercase tracking-wide text-gold/70">
              {t("timelineEvent")}
            </span>
          ) : null}
        </div>
        <GrowthChatMessageBubble
          message={m}
          viewerUserId={viewerUserId}
          isAdmin={isAdmin}
          locale={locale}
          showAvatarRow={showAvatarRow(idx)}
          kindLabel={kindLabel}
          partnerTag={t("partnerTag")}
          adminTag={t("adminTag")}
        />
        {showInline && topSuggestions.length > 0 ? (
          <div className="mb-2 mt-1 flex flex-wrap items-center gap-1 border-t border-white/5 pt-2">
            <span className="w-full text-[9px] font-bold uppercase tracking-wide text-white/35">
              {t("suggestedActions")}
            </span>
            {topSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={inlineBusy}
                onClick={() => void runQuickSuggest(s.suggestTemplate)}
                className="rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-semibold text-white/80 transition hover:scale-[1.03] hover:border-gold/35 hover:text-white active:scale-95 disabled:opacity-40"
              >
                {tIntel(s.labelKey as "suggestPushCloseHi")}
              </button>
            ))}
            {moreSuggestions.length > 0 ? (
              <details className="w-full">
                <summary className="cursor-pointer text-[10px] font-semibold text-gold/80 hover:text-gold">
                  {tIntel("suggestionsMore")}
                </summary>
                <div className="mt-1 flex flex-wrap gap-1">
                  {moreSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={inlineBusy}
                      onClick={() => void runQuickSuggest(s.suggestTemplate)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/75 hover:border-white/25"
                    >
                      {tIntel(s.labelKey as "suggestPushCloseHi")}
                    </button>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    );

    if (showDay) {
      return [
        <div
          key={`day-${dayKey(m.createdAt)}-${m.id}`}
          className="sticky top-0 z-10 mb-2 mt-2 border-b border-white/10 bg-[#050816]/95 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white/50 first:mt-0"
        >
          {t("timelineDay", { date: dayLabel })}
        </div>,
        row,
      ];
    }
    return [row];
  });

  return (
    <div dir={dir} className="space-y-4">
      {probShift ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-violet-400/35 bg-gradient-to-br from-violet-950/60 to-black/50 px-4 py-3 text-center shadow-[0_0_28px_rgba(139,92,246,0.12)]"
          role="status"
        >
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-200/90">
            {tIntel("probShiftLabel")}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xl font-black tabular-nums text-white sm:text-2xl">
            <span>{probShift.from}%</span>
            <motion.span
              aria-hidden
              initial={{ opacity: 0.3, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-gold"
            >
              →
            </motion.span>
            <motion.span
              key={probShift.to}
              initial={{ opacity: 0, x: dir === "rtl" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="text-gold drop-shadow-[0_0_12px_rgba(234,179,8,0.45)]"
            >
              {probShift.to}%
            </motion.span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/45">{tIntel("probShiftModeled")}</p>
        </motion.div>
      ) : null}
      {toast ? (
        <div
          className="motion-safe:animate-in motion-safe:fade-in rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      <div className="rounded-2xl border border-white/10 bg-[#050816]/80 p-4 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {hideThreadTitle ? null : (
          <div className="text-xs font-semibold text-white/50">{t("threadTitle")}</div>
        )}
        {isAdmin && topSuggestions.length > 0 ? (
          <div className="mt-3 rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/45 via-[#050816] to-black/60 px-3 py-2.5 shadow-[0_0_22px_rgba(16,185,129,0.1)]">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200/85">
              {tIntel("commitPathLabel")}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-white/80">
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-500/30 text-[11px] text-emerald-100 ring-1 ring-emerald-400/40">
                ✓
              </span>
              {tIntel("commitLockedBadge")}
            </div>
            <p className="mt-2 text-sm font-bold leading-snug text-white">
              {commitActionLine(tIntel, topSuggestions[0]!.suggestTemplate)}
            </p>
            <p className="mt-1 text-[10px] text-emerald-200/90">
              {tIntel("directiveImpactHint", { n: topSuggestions[0]!.impactCloseDelta })}
            </p>
          </div>
        ) : null}
        <div className={`mt-3 space-y-1 overflow-y-auto pe-1 ${scrollMaxClassName}`}>
          {items.length === 0 ? (
            <div className="text-sm text-white/45">{t("empty")}</div>
          ) : (
            timelineNodes
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="min-h-[72px] flex-1 resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition hover:border-white/15 focus:border-gold/35"
          placeholder={t("placeholder")}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSend()}
          className="rounded-xl bg-gradient-to-r from-gold/30 to-gold/15 px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-[0.98] disabled:opacity-50"
        >
          {t("send")}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
