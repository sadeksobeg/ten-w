"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import {
  adminRateSubmissionAction,
  adminSetSubmissionStatusAction,
} from "@/lib/growth/creator-arena-actions";
import type {
  CreatorAdminChallengeSubmission,
  CreatorAdminMissingSubmission,
} from "./creator-admin-types";

type Props = {
  pending: CreatorAdminChallengeSubmission[];
  missingThisWeek: CreatorAdminMissingSubmission[];
  weekKey: string;
  onSubmissionUpdated: (
    submissionId: string,
    patch: Partial<CreatorAdminChallengeSubmission>,
  ) => void;
  onSubmissionRemoved: (submissionId: string) => void;
};

export function AdminSubmissionsQueue({
  pending: initialPending,
  missingThisWeek,
  weekKey,
  onSubmissionUpdated,
  onSubmissionRemoved,
}: Props) {
  const t = useTranslations("Growth.creators.admin.submissions");
  const locale = useLocale();
  const { showToast } = useToast();
  const [pending, setPending] = useState(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );

  async function setStatus(submissionId: string, status: "approved" | "rejected") {
    setBusyId(submissionId);
    const fd = new FormData();
    fd.set("submissionId", submissionId);
    fd.set("status", status);
    const note = rejectNotes[submissionId]?.trim();
    if (status === "rejected" && note) fd.set("adminNote", note);
    const res = await adminSetSubmissionStatusAction(null, fd);
    setBusyId(null);
    if (res.ok) {
      onSubmissionUpdated(submissionId, {
        status,
        isFeatured: status === "approved",
        adminRating: status === "approved" ? 5 : 1,
      });
      setPending((rows) => rows.filter((r) => r.id !== submissionId));
      onSubmissionRemoved(submissionId);
      showToast({
        type: "success",
        title: status === "approved" ? t("toastApproved") : t("toastRejected"),
      });
    } else {
      showToast({ type: "error", title: t("toastError") });
    }
  }

  async function rateSubmission(submissionId: string, rating: number) {
    setBusyId(submissionId);
    const fd = new FormData();
    fd.set("submissionId", submissionId);
    fd.set("rating", String(rating));
    const res = await adminRateSubmissionAction(null, fd);
    setBusyId(null);
    if (res.ok) {
      const status = rating >= 4 ? "approved" : "pending";
      const patch = {
        adminRating: rating,
        status,
        isFeatured: rating === 5,
      };
      onSubmissionUpdated(submissionId, patch);
      if (status === "approved") {
        setPending((rows) => rows.filter((r) => r.id !== submissionId));
        onSubmissionRemoved(submissionId);
      } else {
        setPending((rows) =>
          rows.map((r) => (r.id === submissionId ? { ...r, ...patch } : r)),
        );
      }
      showToast({ type: "success", title: t("toastRated") });
    } else {
      showToast({ type: "error", title: t("toastError") });
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4 sm:p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white sm:text-lg">
          {t("pendingTitle")}
        </h2>
        <p className="mt-1 text-xs text-white/55">{t("pendingSubtitle")}</p>

        {pending.length === 0 ? (
          <p className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {t("pendingEmpty")}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{s.userName}</p>
                    <p className="text-[10px] text-white/45">{s.userEmail}</p>
                    <p className="mt-1 text-[10px] text-gold/80">
                      {s.weekKey}
                      {s.platform ? ` · ${s.platform}` : ""}
                    </p>
                    <a
                      href={s.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-gold hover:underline"
                    >
                      {s.postUrl}
                    </a>
                    <p className="mt-1 text-[10px] text-white/40">
                      {dateFmt.format(new Date(s.createdAt))}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <GoldButton
                      type="button"
                      className="!px-3 !py-1.5 text-[11px]"
                      disabled={busyId === s.id}
                      onClick={() => void setStatus(s.id, "approved")}
                    >
                      {t("approve")}
                    </GoldButton>
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => void setStatus(s.id, "rejected")}
                      className="rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/20"
                    >
                      {t("reject")}
                    </button>
                  </div>
                </div>

                <label className="mt-3 block text-[10px] text-white/45">
                  {t("rejectNoteLabel")}
                  <textarea
                    value={rejectNotes[s.id] ?? ""}
                    onChange={(e) =>
                      setRejectNotes((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    rows={2}
                    placeholder={t("rejectNotePlaceholder")}
                    className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/80"
                  />
                </label>

                <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-white/8 pt-3">
                  <span className="me-1 text-[10px] text-white/45">{t("rateLabel")}</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => void rateSubmission(s.id, n)}
                      className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                        s.adminRating === n
                          ? "bg-gold/30 text-gold"
                          : "bg-white/5 text-white/50 hover:bg-gold/15 hover:text-gold"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard className="border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("missingTitle", { week: weekKey })}
        </h3>
        <p className="mt-1 text-xs text-white/55">{t("missingSubtitle")}</p>

        {missingThisWeek.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-200/80">{t("missingEmpty")}</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {missingThisWeek.map((c) => (
              <li
                key={c.userId}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                  <p className="truncate text-[10px] text-white/45">{c.email}</p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-200">
                  {t("notPosted")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
