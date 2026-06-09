"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import {
  adminDeletePlatformReviewAction,
  adminTogglePlatformReviewAction,
  adminUpsertPlatformReviewAction,
} from "@/lib/growth/creator-arena-actions";
import type { CreatorPlatformReviewRow } from "@/lib/growth/creator-platform-reviews";

type Props = {
  reviews: CreatorPlatformReviewRow[];
};

const EMPTY_FORM = {
  nameAr: "",
  nameEn: "",
  nameFr: "",
  roleAr: "",
  roleEn: "",
  roleFr: "",
  quoteAr: "",
  quoteEn: "",
  quoteFr: "",
  rating: "5",
  sortOrder: "0",
};

export function AdminCreatorReviewsManager({ reviews: initial }: Props) {
  const t = useTranslations("Growth.creators.admin.reviews");
  const { showToast } = useToast();
  const [reviews, setReviews] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  function loadEdit(row: CreatorPlatformReviewRow) {
    setEditingId(row.id);
    setForm({
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      nameFr: row.nameFr,
      roleAr: row.roleAr ?? "",
      roleEn: row.roleEn ?? "",
      roleFr: row.roleFr ?? "",
      quoteAr: row.quoteAr,
      quoteEn: row.quoteEn,
      quoteFr: row.quoteFr,
      rating: String(row.rating),
      sortOrder: String(row.sortOrder),
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    if (editingId) fd.set("id", editingId);
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    fd.set("active", "1");
    startTransition(async () => {
      const res = await adminUpsertPlatformReviewAction(null, fd);
      if (res.ok) {
        showToast({ type: "success", title: t("toastSaved") });
        window.location.reload();
      } else {
        showToast({ type: "error", title: t("toastError") });
      }
    });
  }

  function toggleActive(id: string, active: boolean) {
    startTransition(async () => {
      const res = await adminTogglePlatformReviewAction(id, active);
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
      }
    });
  }

  function remove(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      const res = await adminDeletePlatformReviewAction(id);
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast({ type: "success", title: t("toastDeleted") });
      }
    });
  }

  const field = (key: keyof typeof form, label: string, multiline = false) => (
    <label className="block text-xs text-white/60">
      {label}
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
        />
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
        />
      )}
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-xs text-white/50">{t("subtitle")}</p>
        </div>
        <GoldButton
          type="button"
          disabled={pending}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="!px-4 !py-2 text-xs"
        >
          {t("add")}
        </GoldButton>
      </div>

      {showForm ? (
        <GlassCard className="border border-white/10 p-4">
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            {field("nameAr", t("nameAr"))}
            {field("nameEn", t("nameEn"))}
            {field("nameFr", t("nameFr"))}
            {field("roleAr", t("roleAr"))}
            {field("roleEn", t("roleEn"))}
            {field("roleFr", t("roleFr"))}
            <div className="sm:col-span-2">{field("quoteAr", t("quoteAr"), true)}</div>
            <div className="sm:col-span-2">{field("quoteEn", t("quoteEn"), true)}</div>
            <div className="sm:col-span-2">{field("quoteFr", t("quoteFr"), true)}</div>
            <label className="text-xs text-white/60">
              {t("rating")}
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
              />
            </label>
            <label className="text-xs text-white/60">
              {t("sortOrder")}
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <GoldButton type="submit" disabled={pending} className="!px-4 !py-2 text-xs">
                {editingId ? t("save") : t("create")}
              </GoldButton>
              <GoldButton type="button" variant="ghost" disabled={pending} onClick={resetForm} className="!px-4 !py-2 text-xs">
                {t("cancel")}
              </GoldButton>
            </div>
          </form>
        </GlassCard>
      ) : null}

      <GlassCard className="overflow-hidden border border-white/10 p-0">
        {reviews.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/45">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-white/8">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-3 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{r.nameAr}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/55">{r.quoteAr}</p>
                  <p className="mt-1 text-[10px] text-amber-300">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <GoldButton type="button" variant="ghost" disabled={pending} onClick={() => loadEdit(r)} className="!px-3 !py-1.5 text-[10px]">
                    {t("edit")}
                  </GoldButton>
                  <GoldButton
                    type="button"
                    variant={r.active ? "ghost" : "primary"}
                    disabled={pending}
                    onClick={() => toggleActive(r.id, !r.active)}
                    className="!px-3 !py-1.5 text-[10px]"
                  >
                    {r.active ? t("hide") : t("show")}
                  </GoldButton>
                  <GoldButton type="button" variant="danger" disabled={pending} onClick={() => remove(r.id)} className="!px-3 !py-1.5 text-[10px]">
                    {t("delete")}
                  </GoldButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
