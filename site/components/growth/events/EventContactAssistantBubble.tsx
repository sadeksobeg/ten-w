"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { EventContactLeadRow } from "@/lib/growth/event-contact-assistant";
import { toggleEventContactLeadAction } from "@/lib/growth/actions";
import { IconRobotAssistant } from "@/components/growth/icons/GrowthIcons";

type Props = {
  leads: EventContactLeadRow[];
};

export function EventContactAssistantBubble({ leads }: Props) {
  const t = useTranslations("Growth.events.assistant");
  const [open, setOpen] = useState(false);
  const [, toggleAction] = useActionState(toggleEventContactLeadAction, null);

  const pending = leads.filter((l) => l.status === "PENDING").length;
  const contacted = leads.filter((l) => l.status === "CONTACTED").length;

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm"
          aria-label={t("close")}
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          className="event-assistant-panel fixed z-[50] flex max-h-[min(72dvh,560px)] w-[calc(100vw-1.5rem)] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-gold/40 bg-[#070910]/98 shadow-[0_0_100px_-16px_rgba(228,184,77,0.65)] backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none md:max-h-[min(70vh,520px)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-assistant-title"
        >
          <div className="relative shrink-0 border-b border-gold/25 bg-gradient-to-br from-gold/20 via-violet-600/10 to-transparent px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 sm:size-12 sm:rounded-2xl">
                <IconRobotAssistant size={24} className="text-gold sm:hidden" />
                <IconRobotAssistant size={28} className="hidden text-gold sm:block" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold/80 sm:text-[10px] sm:tracking-[0.2em]">
                  TENEGTA ASCEND
                </p>
                <h3
                  id="contact-assistant-title"
                  className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white sm:text-lg"
                >
                  {t("title")}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-white/55 sm:mt-1 sm:text-xs sm:leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-200 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {t("pendingCount", { n: pending })}
              </span>
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-200 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {t("contactedCount", { n: contacted })}
              </span>
            </div>
          </div>

          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5 sm:p-3">
            {leads.length === 0 ? (
              <li className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-xs text-white/45 sm:px-4 sm:py-8">
                {t("empty")}
              </li>
            ) : (
              leads.map((lead) => (
                <li
                  key={lead.id}
                  className={`rounded-xl border px-2.5 py-2 sm:rounded-2xl sm:px-3 sm:py-2.5 ${
                    lead.status === "CONTACTED"
                      ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                      : "border-gold/25 bg-gold/[0.06]"
                  }`}
                >
                  <p className="break-words text-sm font-bold leading-snug text-white">{lead.name}</p>
                  {lead.handle ? (
                    <p className="mt-0.5 break-all text-[10px] text-gold/60">@{lead.handle}</p>
                  ) : null}
                  <form action={toggleAction} className="mt-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <button
                      type="submit"
                      className={`w-full rounded-full border px-2 py-1.5 text-[9px] font-bold leading-tight sm:px-3 sm:text-[10px] ${
                        lead.status === "CONTACTED"
                          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                          : "border-gold/35 bg-gold/10 text-gold"
                      }`}
                    >
                      {lead.status === "CONTACTED" ? t("statusContacted") : t("statusPending")}
                    </button>
                  </form>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="event-assistant-fab event-assistant-robot fixed z-[50] flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-[#1a1408] via-[#2a2210] to-[#0a0c14] shadow-[0_0_48px_-8px_rgba(228,184,77,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] transition motion-safe:active:scale-95 motion-safe:hover:scale-105 motion-reduce:transform-none sm:size-[4.25rem]"
          aria-expanded={open}
          aria-label={t("open")}
        >
          <span
            className="pointer-events-none absolute -inset-1 rounded-2xl bg-gold/20 blur-md motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
          <IconRobotAssistant size={32} className="relative text-gold drop-shadow-[0_0_8px_rgba(228,184,77,0.6)] sm:hidden" />
          <IconRobotAssistant size={36} className="relative hidden text-gold drop-shadow-[0_0_8px_rgba(228,184,77,0.6)] sm:block" />
          {pending > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 border-[#0a0c14] bg-amber-500 text-[9px] font-black text-black sm:size-6 sm:text-[10px]">
              {pending > 9 ? "9+" : pending}
            </span>
          ) : null}
        </button>
      ) : null}
    </>
  );
}
