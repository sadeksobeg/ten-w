"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  PartnerChatContextDTO,
  PartnerChatFocusStageKey,
} from "@/lib/growth/chat-partner-context";
import type { CommandStateKey } from "@/lib/growth/chat-command-state";
import type { ProbabilityFactorImpact } from "@/lib/growth/deal-close-probability";

type Props = {
  conversationId: string | null;
  locale: string;
  onConversationMetaChange?: () => void;
};

function money(locale: string, cents: number) {
  const loc = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function stageLabel(t: (k: string) => string, key: PartnerChatFocusStageKey) {
  switch (key) {
    case "stageLead":
      return t("stageLead");
    case "stageNegotiation":
      return t("stageNegotiation");
    case "stageWon":
      return t("stageWon");
    case "stageLost":
      return t("stageLost");
    default:
      return t("stageNegotiation");
  }
}

function insightCopy(t: (k: string) => string, key: string) {
  switch (key) {
    case "insightRescue":
      return t("insightRescue");
    case "insightPushClose":
      return t("insightPushClose");
    case "insightMomentum":
      return t("insightMomentum");
    case "insightFollowUp":
      return t("insightFollowUp");
    default:
      return t("insightSteady");
  }
}

function patternCopy(t: (k: string) => string, key: string) {
  switch (key) {
    case "patternCloser":
      return t("patternCloser");
    case "patternHeavyPipeline":
      return t("patternHeavyPipeline");
    default:
      return t("patternNeutral");
  }
}

function commandCopy(
  t: (k: string) => string,
  key: CommandStateKey,
): { title: string; sub: string } {
  switch (key) {
    case "closing_window":
      return { title: t("cmdStateClosingTitle"), sub: t("cmdStateClosingSub") };
    case "rescue":
      return { title: t("cmdStateRescueTitle"), sub: t("cmdStateRescueSub") };
    case "stale_pipeline":
      return { title: t("cmdStateStaleTitle"), sub: t("cmdStateStaleSub") };
    default:
      return { title: t("cmdStateSteadyTitle"), sub: t("cmdStateSteadySub") };
  }
}

function primarySignalLine(t: (k: string) => string, key: CommandStateKey) {
  switch (key) {
    case "closing_window":
      return t("primaryCloseNow");
    case "rescue":
      return t("primaryRescueNow");
    case "stale_pipeline":
      return t("primaryUnblockNow");
    default:
      return t("primarySteadyNow");
  }
}

function commandShell(key: CommandStateKey): string {
  switch (key) {
    case "closing_window":
      return "border-gold/50 bg-gradient-to-br from-gold/20 via-amber-950/30 to-black/50 shadow-[0_0_28px_rgba(234,179,8,0.18)]";
    case "rescue":
      return "border-rose-500/50 bg-gradient-to-br from-rose-600/25 via-rose-950/40 to-black/50 shadow-[0_0_24px_rgba(244,63,94,0.2)]";
    case "stale_pipeline":
      return "border-amber-400/45 bg-gradient-to-br from-amber-700/20 via-black/40 to-black/55";
    default:
      return "border-white/15 bg-gradient-to-br from-white/[0.07] to-black/50";
  }
}

function factorGlyph(t: (k: string) => string, impact: ProbabilityFactorImpact) {
  if (impact === "up") return t("factorUp");
  if (impact === "down") return t("factorDown");
  return t("factorNeutral");
}

/** Single headline “time-to-close” heuristic — illustrative, not a SLA. */
function expectedCloseMinutes(prob: number, cmd: CommandStateKey): number {
  let m = Math.round(11 + (100 - prob) * 0.38);
  if (cmd === "closing_window") m -= 5;
  if (cmd === "rescue") m += 6;
  if (cmd === "stale_pipeline") m += 4;
  return Math.max(8, Math.min(48, m));
}

export function PartnerContextPanel({
  conversationId,
  locale,
  onConversationMetaChange,
}: Props) {
  const t = useTranslations("Growth.chat.intelligence");
  const tDealStatus = useTranslations("Growth.deals.status");
  const [ctx, setCtx] = useState<PartnerChatContextDTO | null>(null);
  const [linkedDealId, setLinkedDealId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bonusUsd, setBonusUsd] = useState("50");
  const [badgeKey, setBadgeKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const tc = useTranslations("Growth.chat");

  const riskLine = useCallback(
    (reasonKey: string) => {
      switch (reasonKey) {
        case "riskHighPending":
          return t("riskReason.riskHighPending");
        case "riskMediumFollowUp":
          return t("riskReason.riskMediumFollowUp");
        default:
          return t("riskReason.riskOk");
      }
    },
    [t],
  );

  const load = useCallback(async () => {
    if (!conversationId) {
      setCtx(null);
      setLinkedDealId(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/growth/chat/${conversationId}/context`);
      if (!res.ok) {
        setErr(t("error"));
        setCtx(null);
        return;
      }
      const data = (await res.json()) as {
        context: PartnerChatContextDTO;
        linkedDealId: string | null;
      };
      setCtx(data.context);
      setLinkedDealId(data.linkedDealId);
      setBadgeKey((prev) => prev || data.context.adminBadges[0]?.key || "");
    } catch {
      setErr(t("error"));
      setCtx(null);
    } finally {
      setLoading(false);
    }
  }, [conversationId, t]);

  useEffect(() => {
    setBadgeKey("");
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!conversationId) return;
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, [conversationId, load]);

  const patchConv = async (body: Record<string, unknown>) => {
    if (!conversationId) return;
    setBusy("patch");
    try {
      const res = await fetch(`/api/growth/chat/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onConversationMetaChange?.();
        await load();
        setToast(tc("microActionOk"));
        window.setTimeout(() => setToast(null), 2600);
      }
    } finally {
      setBusy(null);
    }
  };

  const quick = async (payload: Record<string, unknown>) => {
    if (!conversationId) return;
    setBusy("quick");
    try {
      const res = await fetch(`/api/growth/chat/${conversationId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onConversationMetaChange?.();
        await load();
        setToast(tc("microActionOk"));
        window.setTimeout(() => setToast(null), 2600);
      }
    } finally {
      setBusy(null);
    }
  };

  if (!conversationId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-sm text-white/45 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {t("empty")}
      </div>
    );
  }

  if (loading && !ctx) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#050816]/80 p-4 text-sm text-white/50 backdrop-blur-xl">
        {t("loading")}
      </div>
    );
  }

  if (err || !ctx) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#050816]/80 p-4 backdrop-blur-xl">
        <p className="text-sm text-rose-300">{err ?? t("error")}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:scale-[1.02] hover:bg-white/5 active:scale-[0.98]"
        >
          {t("refresh")}
        </button>
      </div>
    );
  }

  const riskRibbonLabel =
    ctx.risk.level === "HIGH"
      ? t("riskRibbonHigh")
      : ctx.risk.level === "MEDIUM"
        ? t("riskRibbonMedium")
        : t("riskRibbonLow");

  const prob = ctx.focusDeal?.closeProbability;
  const cmd = commandCopy(t, ctx.commandStateKey);
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-[#050816]/95 p-1 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {toast ? (
        <div
          className="mx-1 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2 py-1.5 text-center text-[11px] font-semibold text-emerald-100"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      <div className="mx-1 rounded-2xl border border-gold/45 bg-gradient-to-b from-gold/[0.14] via-black/60 to-black/80 px-4 py-4 text-center shadow-[0_0_32px_rgba(234,179,8,0.12)]">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gold/80">
          {t("primarySignalLabel")}
        </div>
        <div className="mt-2 font-[family-name:var(--font-cairo)] text-[1.65rem] font-black leading-none tracking-tight text-white md:text-3xl">
          {primarySignalLine(t, ctx.commandStateKey)}
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {cmd.title}
        </p>
      </div>
      <div className={`mx-1 rounded-xl border-2 px-4 py-3 ${commandShell(ctx.commandStateKey)}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {t("decisionTitle")}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/70">{cmd.sub}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/55">
          <span className="rounded bg-black/35 px-2 py-0.5">{riskRibbonLabel}</span>
          <span
            className={
              ctx.risk.level === "HIGH"
                ? "text-rose-200"
                : ctx.risk.level === "MEDIUM"
                  ? "text-amber-200"
                  : "text-emerald-200"
            }
          >
            {ctx.risk.level}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 px-3 pt-1">
        <div className="min-w-0">
          <div className="truncate font-[family-name:var(--font-cairo)] text-lg font-black tracking-tight text-white">
            {ctx.name ?? ctx.email}
          </div>
          <div className="text-xs font-semibold text-gold/90">{ctx.levelName}</div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/55 transition hover:scale-105 hover:border-gold/30 hover:text-white active:scale-95"
        >
          {t("refresh")}
        </button>
      </div>

      <div className="mx-3 rounded-xl border border-sky-500/25 bg-sky-500/[0.07] px-3 py-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-sky-200/90">
          {t("activeDealTitle")}
        </div>
        {ctx.focusDeal ? (
          <>
            <div className="mt-1 text-sm font-bold text-white">
              {ctx.focusDeal.productName}
              {ctx.focusDeal.clientLabel ? (
                <span className="font-normal text-white/50"> — {ctx.focusDeal.clientLabel}</span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
              <span className="rounded bg-black/30 px-2 py-0.5 font-semibold text-white/80">
                {stageLabel(t, ctx.focusDeal.stageKey)}
              </span>
              <span>{money(locale, Math.round(ctx.focusDeal.saleUsd * 100))}</span>
              <span className="text-white/35">·</span>
              <span>{tDealStatus(ctx.focusDeal.status.toLowerCase() as "pending" | "closed" | "lost")}</span>
            </div>
            {prob != null ? (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/45">
                  <span>{t("closeProbability")}</span>
                  <span className="text-gold">{prob}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold-bright shadow-[0_0_12px_rgba(234,179,8,0.45)] transition-all duration-700"
                    style={{ width: `${prob}%` }}
                  />
                </div>
                <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-950/25 px-2.5 py-2">
                  <div className="text-[9px] font-black uppercase tracking-wide text-emerald-200/85">
                    {t("expectedOutcomeTitle")}
                  </div>
                  <p className="mt-1 text-sm font-bold leading-snug text-white">
                    {t("expectedOutcomeCloseMin", {
                      m: expectedCloseMinutes(prob, ctx.commandStateKey),
                    })}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">
                    {t("expectedOutcomeHint")}
                  </p>
                </div>
                {ctx.focusDeal.probabilityFactors.length > 0 ? (
                  <div className="mt-3 border-t border-white/10 pt-2">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-white/40">
                      {t("probFactorsTitle")}
                    </div>
                    <ul className="mt-1 space-y-1 text-[11px] text-white/70">
                      {ctx.focusDeal.probabilityFactors.map((f) => {
                        const label =
                          f.key === "dealValue"
                            ? t("probFactors.dealValue")
                            : f.key === "streak"
                              ? t("probFactors.streak")
                              : f.key === "conversion"
                                ? t("probFactors.conversion")
                                : t("probFactors.recency");
                        return (
                        <li key={f.key} className="flex items-start gap-2">
                          <span
                            className={
                              f.impact === "up"
                                ? "text-emerald-300"
                                : f.impact === "down"
                                  ? "text-rose-300"
                                  : "text-white/40"
                            }
                          >
                            {factorGlyph(t, f.impact)}
                          </span>
                          <span>{label}</span>
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-xs text-white/45">{t("noFocusDeal")}</p>
        )}
      </div>

      <div className="mx-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-3 py-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-violet-200/85">
          {t("insightTitle")}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-white/75">
          {insightCopy(t, ctx.insightKey)}
        </p>
      </div>

      <div className="mx-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/40">
          {t("patternTitle")}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-white/65">{patternCopy(t, ctx.patternKey)}</p>
      </div>

      <details className="mx-3 group rounded-xl border border-white/10 bg-black/20 open:border-white/20">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-[11px] font-semibold text-gold/90 outline-none transition hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
          <span className="flex w-full items-center justify-between gap-2">
            <span>{t("detailsToggle")}</span>
            <span className="text-[10px] text-white/40 transition group-open:rotate-180">▼</span>
          </span>
        </summary>
        <div className="space-y-3 border-t border-white/10 px-3 py-3">
          <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-black/40 to-black/55 px-3 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
              {t("earnedLabel")}
            </div>
            <div className="mt-0.5 font-[family-name:var(--font-cairo)] text-2xl font-black text-white tabular-nums">
              {money(locale, ctx.earningsCents)}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-white/50">{riskLine(ctx.risk.reasonKey)}</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center">
              <div className="text-white/40">{t("xp")}</div>
              <div className="font-bold text-white">{ctx.totalXp}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center">
              <div className="text-white/40">{t("conversion")}</div>
              <div className="font-bold text-white">{ctx.conversionPct}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center">
              <div className="text-white/40">{t("statPending")}</div>
              <div className="font-bold text-white">{ctx.pendingDeals}</div>
            </div>
          </div>
          <div className="text-[10px] text-white/45">
            {t("dealsLine", {
              closed: ctx.closedDeals,
              pending: ctx.pendingDeals,
              streak: ctx.streakCurrent,
            })}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-2">
            <div className="text-[9px] font-semibold uppercase text-white/40">{t("linkedDeal")}</div>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={linkedDealId ?? ""}
                onChange={(e) =>
                  setLinkedDealId(e.target.value === "" ? null : e.target.value)
                }
                className="w-full flex-1 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-white outline-none focus:border-gold/35"
              >
                <option value="">{t("noDeal")}</option>
                {ctx.deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.productName}
                    {d.clientLabel ? ` — ${d.clientLabel}` : ""} ·{" "}
                    {tDealStatus(d.status.toLowerCase() as "pending" | "closed" | "lost")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy === "patch"}
                onClick={() => void patchConv({ linkedDealId: linkedDealId ?? null })}
                className="rounded-md bg-white/10 px-2 py-1.5 text-[10px] font-bold text-white transition hover:scale-[1.03] hover:bg-white/15 active:scale-95 disabled:opacity-50"
              >
                {t("saveLink")}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(["HIGH", "NORMAL", "LOW"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={busy === "patch"}
                  onClick={() => void patchConv({ priority: p })}
                  className="rounded-md border border-white/10 px-2 py-1 text-[9px] font-bold uppercase text-white/65 transition hover:scale-105 hover:border-gold/35 hover:text-white active:scale-95 disabled:opacity-50"
                >
                  {p === "HIGH"
                    ? t("priorityHigh")
                    : p === "NORMAL"
                      ? t("priorityNormal")
                      : t("priorityLow")}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-white/5 bg-black/30 px-2 py-2">
            <div className="text-[9px] font-semibold uppercase text-white/35">{t("activeDeals")}</div>
            <ul className="mt-1 space-y-1 text-[10px] text-white/60">
              {ctx.deals.map((d) => (
                <li key={d.id} className="truncate">
                  <span className="text-white/80">{d.productName}</span> ·{" "}
                  {money(locale, Math.round(d.saleUsd * 100))} ·{" "}
                  {tDealStatus(d.status.toLowerCase() as "pending" | "closed" | "lost")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <div className="mx-3 border-t border-white/10 pb-3 pt-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/45">
          {t("actionsTitle")}
        </div>
        <div className="mt-2 grid gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void quick({ action: "suggest", suggestTemplate: "push_close" })}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:scale-[1.02] hover:border-gold/35 hover:shadow-[0_0_18px_rgba(234,179,8,0.15)] active:scale-[0.98] disabled:opacity-50"
            >
              {t("suggestClose")}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void quick({ action: "suggest", suggestTemplate: "commission_nudge" })}
              className="flex-1 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2.5 text-[11px] font-bold text-sky-100 transition hover:scale-[1.02] hover:border-sky-400/45 hover:shadow-[0_0_18px_rgba(56,189,248,0.12)] active:scale-[0.98] disabled:opacity-50"
            >
              {t("increaseCommission")}
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col text-[10px] text-white/45">
              {t("amountUsd")}
              <input
                value={bonusUsd}
                onChange={(e) => setBonusUsd(e.target.value)}
                inputMode="decimal"
                className="mt-0.5 w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-gold/35"
              />
            </label>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                const n = Number(bonusUsd);
                if (!Number.isFinite(n) || n < 1) return;
                void quick({ action: "bonus", amountUsd: n });
              }}
              className="rounded-xl bg-emerald-500/25 px-4 py-2.5 text-xs font-extrabold text-emerald-50 ring-1 ring-emerald-400/35 transition hover:scale-[1.03] hover:bg-emerald-500/35 active:scale-95 disabled:opacity-50"
            >
              {t("giveBonus")}
            </button>
            <select
              value={badgeKey}
              onChange={(e) => setBadgeKey(e.target.value)}
              className="min-w-[100px] flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-[11px] text-white outline-none focus:border-gold/35"
            >
              {ctx.adminBadges.length === 0 ? (
                <option value="">{t("noBadges")}</option>
              ) : (
                ctx.adminBadges.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.name}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              disabled={busy !== null || !badgeKey}
              onClick={() => void quick({ action: "badge", badgeKey })}
              className="rounded-xl bg-gold/25 px-4 py-2.5 text-xs font-extrabold text-gold-50 ring-1 ring-gold/40 transition hover:scale-[1.03] hover:bg-gold/35 active:scale-95 disabled:opacity-50"
            >
              {t("grantBadge")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void quick({ action: "suggest", suggestTemplate: "offer_bonus" })}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-semibold text-white/80 transition hover:scale-[1.02] hover:border-amber-400/30 active:scale-95 disabled:opacity-50"
            >
              {t("suggestBonus")}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void quick({ action: "suggest", suggestTemplate: "ask_update" })}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-semibold text-white/80 transition hover:scale-[1.02] hover:border-sky-400/30 active:scale-95 disabled:opacity-50"
            >
              {t("suggestUpdate")}
            </button>
          </div>
        </div>
      </div>

      {busy ? (
        <p className="pb-2 text-center text-[10px] text-white/45">{t("quickBusy")}</p>
      ) : null}
    </div>
  );
}
