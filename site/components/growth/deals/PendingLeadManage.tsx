"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  deletePendingLeadAction,
  markPendingLeadLostAction,
  updatePendingLeadAction,
} from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { IconChevronDown } from "@/components/growth/icons/GrowthIcons";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  commissionBaseCents: number;
};

type Props = {
  dealId: string;
  productId: string;
  clientLabel: string | null;
  notes: string | null;
  products: Product[];
};

export function PendingLeadManage({
  dealId,
  productId,
  clientLabel,
  notes,
  products,
}: Props) {
  const t = useTranslations("Growth.deals");
  const locale = useLocale();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [updateState, updateAction, updatePending] = useActionState(updatePendingLeadAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePendingLeadAction, null);
  const [lostState, lostAction, lostPending] = useActionState(markPendingLeadLostAction, null);

  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  useEffect(() => {
    if (updateState?.ok) {
      showToast({ type: "success", title: t("toastLeadUpdated") });
      setEditing(false);
    } else if (updateState?.ok === false) {
      showToast({ type: "error", title: t("errors.invalid_input") });
    }
  }, [updateState, showToast, t]);

  useEffect(() => {
    if (deleteState?.ok) {
      showToast({ type: "success", title: t("toastLeadDeleted") });
      setConfirmDelete(false);
    } else if (deleteState?.ok === false) {
      showToast({ type: "error", title: t("errors.invalid_input") });
    }
  }, [deleteState, showToast, t]);

  useEffect(() => {
    if (lostState?.ok) {
      showToast({ type: "success", title: t("toastLeadLost") });
    } else if (lostState?.ok === false) {
      showToast({ type: "error", title: t("errors.invalid_input") });
    }
  }, [lostState, showToast, t]);

  if (editing) {
    return (
      <form action={updateAction} className="mt-3 space-y-3 rounded-xl border border-gold/25 bg-gold/5 p-3">
        <input type="hidden" name="dealId" value={dealId} />
        <label className="block">
          <span className="text-[10px] font-semibold uppercase text-white/50">{t("editProduct")}</span>
          <div className="relative mt-1">
            <select
              name="productId"
              defaultValue={productId}
              required
              disabled={updatePending}
              className="w-full appearance-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 pe-8 text-sm text-white outline-none focus:border-gold/40"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {fmt(p.priceCents)}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-gold/70"
              aria-hidden
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase text-white/50">{t("client")}</span>
          <input
            name="clientLabel"
            defaultValue={clientLabel ?? ""}
            disabled={updatePending}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase text-white/50">{t("notes")}</span>
          <input
            name="notes"
            defaultValue={notes ?? ""}
            disabled={updatePending}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-lg bg-gold/90 px-3 py-1.5 text-xs font-bold text-bg disabled:opacity-50"
          >
            {t("saveLead")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70"
          >
            {t("cancelEdit")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20"
      >
        {t("editLead")}
      </button>
      <form action={lostAction}>
        <input type="hidden" name="dealId" value={dealId} />
        <button
          type="submit"
          disabled={lostPending}
          className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 disabled:opacity-50"
        >
          {t("markLost")}
        </button>
      </form>
      {confirmDelete ? (
        <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">
          <span className="text-xs text-rose-100">{t("deleteConfirm")}</span>
          <form action={deleteAction} className="inline">
            <input type="hidden" name="dealId" value={dealId} />
            <button
              type="submit"
              disabled={deletePending}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
            >
              {t("deleteLeadConfirm")}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-white/60 underline"
          >
            {t("cancelEdit")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/55 hover:border-rose-400/40 hover:text-rose-200"
        >
          {t("deleteLead")}
        </button>
      )}
    </div>
  );
}
