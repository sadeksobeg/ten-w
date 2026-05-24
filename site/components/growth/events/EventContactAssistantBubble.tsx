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
          className="fixed inset-0 z-[45] bg-black/45 backdrop-blur-sm"
          aria-label={t("close")}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="event-assistant-float fixed end-3 top-1/2 z-[50] flex flex-col items-end gap-3 md:end-5">
        {open ? (
          <div
            className="w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-gold/40 bg-[#070910]/97 shadow-[0_0_100px_-16px_rgba(228,184,77,0.65)] backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-assistant-title"
          >
            <div className="relative border-b border-gold/25 bg-gradient-to-br from-gold/20 via-violet-600/10 to-transparent px-4 py-4">
              <div
                className="pointer-events-none absolute -end-8 -top-8 size-28 rounded-full bg-gold/30 blur-2xl"
                aria-hidden
              />
              <div className="flex items-start gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15">
                  <IconRobotAssistant size={28} className="text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
                    TENEGTA ASCEND
                  </p>
                  <h3
                    id="contact-assistant-title"
                    className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white"
                  >
                    {t("title")}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{t("subtitle")}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-200">
                  {t("pendingCount", { n: pending })}
                </span>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                  {t("contactedCount", { n: contacted })}
                </span>
              </div>
            </div>

            <ul className="max-h-[min(50vh,380px)] space-y-2 overflow-y-auto p-3">
              {leads.length === 0 ? (
                <li className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                  {t("empty")}
                </li>
              ) : (
                leads.map((lead) => (
                  <li
                    key={lead.id}
                    className={`rounded-2xl border px-3 py-2.5 ${
                      lead.status === "CONTACTED"
                        ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                        : "border-gold/25 bg-gold/[0.06]"
                    }`}
                  >
                    <p className="truncate text-sm font-bold text-white">{lead.name}</p>
                    {lead.handle ? (
                      <p className="truncate text-[10px] text-gold/60">@{lead.handle}</p>
                    ) : null}
                    <form action={toggleAction} className="mt-2">
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className={`w-full rounded-full border px-3 py-1.5 text-[10px] font-bold ${
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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="event-assistant-robot group relative flex size-[4.25rem] shrink-0 items-center justify-center rounded-2xl border-2 border-gold/50 bg-gradient-to-br from-[#1a1408] via-[#2a2210] to-[#0a0c14] shadow-[0_0_48px_-8px_rgba(228,184,77,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] transition motion-safe:hover:scale-105 motion-reduce:transform-none"
          aria-expanded={open}
          aria-label={t("open")}
        >
          <span
            className="pointer-events-none absolute -inset-1 rounded-2xl bg-gold/20 blur-md motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
          <IconRobotAssistant size={36} className="relative text-gold drop-shadow-[0_0_8px_rgba(228,184,77,0.6)]" />
          {pending > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border-2 border-[#0a0c14] bg-amber-500 text-[10px] font-black text-black">
              {pending > 9 ? "9+" : pending}
            </span>
          ) : null}
          <span
            className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gold/40 blur-sm"
            aria-hidden
          />
        </button>
      </div>
    </>
  );
}
