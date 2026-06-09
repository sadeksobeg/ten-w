"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconAlert, IconCheck, IconShield, IconSpinner } from "@/components/growth/icons/GrowthIcons";
import {
  CONSENT_CHANGELOG,
  CREATOR_CONSENT_VERSION,
  getConsentText,
  parseConsentSections,
  type ConsentLocale,
} from "@/lib/growth/creator-consent";
import { CreatorConsentVerifiedBadge } from "./CreatorConsentVerifiedBadge";

export type ConsentAcceptance = {
  consentVersion: string;
  qualificationStatement: string;
};

type Props = {
  locale: ConsentLocale;
  creatorName: string;
  onAccept: (details: ConsentAcceptance) => Promise<void>;
  onDecline?: () => void;
  isOpen: boolean;
  mode: "creator-join" | "application" | "view-only";
  versionMismatch?: boolean;
};

export function CreatorConsentModal({
  locale,
  creatorName,
  onAccept,
  onDecline,
  isOpen,
  mode,
  versionMismatch = false,
}: Props) {
  const t = useTranslations("Creators.consent");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [qualification, setQualification] = useState("");
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [busy, setBusy] = useState(false);
  const consentText = useMemo(() => getConsentText(locale), [locale]);
  const sections = useMemo(() => parseConsentSections(consentText), [consentText]);
  const readOnly = mode === "view-only";

  const qualOk =
    qualification.trim().length >= 20 ||
    /أنا مؤهل/i.test(qualification) ||
    /I am qualified/i.test(qualification) ||
    /Je suis qualifié/i.test(qualification);

  const canAccept =
    !readOnly &&
    scrolledToEnd &&
    qualOk &&
    check1 &&
    check2 &&
    check3 &&
    !busy;

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 24;
    setScrolledToEnd(atEnd);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setScrolledToEnd(false);
    setQualification("");
    setCheck1(false);
    setCheck2(false);
    setCheck3(false);
    if (readOnly) {
      setScrolledToEnd(true);
    } else {
      requestAnimationFrame(checkScroll);
    }
  }, [isOpen, mode, checkScroll, readOnly]);

  useEffect(() => {
    if (!isOpen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || readOnly) setScrolledToEnd(true);
  }, [isOpen, readOnly]);

  if (!isOpen) return null;

  async function handleAccept() {
    if (!canAccept) return;
    setBusy(true);
    try {
      await onAccept({
        consentVersion: CREATOR_CONSENT_VERSION,
        qualificationStatement: qualification.trim(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="creator-consent-overlay fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal
      aria-labelledby="creator-consent-title"
    >
      <div className="creator-consent-backdrop absolute inset-0 bg-black/85 backdrop-blur-md" />

      <div className="creator-consent-modal relative flex h-full max-h-[100dvh] w-full max-w-[680px] flex-col overflow-hidden border border-rose-500/30 bg-[var(--creator-surface,#0a0612)] sm:h-auto sm:max-h-[85vh] sm:rounded-[20px]">
        <header className="shrink-0 border-b border-rose-500/20 bg-gradient-to-br from-rose-500/15 to-amber-500/10 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <IconShield size={28} className="shrink-0 text-rose-400" />
            <div className="min-w-0 flex-1">
              <h2
                id="creator-consent-title"
                className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white sm:text-xl"
              >
                {t("modalTitle")}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-[var(--creator-secondary)]/60">
                {t("version", { version: CREATOR_CONSENT_VERSION })}
              </p>
              {creatorName ? (
                <p className="mt-1 text-xs text-white/50">{creatorName}</p>
              ) : null}
            </div>
          </div>
          {versionMismatch ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              {t("versionUpdated")} {CONSENT_CHANGELOG[CREATOR_CONSENT_VERSION] ?? ""}
            </p>
          ) : null}
          <p className="mt-3 flex items-center gap-2 text-[13px] text-rose-200">
            <IconAlert size={14} className="shrink-0" />
            {t("legalWarning")}
          </p>
          {mode === "creator-join" && !readOnly ? (
            <p className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 px-3 py-2.5 text-xs text-amber-100">
              <CreatorConsentVerifiedBadge label={t("verifiedBadge")} size="md" />
              <span>{t("verifiedBadgeUnlock")}</span>
            </p>
          ) : null}
        </header>

        <>
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="creator-consent-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"
            >
              {sections.map((section) => (
                <div key={section.title} className="mb-5">
                  <h3 className="border-b border-[var(--creator-secondary)]/15 pb-2 font-[family-name:var(--font-cairo)] text-[15px] font-bold text-[var(--creator-secondary)]">
                    {section.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {section.items.map((item, i) => (
                      <li
                        key={`${section.title}-${i}`}
                        className="relative pe-6 text-[13px] leading-relaxed text-[rgba(248,244,255,0.85)] sm:text-sm sm:leading-[1.8]"
                      >
                        <span className="absolute end-0 top-1 flex size-5 items-center justify-center rounded-full bg-rose-600/80 text-[9px] font-bold text-white">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {!scrolledToEnd ? (
                <p className="creator-consent-scroll-hint py-4 text-center text-[11px] text-white/40">
                  {t("scrollHint")}
                </p>
              ) : (
                <p className="py-2 text-center text-xs font-semibold text-emerald-300">
                  {t("readComplete")}
                </p>
              )}

              {!readOnly ? (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h4 className="font-[family-name:var(--font-cairo)] text-sm font-bold text-white">
                    {t("qualificationTitle")}
                  </h4>
                  <p className="mt-1 text-xs text-white/50">{t("qualificationPrompt")}</p>
                  <textarea
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value.slice(0, 200))}
                    placeholder={t("qualificationPlaceholder")}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-rose-500/40"
                  />
                  <p className="mt-1 text-[10px] text-white/35">
                    {qualification.length} / 200
                  </p>
                </div>
              ) : null}

              {!readOnly ? (
                <div className="mt-4 space-y-3 pb-2">
                  {[
                    { checked: check1, set: setCheck1, label: t("check1") },
                    { checked: check2, set: setCheck2, label: t("check2") },
                    { checked: check3, set: setCheck3, label: t("check3") },
                  ].map((c) => (
                    <label
                      key={c.label}
                      className="flex cursor-pointer items-start gap-3 text-sm text-white/85"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={c.checked}
                        onClick={() => c.set(!c.checked)}
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition ${
                          c.checked
                            ? "border-rose-500 bg-rose-500 text-white"
                            : "border-white/25 bg-transparent"
                        }`}
                      >
                        {c.checked ? <IconCheck size={12} /> : null}
                      </button>
                      <span className="text-[13px] leading-snug sm:text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <footer className="shrink-0 border-t border-rose-500/15 bg-[var(--creator-surface,#0a0612)] px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {mode === "application" && onDecline ? (
                  <button
                    type="button"
                    onClick={onDecline}
                    className="rounded-xl border border-rose-500/25 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/10"
                  >
                    {t("declineButton")}
                  </button>
                ) : null}
                {readOnly ? (
                  <GoldButton type="button" onClick={onDecline}>
                    {t("close")}
                  </GoldButton>
                ) : (
                  <GoldButton
                    type="button"
                    disabled={!canAccept}
                    onClick={() => void handleAccept()}
                    className={!canAccept ? "opacity-50" : ""}
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <IconSpinner size={14} className="animate-spin" />
                        …
                      </span>
                    ) : (
                      t("acceptButton")
                    )}
                  </GoldButton>
                )}
              </div>
            </footer>
        </>
      </div>
    </div>
  );
}
