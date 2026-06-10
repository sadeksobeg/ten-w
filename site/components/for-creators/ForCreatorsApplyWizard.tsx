"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ConfettiCanvas } from "@/components/invite/canvas/ConfettiCanvas";
import { CreatorConsentModal } from "@/components/growth/creators/CreatorConsentModal";
import type { ConsentLocale } from "@/lib/growth/creator-consent";
import {
  IconYoutube,
  IconInstagram,
  IconTiktok,
  IconXPlatform,
  IconFacebook,
} from "@/components/growth/icons/GrowthIcons";
import { normalizePlatformUrl } from "@/lib/growth/normalize-platform-url";

const PLATFORMS = [
  { id: "youtube", Icon: IconYoutube },
  { id: "instagram", Icon: IconInstagram },
  { id: "tiktok", Icon: IconTiktok },
  { id: "x", Icon: IconXPlatform },
  { id: "other", Icon: IconFacebook },
] as const;

const FOLLOWER_KEYS = ["under1k", "1k-10k", "10k-100k", "100k+"] as const;
const NICHE_KEYS = ["tech", "business", "education", "entertainment", "analysis"] as const;

type Props = { locale: string };

export function ForCreatorsApplyWizard({ locale }: Props) {
  const t = useTranslations("Creators.public.apply");
  const tConsent = useTranslations("Creators.consent");
  const consentLocale = (locale === "en" || locale === "fr" ? locale : "ar") as ConsentLocale;
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [url, setUrl] = useState("");
  const [followers, setFollowers] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [appCheck1, setAppCheck1] = useState(false);
  const [appCheck2, setAppCheck2] = useState(false);
  const [appCheck3, setAppCheck3] = useState(false);
  const [fullConsentOpen, setFullConsentOpen] = useState(false);

  const consentReady = appCheck1 && appCheck2 && appCheck3;

  async function submit() {
    if (!consentReady) return;
    setPending(true);
    setError(null);
    const normalizedUrl = normalizePlatformUrl(url);
    try {
      const res = await fetch("/api/creator-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mainPlatformUrl: normalizedUrl,
          platform: platform || "other",
          contentTypes: niches,
          followersRange: followers,
          applicantNote: note.trim() || undefined,
          applicationConsentGiven: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "invalid") {
          setError(t("validationError"));
        } else {
          setError(t("error"));
        }
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t("error"));
    } finally {
      setPending(false);
    }
  }

  function go(next: number) {
    setDir(next > step ? "fwd" : "back");
    setStep(next);
  }

  if (submitted) {
    return (
      <section id="apply" className="relative mx-auto max-w-lg px-4 py-20">
        <ConfettiCanvas active />
        <div className="creator-card relative z-10 p-8 text-center">
          <p className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">{t("successTitle")}</p>
          <p className="mt-4 text-sm text-white/65">{t("successBody", { email })}</p>
          <p className="mt-6 text-xs text-white/45">{t("successExplore")}</p>
          <Link href={`/${locale}/solutions/intelligent-systems`} className="mt-4 inline-block">
            <GoldButton type="button">{t("successDemo")}</GoldButton>
          </Link>
        </div>
      </section>
    );
  }

  const slideClass = dir === "fwd" ? "fc-wizard-slide-enter" : "fc-wizard-slide-back";

  return (
    <section id="apply" className="mx-auto max-w-lg px-4 py-20">
      <div className="mb-6 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--creator-secondary)]/70">{t("eyebrow")}</p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">{t("title")}</h2>
      </div>
      <div className="creator-card fc-apply-wizard border-[var(--creator-secondary)]/20 p-6 shadow-[0_0_60px_rgba(201,146,42,0.08)] sm:p-8">
        <div className="mb-8 flex justify-center gap-3">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`fc-step-dot ${step === n ? "active" : step > n ? "done" : ""}`}
            >
              {n}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div key="s1" className={slideClass}>
            <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold">{t("step1Title")}</h2>
            <div className="mt-6 space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t("name")}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white outline-none focus:border-[var(--creator-secondary)]/50"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder={t("email")}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[var(--creator-secondary)]/50"
              />
            </div>
            <div className="mt-8 flex justify-end">
              <GoldButton type="button" disabled={!name.trim() || !email.trim()} onClick={() => go(2)}>
                {t("next")}
              </GoldButton>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div key="s2" className={slideClass}>
            <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold">{t("step2Title")}</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {PLATFORMS.map(({ id, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlatform(id)}
                  className={`flex size-14 items-center justify-center rounded-xl border transition ${
                    platform === id
                      ? "scale-110 border-[var(--creator-secondary)] bg-[var(--creator-secondary)]/15 text-[var(--creator-secondary)]"
                      : "border-white/15 text-white/55 hover:border-white/30"
                  }`}
                  aria-label={t(`platform.${id}`)}
                >
                  <Icon size={24} />
                </button>
              ))}
            </div>
            <label className="mt-6 block text-xs text-white/50">{t("url")}</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => {
                const next = normalizePlatformUrl(url);
                if (next !== url) setUrl(next);
              }}
              type="url"
              inputMode="url"
              required
              placeholder={t("urlPlaceholder")}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
            />
            <p className="mt-1.5 text-[11px] text-white/40">{t("urlHint")}</p>
            <p className="mt-6 text-xs text-white/50">{t("followersLabel")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {FOLLOWER_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFollowers(key)}
                  className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                    followers === key
                      ? "border-[var(--creator-primary)] bg-[var(--creator-primary)]/20 text-rose-100"
                      : "border-white/15 text-white/60"
                  }`}
                >
                  {t(`followers.${key}`)}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between gap-2">
              <button type="button" className="text-sm text-white/55" onClick={() => go(1)}>
                {t("back")}
              </button>
              <GoldButton
                type="button"
                disabled={!platform || !url.trim() || !followers}
                onClick={() => go(3)}
              >
                {t("next")}
              </GoldButton>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div key="s3" className={slideClass}>
            <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold">{t("step3Title")}</h2>
            <p className="mt-2 text-xs text-white/50">{t("nichesLabel")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NICHE_KEYS.map((key) => {
                const on = niches.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setNiches((prev) =>
                        on ? prev.filter((x) => x !== key) : [...prev, key],
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      on
                        ? "border-[var(--creator-primary)] bg-[var(--creator-primary)]/15 text-rose-100"
                        : "border-white/15 text-white/60"
                    }`}
                  >
                    {t(`niche.${key}`)}
                  </button>
                );
              })}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              placeholder={t("notePlaceholder")}
              rows={3}
              className="mt-6 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
            />

            <div className="mt-6 rounded-xl border border-rose-500/25 bg-rose-950/20 p-4">
              <p className="text-xs font-bold text-rose-100">{tConsent("applicationIntro")}</p>
              <div className="mt-3 space-y-2">
                {[
                  { checked: appCheck1, set: setAppCheck1, label: tConsent("applicationCheck1") },
                  { checked: appCheck2, set: setAppCheck2, label: tConsent("applicationCheck2") },
                  { checked: appCheck3, set: setAppCheck3, label: tConsent("applicationCheck3") },
                ].map((c) => (
                  <label key={c.label} className="flex cursor-pointer items-start gap-2 text-xs text-white/80">
                    <input
                      type="checkbox"
                      checked={c.checked}
                      onChange={(e) => c.set(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFullConsentOpen(true)}
                className="mt-3 text-[11px] font-semibold text-[var(--creator-secondary)] underline"
              >
                {tConsent("viewFull")}
              </button>
            </div>

            {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
            <div className="mt-8 flex justify-between gap-2">
              <button type="button" className="text-sm text-white/55" onClick={() => go(2)}>
                {t("back")}
              </button>
              <GoldButton
                type="button"
                disabled={pending || niches.length === 0 || !consentReady}
                onClick={() => void submit()}
              >
                {pending ? t("sending") : t("submit")}
              </GoldButton>
            </div>
          </div>
        ) : null}
      </div>

      <CreatorConsentModal
        locale={consentLocale}
        creatorName={name}
        isOpen={fullConsentOpen}
        mode="view-only"
        onAccept={async () => {}}
        onDecline={() => setFullConsentOpen(false)}
      />
    </section>
  );
}
