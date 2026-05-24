"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { EventContactLeadRow } from "@/lib/growth/event-contact-assistant";
import {
  deleteEventContactLeadAction,
  toggleEventContactLeadAction,
  updateEventContactLeadAction,
} from "@/lib/growth/actions";
import { IconSparkle } from "@/components/growth/icons/GrowthIcons";

type Props = {
  eventId: string;
  leads: EventContactLeadRow[];
  isAdmin: boolean;
};

export function EventContactAssistantBubble({ eventId, leads, isAdmin }: Props) {
  const t = useTranslations("Growth.events.assistant");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, toggleAction] = useActionState(toggleEventContactLeadAction, null);
  const [, updateAction] = useActionState(updateEventContactLeadAction, null);
  const [, deleteAction] = useActionState(deleteEventContactLeadAction, null);

  if (leads.length === 0) return null;

  const pending = leads.filter((l) => l.status === "PENDING").length;
  const contacted = leads.filter((l) => l.status === "CONTACTED").length;

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:bg-black/40"
          aria-label={t("close")}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="fixed bottom-24 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-8">
        {open ? (
          <div
            className="w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-gold/35 bg-[#0a0c12]/95 shadow-[0_0_80px_-12px_rgba(228,184,77,0.55)] backdrop-blur-xl"
            role="dialog"
            aria-modal
            aria-labelledby="contact-assistant-title"
          >
            <div className="relative border-b border-gold/20 bg-gradient-to-r from-gold/15 via-violet-500/10 to-transparent px-4 py-4">
              <div
                className="pointer-events-none absolute -end-6 -top-6 size-24 rounded-full bg-gold/25 blur-2xl"
                aria-hidden
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
                TENEGTA ASCEND
              </p>
              <h3
                id="contact-assistant-title"
                className="mt-1 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white"
              >
                {t("title")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{t("subtitle")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-200">
                  {t("pendingCount", { n: pending })}
                </span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                  {t("contactedCount", { n: contacted })}
                </span>
              </div>
            </div>

            <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto p-3">
              {leads.map((lead) => {
                const isEditing = editingId === lead.id;
                return (
                  <li
                    key={lead.id}
                    className={`rounded-2xl border px-3 py-2.5 transition ${
                      lead.status === "CONTACTED"
                        ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                        : "border-gold/20 bg-gold/[0.05]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {isEditing && isAdmin ? (
                          <form action={updateAction} className="flex gap-1">
                            <input type="hidden" name="leadId" value={lead.id} />
                            <input
                              name="name"
                              defaultValue={lead.name}
                              required
                              className="min-w-0 flex-1 rounded-lg border border-gold/30 bg-black/40 px-2 py-1 text-xs text-white"
                            />
                            <button
                              type="submit"
                              className="shrink-0 text-[10px] font-bold text-gold"
                              onClick={() => setEditingId(null)}
                            >
                              {t("save")}
                            </button>
                          </form>
                        ) : (
                          <>
                            <p className="truncate text-sm font-bold text-white">{lead.name}</p>
                            {lead.handle ? (
                              <p className="truncate text-[10px] text-white/45">@{lead.handle}</p>
                            ) : null}
                          </>
                        )}
                      </div>

                      {isAdmin && !isEditing ? (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(lead.id)}
                            className="text-[10px] font-bold text-gold/80"
                          >
                            {t("edit")}
                          </button>
                          <form action={deleteAction}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <button
                              type="submit"
                              className="text-[10px] font-bold text-rose-400/80"
                            >
                              {t("delete")}
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>

                    <form action={toggleAction} className="mt-2">
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className={`w-full rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${
                          lead.status === "CONTACTED"
                            ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                            : "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
                        }`}
                      >
                        {lead.status === "CONTACTED" ? t("statusContacted") : t("statusPending")}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group relative flex size-14 items-center justify-center rounded-full border border-gold/45 bg-gradient-to-br from-[#B07D2B] via-[#E4B84D] to-[#B07D2B] text-black shadow-[0_0_40px_-6px_rgba(228,184,77,0.75)] transition motion-safe:hover:scale-105 motion-reduce:transform-none"
          aria-expanded={open}
          aria-label={t("open")}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-gold/30 blur-md motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
          <IconSparkle size={26} className="relative text-black/90" />
          {pending > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg">
              {pending > 9 ? "9+" : pending}
            </span>
          ) : null}
        </button>
      </div>
    </>
  );
}
