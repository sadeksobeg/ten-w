"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import {
  adminCreateChallengeAction,
  adminRateSubmissionAction,
} from "@/lib/growth/creator-arena-actions";
import { currentWeekKey } from "@/lib/growth/creator-arena";
import type {
  CreatorAdminChallenge,
  CreatorAdminChallengeSubmission,
} from "./creator-admin-types";

type Props = {
  challenges: CreatorAdminChallenge[];
  submissionsByWeek: Record<string, CreatorAdminChallengeSubmission[]>;
  onChallengeCreated: (challenge: CreatorAdminChallenge) => void;
  onSubmissionRated: (
    weekKey: string,
    submissionId: string,
    rating: number,
    status: string,
    isFeatured: boolean,
  ) => void;
};

function challengeTitle(c: CreatorAdminChallenge, locale: string) {
  if (locale === "ar") return c.titleAr;
  if (locale === "fr" && c.titleFr) return c.titleFr;
  return c.titleEn;
}

export function AdminChallengeManager({
  challenges,
  submissionsByWeek,
  onChallengeCreated,
  onSubmissionRated,
}: Props) {
  const t = useTranslations("Growth.creators.admin.challenges");
  const locale = useLocale();
  const { showToast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(challenges[0]?.weekKey ?? "");
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedChallenge = challenges.find((c) => c.weekKey === selectedWeek);
  const submissions = useMemo(
    () => submissionsByWeek[selectedWeek] ?? [],
    [submissionsByWeek, selectedWeek],
  );

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await adminCreateChallengeAction(null, formData);
      if (res.ok) {
        const weekKey = String(formData.get("weekKey") ?? currentWeekKey());
        const now = new Date().toISOString();
        const ends = new Date();
        ends.setUTCDate(ends.getUTCDate() + 7);
        onChallengeCreated({
          id: weekKey,
          weekKey,
          titleAr: String(formData.get("titleAr") ?? ""),
          titleEn: String(formData.get("titleEn") ?? ""),
          titleFr: String(formData.get("titleFr") ?? ""),
          bodyAr: String(formData.get("bodyAr") ?? ""),
          bodyEn: String(formData.get("bodyEn") ?? ""),
          bodyFr: String(formData.get("bodyFr") ?? ""),
          xpReward: Number(formData.get("xpReward") ?? 500),
          active: true,
          totalSubmissions: 0,
          startsAt: now,
          endsAt: ends.toISOString(),
        });
        setSelectedWeek(weekKey);
        setShowForm(false);
        showToast({ type: "success", title: t("toastCreated") });
      } else {
        showToast({ type: "error", title: t("toastError") });
      }
    });
  }

  async function rateSubmission(submissionId: string, rating: number) {
    const fd = new FormData();
    fd.set("submissionId", submissionId);
    fd.set("rating", String(rating));
    const res = await adminRateSubmissionAction(null, fd);
    if (res.ok) {
      const status = rating >= 4 ? "approved" : "pending";
      onSubmissionRated(selectedWeek, submissionId, rating, status, rating === 5);
      showToast({ type: "success", title: t("toastRated") });
    } else {
      showToast({ type: "error", title: t("toastError") });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
          <p className="mt-1 text-xs text-white/50">{t("subtitle")}</p>
        </div>
        <GoldButton
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="!px-4 !py-2 text-xs"
        >
          {showForm ? t("cancelCreate") : t("createChallenge")}
        </GoldButton>
      </div>

      {showForm ? (
        <GlassCard className="border border-gold/20 bg-gold/5 p-4">
          <form
            action={(fd) => handleCreate(fd)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <h3 className="sm:col-span-2 text-xs font-bold text-white">{t("formTitle")}</h3>
            <label className="text-[10px] text-white/50">
              {t("weekKey")}
              <input
                name="weekKey"
                defaultValue={currentWeekKey()}
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50">
              {t("xpReward")}
              <input
                name="xpReward"
                type="number"
                defaultValue={500}
                min={50}
                max={5000}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50">
              {t("titleAr")}
              <input
                name="titleAr"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50">
              {t("titleEn")}
              <input
                name="titleEn"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50 sm:col-span-2">
              {t("titleFr")}
              <input
                name="titleFr"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50">
              {t("bodyAr")}
              <textarea
                name="bodyAr"
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50">
              {t("bodyEn")}
              <textarea
                name="bodyEn"
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[10px] text-white/50 sm:col-span-2">
              {t("bodyFr")}
              <textarea
                name="bodyFr"
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="sm:col-span-2">
              <GoldButton type="submit" disabled={pending} className="!px-4 !py-2 text-xs">
                {pending ? "…" : t("submitCreate")}
              </GoldButton>
            </div>
          </form>
        </GlassCard>
      ) : null}

      {challenges.length === 0 ? (
        <p className="text-sm text-white/45">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <ul className="lg:w-72 shrink-0 space-y-2">
            {challenges.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedWeek(c.weekKey)}
                  className={`w-full rounded-xl border px-4 py-3 text-start text-sm transition ${
                    selectedWeek === c.weekKey
                      ? "border-gold/40 bg-gold/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold">{c.weekKey}</p>
                  <p className="mt-0.5 truncate text-xs text-white/45">
                    {challengeTitle(c, locale)}
                  </p>
                  <p className="mt-1 text-[10px] text-gold">
                    {t("metaXp", { xp: c.xpReward })} · {c.totalSubmissions} {t("metaPosts")}
                    {c.active ? ` · ${t("active")}` : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <GlassCard className="min-w-0 flex-1 border border-white/10 p-4">
            {selectedChallenge ? (
              <>
                <h3 className="font-semibold text-white">
                  {challengeTitle(selectedChallenge, locale)}
                </h3>
                <p className="mt-1 text-[10px] text-white/45">
                  {dateFmt.format(new Date(selectedChallenge.startsAt))} —{" "}
                  {dateFmt.format(new Date(selectedChallenge.endsAt))}
                </p>
                <h4 className="mt-4 text-xs font-bold text-gold">{t("submissionsTitle")}</h4>
                {submissions.length === 0 ? (
                  <p className="mt-2 text-xs text-white/45">{t("submissionsEmpty")}</p>
                ) : (
                  <ul className="mt-3 max-h-[420px] space-y-3 overflow-y-auto">
                    {submissions.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{s.userName}</p>
                            <p className="text-[10px] text-white/45">{s.userEmail}</p>
                            <a
                              href={s.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block truncate text-xs text-gold hover:underline"
                            >
                              {s.postUrl}
                            </a>
                            <p className="mt-1 text-[10px] text-white/40">
                              {s.status}
                              {s.adminRating != null ? ` · ★${s.adminRating}` : ""}
                              {s.isFeatured ? ` · ${t("featured")}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => void rateSubmission(s.id, n)}
                                className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                                  s.adminRating === n
                                    ? "bg-gold/30 text-gold"
                                    : "bg-white/5 text-white/50 hover:bg-gold/15 hover:text-gold"
                                }`}
                                aria-label={t("rate", { n })}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-white/45">{t("pickChallenge")}</p>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
