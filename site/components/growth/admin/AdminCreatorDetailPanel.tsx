"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconClose, IconShield } from "@/components/growth/icons/GrowthIcons";
import { CreatorNameWithConsentBadge } from "@/components/growth/creators/CreatorConsentVerifiedBadge";
import { useToast } from "@/hooks/useToast";
import {
  adminAddCreatorRoomMemberAction,
  adminRemoveCreatorRoomMemberAction,
} from "@/lib/growth/actions";
import {
  adminGrantCreatorBadgeAction,
  adminGrantMilestoneAction,
  adminRevokeCreatorBadgeAction,
  adminSaveCreatorNotesAction,
  adminSetCreatorCupExcludedAction,
  updateCreatorStatusAction,
} from "@/lib/growth/creator-arena-actions";
import type { CreatorAdminPartner } from "./creator-admin-types";

const WORKFLOW_STATUSES: CreatorWorkflowStatus[] = [
  "INVITED",
  "JOINED",
  "FILMING",
  "SUBMITTED",
  "FEATURED",
];

const STATUS_PILL_STYLES: Record<CreatorWorkflowStatus, string> = {
  INVITED: "border-sky-500/40 bg-sky-500/15 text-sky-100",
  JOINED: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  FILMING: "border-amber-500/40 bg-amber-500/15 text-amber-100",
  SUBMITTED: "border-violet-500/40 bg-violet-500/15 text-violet-100",
  FEATURED: "border-gold/40 bg-gold/15 text-gold",
};

const MILESTONE_PRESETS = [
  "first_submission",
  "five_submissions",
  "featured_once",
  "cup_top_10",
  "battle_winner",
];

type Props = {
  partner: CreatorAdminPartner | null;
  onClose: () => void;
  onUpdated: (patch: Partial<CreatorAdminPartner> & { userId: string }) => void;
};

export function AdminCreatorDetailPanel({ partner, onClose, onUpdated }: Props) {
  const t = useTranslations("Growth.creators.admin.detail");
  const tPage = useTranslations("Growth.admin.creatorsPage");
  const locale = useLocale();
  const { showToast } = useToast();
  const [notes, setNotes] = useState("");
  const [milestoneKey, setMilestoneKey] = useState(MILESTONE_PRESETS[0] ?? "");
  const [pending, setPending] = useState(false);
  const [showConsentText, setShowConsentText] = useState(false);
  const tConsent = useTranslations("Creators.consent");

  useEffect(() => {
    if (!partner) return;
    setNotes(partner.notes ?? "");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [partner, onClose]);

  if (!partner) return null;

  async function runAction(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    const res = await fn();
    setPending(false);
    if (res.ok) {
      showToast({ type: "success", title: t("toastSaved") });
    } else {
      showToast({ type: "error", title: tPage("toastError") });
    }
    return res.ok;
  }

  async function saveNotes() {
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    fd.set("notes", notes);
    const ok = await runAction(() => adminSaveCreatorNotesAction(null, fd));
    if (ok) onUpdated({ userId: partner!.userId, notes: notes || null });
  }

  async function updateStatus(status: CreatorWorkflowStatus) {
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    fd.set("status", status);
    const ok = await runAction(() => updateCreatorStatusAction(null, fd));
    if (ok) onUpdated({ userId: partner!.userId, workflowStatus: status });
  }

  async function grantBadge() {
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    const ok = await runAction(() => adminGrantCreatorBadgeAction(null, fd));
    if (ok) {
      onUpdated({
        userId: partner!.userId,
        hasBadge: true,
        hasLoungeAccess: true,
        inRoom: true,
        cupEligible: true,
        cupExcluded: false,
      });
    }
  }

  async function revokeBadge() {
    if (!window.confirm(t("revokeBadgeConfirm"))) return;
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    const ok = await runAction(() => adminRevokeCreatorBadgeAction(null, fd));
    if (ok) {
      onUpdated({
        userId: partner!.userId,
        hasBadge: false,
        inRoom: false,
        hasLoungeAccess: false,
        cupEligible: false,
        cupExcluded: false,
        cupScore: 0,
      });
    }
  }

  async function toggleCupExcluded(exclude: boolean) {
    if (exclude && !window.confirm(t("excludeCupConfirm"))) return;
    setPending(true);
    const res = await adminSetCreatorCupExcludedAction(partner!.userId, exclude);
    setPending(false);
    if (res.ok) {
      onUpdated({
        userId: partner!.userId,
        cupExcluded: exclude,
        cupEligible: partner!.hasBadge && !exclude,
        cupScore: exclude ? 0 : partner!.cupScore,
      });
      showToast({
        type: "success",
        title: exclude ? t("toastCupExcluded") : t("toastCupRestored"),
      });
    } else {
      showToast({ type: "error", title: tPage("toastError") });
    }
  }

  async function toggleRoom(add: boolean) {
    setPending(true);
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    const res = add
      ? await adminAddCreatorRoomMemberAction(fd)
      : await adminRemoveCreatorRoomMemberAction(fd);
    setPending(false);
    if (res.ok) {
      onUpdated({
        userId: partner!.userId,
        inRoom: add,
        hasLoungeAccess: add || partner!.hasBadge,
      });
      showToast({
        type: "success",
        title: add ? tPage("toastLoungeGranted") : tPage("toastRemoved"),
      });
    } else {
      const err = "error" in res ? res.error : "";
      showToast({
        type: "error",
        title: err === "badge_holder_protected" ? tPage("toastBadgeProtected") : tPage("toastError"),
      });
    }
  }

  async function grantMilestone() {
    if (!milestoneKey.trim()) return;
    const fd = new FormData();
    fd.set("userId", partner!.userId);
    fd.set("milestoneKey", milestoneKey.trim());
    const ok = await runAction(() => adminGrantMilestoneAction(null, fd));
    if (ok && !partner!.milestones.includes(milestoneKey.trim())) {
      onUpdated({
        userId: partner!.userId,
        milestones: [...partner!.milestones, milestoneKey.trim()],
      });
    }
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label={t("close")}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-s border-white/10 bg-[#0a0612]/95 p-5 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal
        aria-labelledby="creator-admin-detail-title"
      >
        <div className="flex items-start justify-between gap-3">
          <GrowthAvatar
            name={partner.name}
            email={partner.email}
            avatarUrl={partner.avatarUrl}
            size="lg"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white"
            aria-label={t("close")}
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h2 id="creator-admin-detail-title" className="min-w-0">
            <CreatorNameWithConsentBadge
              name={partner.name ?? partner.email}
              verified={partner.consentGiven}
              label={tConsent("verifiedBadge")}
              nameClassName="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white"
              badgeSize="md"
            />
          </h2>
          <p className="text-xs text-white/45">{partner.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {partner.hasBadge ? (
              <>
                <BadgeIcon badgeKey="content_creator" earned chip size="xs" name="" />
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  {t("hubMember")}
                </span>
              </>
            ) : partner.inRoom ? (
              <span className="rounded-full border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-100">
                {t("loungeOnly")}
              </span>
            ) : null}
            {partner.cupExcluded ? (
              <span className="rounded-full border border-rose-500/35 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-100">
                {t("cupExcludedBadge")}
              </span>
            ) : null}
            {partner.hasBadge && !partner.cupExcluded ? (
              <span className="rounded-full border border-gold/35 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                {t("cupEligible")}
              </span>
            ) : null}
          </div>
          {partner.nominationCount > 0 ? (
            <p className="mt-2 text-xs text-[var(--creator-secondary)]">
              {t("nominationCount", { count: partner.nominationCount })}
            </p>
          ) : null}
        </div>

        <GlassCard className="mt-4 border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gold">{t("statsTitle")}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-white/50">{t("totalSubmissions")}</dt>
              <dd className="font-bold text-white">{partner.totalSubmissions}</dd>
            </div>
            <div>
              <dt className="text-white/50">{t("featuredCount")}</dt>
              <dd className="font-bold text-gold">{partner.featuredCount}</dd>
            </div>
            <div>
              <dt className="text-white/50">{t("cupScore")}</dt>
              <dd className="font-bold text-white">{partner.cupScore}</dd>
            </div>
            <div>
              <dt className="text-white/50">{tPage("statusLabel")}</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {WORKFLOW_STATUSES.map((s) => {
                  const active = (partner.workflowStatus ?? "JOINED") === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={pending || !partner.hasBadge}
                      onClick={() => void updateStatus(s)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                        active
                          ? STATUS_PILL_STYLES[s]
                          : "border-white/10 bg-white/5 text-white/45 hover:border-white/20"
                      }`}
                    >
                      {tPage(`status.${s}`)}
                    </button>
                  );
                })}
              </dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard className="mt-4 border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gold">{tConsent("legalRecordTitle")}</h3>
          {partner.consentGiven ? (
            <div className="mt-3 space-y-2 text-xs">
              <p className="flex items-center gap-2 font-semibold text-emerald-200">
                <IconShield size={16} className="text-emerald-400" />
                {tConsent("consentedLabel")}
              </p>
              <p className="text-white/55">
                {tConsent("version", { version: partner.consentVersion ?? "—" })}
              </p>
              {partner.consentGivenAt ? (
                <p className="text-white/45">
                  {tConsent("consentedOn")}: {dateFmt.format(new Date(partner.consentGivenAt))}
                </p>
              ) : null}
              {partner.consentIpAddress ? (
                <p className="text-white/45">IP: {partner.consentIpAddress}</p>
              ) : null}
              {partner.qualificationDetails ? (
                <div className="rounded-lg border border-white/10 bg-black/25 p-3 text-white/70">
                  <p className="mb-1 text-[10px] uppercase text-white/40">{tConsent("qualificationTitle")}</p>
                  {partner.qualificationDetails}
                </div>
              ) : null}
              {partner.consentText ? (
                <button
                  type="button"
                  onClick={() => setShowConsentText((v) => !v)}
                  className="text-[11px] font-semibold text-gold underline"
                >
                  {tConsent("viewFull")}
                </button>
              ) : null}
              {showConsentText && partner.consentText ? (
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-[10px] text-white/60">
                  {partner.consentText}
                </pre>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-xs text-amber-200">
              <IconShield size={16} className="text-amber-400" />
              {tConsent("notConsented")}
            </p>
          )}
        </GlassCard>

        <section className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/70">
            {t("submissionsTitle")}
          </h3>
          {partner.submissions.length === 0 ? (
            <p className="mt-2 text-xs text-white/45">{t("submissionsEmpty")}</p>
          ) : (
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
              {partner.submissions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px]"
                >
                  <a
                    href={s.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gold hover:underline"
                  >
                    {s.platform ?? s.postUrl.slice(0, 40)}
                  </a>
                  <p className="mt-0.5 text-white/45">
                    {s.weekKey} · {s.status}
                    {s.adminRating != null ? ` · ★${s.adminRating}` : ""}
                  </p>
                  <p className="text-white/35">{dateFmt.format(new Date(s.createdAt))}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/70">{t("notesTitle")}</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-gold/40 focus:outline-none"
            placeholder={t("notesPlaceholder")}
          />
          <GoldButton
            type="button"
            disabled={pending}
            onClick={() => void saveNotes()}
            className="mt-2 !px-3 !py-1.5 text-xs"
          >
            {t("saveNotes")}
          </GoldButton>
        </section>

        {partner.milestones.length > 0 ? (
          <section className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white/70">
              {t("milestonesTitle")}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {partner.milestones.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold"
                >
                  {m}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/70">{t("actionsTitle")}</h3>
          {!partner.hasBadge ? (
            <GoldButton
              type="button"
              disabled={pending}
              onClick={() => void grantBadge()}
              className="w-full !py-2 text-xs"
            >
              {t("grantBadge")}
            </GoldButton>
          ) : (
            <GoldButton
              type="button"
              variant="danger"
              disabled={pending}
              onClick={() => void revokeBadge()}
              className="w-full !py-2 text-xs"
            >
              {t("revokeBadge")}
            </GoldButton>
          )}
          {partner.hasBadge ? (
            partner.cupExcluded ? (
              <GoldButton
                type="button"
                disabled={pending}
                onClick={() => void toggleCupExcluded(false)}
                className="w-full !py-2 text-xs"
              >
                {t("restoreCup")}
              </GoldButton>
            ) : (
              <GoldButton
                type="button"
                variant="danger"
                disabled={pending}
                onClick={() => void toggleCupExcluded(true)}
                className="w-full !py-2 text-xs"
              >
                {t("excludeCup")}
              </GoldButton>
            )
          ) : (
            <p className="text-[10px] leading-relaxed text-white/45">{t("cupBadgeOnlyHint")}</p>
          )}
          {partner.inRoom ? (
            <GoldButton
              type="button"
              variant="danger"
              disabled={pending || partner.hasBadge}
              onClick={() => void toggleRoom(false)}
              className="w-full !py-2 text-xs"
            >
              {tPage("revokeLounge")}
            </GoldButton>
          ) : (
            <GoldButton
              type="button"
              disabled={pending || partner.hasLoungeAccess}
              onClick={() => void toggleRoom(true)}
              className="w-full !py-2 text-xs"
            >
              {tPage("grantLounge")}
            </GoldButton>
          )}
          <div className="flex gap-2">
            <select
              value={milestoneKey}
              onChange={(e) => setMilestoneKey(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-[10px] text-white"
            >
              {MILESTONE_PRESETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <GoldButton
              type="button"
              disabled={pending}
              onClick={() => void grantMilestone()}
              className="shrink-0 !px-3 !py-2 text-xs"
            >
              {t("grantMilestone")}
            </GoldButton>
          </div>
        </section>
      </aside>
    </>
  );
}
