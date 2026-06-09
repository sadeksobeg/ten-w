"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { adminReviewApplicationAction } from "@/lib/growth/creator-arena-actions";

export type CreatorApplicationRow = {
  id: string;
  name: string;
  email: string;
  mainPlatformUrl: string;
  platform: string | null;
  contentTypes?: string[];
  followersRange: string;
  applicantNote?: string | null;
  applicationConsentGiven?: boolean;
  applicationConsentAt?: string | null;
  applicationConsentVersion?: string | null;
  applicationConsentIp?: string | null;
  status: string;
  createdAt: string;
};

type Props = { applications: CreatorApplicationRow[] };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "< 1h";
  if (hrs < 48) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function AdminCreatorApplications({ applications: initial }: Props) {
  const t = useTranslations("Growth.creators.admin.applications");
  const tConsent = useTranslations("Creators.consent");
  const [apps, setApps] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial[0]?.id ?? "");
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [, action, pending] = useActionState(adminReviewApplicationAction, undefined);

  const pendingApps = useMemo(() => apps.filter((a) => a.status === "PENDING"), [apps]);
  const selected = apps.find((a) => a.id === selectedId) ?? pendingApps[0];

  if (apps.length === 0) {
    return <GlassCard className="p-8 text-center text-sm text-white/50">{t("empty")}</GlassCard>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <ul className="max-h-[70vh] space-y-2 overflow-y-auto pe-1">
        {pendingApps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(app.id);
                setShowReject(false);
                setSuccessMsg(null);
              }}
              className={`w-full rounded-xl border-s-4 p-3 text-start transition ${
                selected?.id === app.id
                  ? "border-s-gold bg-white/[0.06]"
                  : "border-s-rose-500/60 bg-black/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-900/50 text-sm font-bold">
                  {app.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{app.name}</p>
                  <p className="text-[10px] text-white/45">
                    {app.platform ?? "—"} · {relativeTime(app.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <GlassCard className="p-5">
          <p className="text-lg font-bold text-white">{selected.name}</p>
          <p className="text-sm text-white/55">{selected.email}</p>
          <a
            href={selected.mainPlatformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs text-gold underline"
          >
            {selected.mainPlatformUrl}
          </a>
          <p className="mt-3 text-xs text-white/50">
            {selected.followersRange} · {selected.platform}
          </p>
          {selected.contentTypes?.length ? (
            <p className="mt-2 text-xs text-white/45">{selected.contentTypes.join(", ")}</p>
          ) : null}
          {selected.applicantNote ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3 text-xs text-white/65">
              {selected.applicantNote}
            </p>
          ) : null}

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-xs">
            {selected.applicationConsentGiven ? (
              <p className="font-semibold text-emerald-200">
                ✓ {tConsent("applicationConsented")}
                {selected.applicationConsentAt
                  ? ` · ${new Date(selected.applicationConsentAt).toLocaleString()}`
                  : ""}
              </p>
            ) : (
              <p className="text-amber-200">⚠ {tConsent("notConsented")}</p>
            )}
            {selected.applicationConsentVersion ? (
              <p className="mt-1 text-white/45">
                {tConsent("version", { version: selected.applicationConsentVersion })}
                {selected.applicationConsentIp ? ` · IP ${selected.applicationConsentIp}` : ""}
              </p>
            ) : null}
          </div>

          {successMsg ? (
            <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {successMsg}
            </p>
          ) : null}

          {selected.status === "PENDING" ? (
            <div className="mt-6 space-y-3">
              {!showReject ? (
                <div className="flex flex-wrap gap-2">
                  <form
                    action={action}
                    onSubmit={() => {
                      setSuccessMsg(t("acceptSuccess", { email: selected.email }));
                      setApps((prev) => prev.filter((a) => a.id !== selected.id));
                    }}
                  >
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <GoldButton type="submit" disabled={pending}>
                      {t("acceptInvite")}
                    </GoldButton>
                  </form>
                  <button
                    type="button"
                    className="rounded-xl border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-200"
                    onClick={() => setShowReject(true)}
                  >
                    {t("reject")}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder={t("rejectNotePlaceholder")}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                  />
                  <form
                    action={action}
                    onSubmit={() => {
                      setApps((prev) => prev.filter((a) => a.id !== selected.id));
                      setShowReject(false);
                    }}
                  >
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <input type="hidden" name="adminNotes" value={rejectNote} />
                    <button type="submit" disabled={pending} className="rounded-xl bg-rose-900/50 px-4 py-2 text-xs font-bold text-rose-100">
                      {t("confirmReject")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-xs text-white/40">{selected.status}</p>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="flex items-center justify-center p-8 text-sm text-white/45">{t("queueClear")}</GlassCard>
      )}
    </div>
  );
}
