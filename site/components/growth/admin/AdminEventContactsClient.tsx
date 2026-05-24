"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { EventContactLeadRow } from "@/lib/growth/event-contact-assistant";
import {
  addEventContactLeadAction,
  deleteEventContactLeadAction,
  resyncEventContactLeadsAction,
  updateEventContactLeadAction,
} from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconTrash } from "@/components/growth/icons/GrowthIcons";

type EventOption = { id: string; title: string; slug: string };

type Props = {
  events: EventOption[];
  eventId: string;
  leads: EventContactLeadRow[];
};

export function AdminEventContactsClient({ events, eventId, leads }: Props) {
  const t = useTranslations("Growth.admin.eventContacts");
  const router = useRouter();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [addState, addAction, addPending] = useActionState(addEventContactLeadAction, null);
  const [updateState, updateAction, updatePending] = useActionState(updateEventContactLeadAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEventContactLeadAction, null);
  const [syncState, syncAction, syncPending] = useActionState(resyncEventContactLeadsAction, null);

  useEffect(() => {
    if (addState?.ok) {
      showToast({ type: "success", title: t("toastAdded") });
      const form = document.getElementById("add-contact-lead") as HTMLFormElement | null;
      form?.reset();
    } else if (addState && !addState.ok) showToast({ type: "error", title: t("toastError") });
  }, [addState, showToast, t]);

  useEffect(() => {
    if (updateState?.ok) {
      showToast({ type: "success", title: t("toastSaved") });
      setEditingId(null);
    } else if (updateState && !updateState.ok) showToast({ type: "error", title: t("toastError") });
  }, [updateState, showToast, t]);

  useEffect(() => {
    if (deleteState?.ok) showToast({ type: "success", title: t("toastDeleted") });
    else if (deleteState && !deleteState.ok) showToast({ type: "error", title: t("toastError") });
  }, [deleteState, showToast, t]);

  useEffect(() => {
    if (syncState?.ok) showToast({ type: "success", title: t("toastSynced") });
    else if (syncState && !syncState.ok) showToast({ type: "error", title: t("toastError") });
  }, [syncState, showToast, t]);

  return (
    <div className="space-y-6">
      <GlassCard className="flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <label className="min-w-[200px] flex-1">
          <span className="text-xs text-white/55">{t("selectEvent")}</span>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
            value={eventId}
            onChange={(e) => router.push(`/growth/admin/event-contacts?eventId=${e.target.value}`)}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.slug})
              </option>
            ))}
          </select>
        </label>
        <form action={syncAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <GoldButton type="submit" disabled={syncPending} variant="ghost">
            {syncPending ? "…" : t("resync")}
          </GoldButton>
        </form>
      </GlassCard>

      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-sm font-bold text-gold">{t("addTitle")}</h2>
        <form id="add-contact-lead" action={addAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="eventId" value={eventId} />
          <label className="block sm:col-span-2">
            <span className="text-xs text-white/55">{t("name")}</span>
            <input
              name="name"
              required
              maxLength={120}
              disabled={addPending}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("handle")}</span>
            <input
              name="handle"
              maxLength={80}
              placeholder="@username"
              disabled={addPending}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("status")}</span>
            <select
              name="status"
              defaultValue="PENDING"
              disabled={addPending}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
            >
              <option value="PENDING">{t("statusPending")}</option>
              <option value="CONTACTED">{t("statusContacted")}</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <GoldButton type="submit" disabled={addPending}>
              {addPending ? "…" : t("addSubmit")}
            </GoldButton>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 px-4 py-3 sm:px-6">
          <h2 className="text-sm font-bold">{t("listTitle")}</h2>
          <p className="mt-1 text-xs text-white/45">{t("count", { count: leads.length })}</p>
        </div>
        {leads.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-white/45">{t("empty")}</p>
        ) : (
          <div className="growth-table-scroll">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-start text-xs text-white/45">
                  <th className="px-4 py-3 font-semibold sm:px-6">{t("name")}</th>
                  <th className="px-4 py-3 font-semibold">{t("handle")}</th>
                  <th className="px-4 py-3 font-semibold">{t("status")}</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) =>
                  editingId === lead.id ? (
                    <tr key={lead.id} className="border-b border-white/5 bg-gold/[0.04]">
                      <td colSpan={4} className="px-4 py-4 sm:px-6">
                        <form action={updateAction} className="grid gap-3 sm:grid-cols-4">
                          <input type="hidden" name="leadId" value={lead.id} />
                          <input
                            name="name"
                            defaultValue={lead.name}
                            required
                            maxLength={120}
                            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                          />
                          <input
                            name="handle"
                            defaultValue={lead.handle ?? ""}
                            maxLength={80}
                            placeholder="@username"
                            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                          />
                          <select
                            name="status"
                            defaultValue={lead.status}
                            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                          >
                            <option value="PENDING">{t("statusPending")}</option>
                            <option value="CONTACTED">{t("statusContacted")}</option>
                          </select>
                          <div className="flex gap-2">
                            <GoldButton type="submit" disabled={updatePending} className="flex-1">
                              {t("save")}
                            </GoldButton>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-semibold sm:px-6">{lead.name}</td>
                      <td className="px-4 py-3 text-white/55">
                        {lead.handle ? `@${lead.handle}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            lead.status === "CONTACTED"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-200"
                          }`}
                        >
                          {lead.status === "CONTACTED" ? t("statusContacted") : t("statusPending")}
                        </span>
                        {lead.isManual ? (
                          <span className="ms-2 text-[10px] text-white/30">{t("manual")}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(lead.id)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-gold/30 hover:text-gold"
                          >
                            {t("edit")}
                          </button>
                          <form action={deleteAction}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <button
                              type="submit"
                              disabled={deletePending}
                              className="flex items-center gap-1 rounded-lg border border-red-500/25 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                              aria-label={t("delete")}
                            >
                              <IconTrash size={14} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
