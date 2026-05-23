"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { useToast } from "@/hooks/useToast";
import { assignAdminBadgeAction } from "@/lib/growth/actions";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import type { AdminBadgeOption } from "@/components/growth/admin/AdminBadgesClient";

const FEATURED_KEYS = ["content_creator", "verified_partner", "trusted_partner"] as const;

type Props = {
  adminBadges: AdminBadgeOption[];
};

export function AdminBadgeGrantStudio({ adminBadges }: Props) {
  const t = useTranslations("Growth.admin.badgesPage.grantStudio");
  const locale = useLocale();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [badgeKey, setBadgeKey] = useState<string>(FEATURED_KEYS[0]);
  const [partnerLabel, setPartnerLabel] = useState("");
  const [pending, setPending] = useState(false);
  const [burst, setBurst] = useState(false);

  const options = useMemo(
    () =>
      adminBadges.map((b) => {
        const copy = resolveBadgeCopy(b.key, locale, {
          name: b.name,
          description: b.description,
        });
        return { ...b, label: copy.name, valueText: copy.description || b.description || "" };
      }),
    [adminBadges, locale],
  );

  const selected = options.find((o) => o.key === badgeKey) ?? options[0];
  const featured = options.filter((o) =>
    (FEATURED_KEYS as readonly string[]).includes(o.key),
  );

  function openConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !badgeKey) return;
    setPartnerLabel(email.trim());
    dialogRef.current?.showModal();
  }

  async function confirmGrant() {
    setPending(true);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("badgeKey", badgeKey);
    const res = await assignAdminBadgeAction(fd);
    dialogRef.current?.close();
    setPending(false);
    if (res.ok) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1200);
      showToast({
        type: "success",
        title: t("toastCeremony"),
        body: `${res.badgeName} → ${partnerLabel}`,
        badgeKey: res.badgeKey,
      });
      setEmail("");
    } else {
      const msg =
        res.error === "badge_already_granted"
          ? t("errors.badge_already_granted")
          : t("errors.unknown");
      showToast({ type: "error", title: msg });
    }
  }

  return (
    <GlassCard variant="highlight" className="relative overflow-hidden p-6">
      {burst ? <ParticleEffect className="pointer-events-none absolute inset-0" active /> : null}
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">{t("eyebrow")}</p>
        <h2 className="mt-1 font-[family-name:var(--font-cairo)] text-xl font-extrabold">{t("title")}</h2>
        <p className="mt-2 text-sm text-white/60">{t("hint")}</p>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {featured.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBadgeKey(b.key)}
              className={`flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition ${
                badgeKey === b.key
                  ? "border-gold/50 bg-gold/15 shadow-[0_0_24px_-8px_rgba(228,184,77,0.8)]"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/30"
              }`}
            >
              <BadgeIcon badgeKey={b.key} earned size="lg" showGlow animate={badgeKey === b.key} />
              <span className="max-w-[6rem] truncate text-[10px] font-bold text-white/80">{b.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={openConfirm} className="mt-6 grid gap-4 sm:grid-cols-12">
          <label className="sm:col-span-5">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPh")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          <label className="sm:col-span-7">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("badgeKey")}</span>
            <select
              required
              value={badgeKey}
              onChange={(e) => setBadgeKey(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {options.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          {selected ? (
            <div className="sm:col-span-12 flex flex-col items-center gap-4 rounded-2xl border border-gold/25 bg-black/30 p-6 sm:flex-row">
              <BadgeIcon badgeKey={selected.key} earned size="xxl" showGlow />
              <div className="min-w-0 flex-1 text-center sm:text-start">
                <p className="text-lg font-bold text-gold">{selected.label}</p>
                <p className="mt-2 text-sm text-white/70">{selected.valueText || "—"}</p>
              </div>
            </div>
          ) : null}
          <div className="sm:col-span-12">
            <GoldButton type="submit" className="w-full sm:w-auto">
              {t("submit")}
            </GoldButton>
          </div>
        </form>
      </div>

      <dialog
        ref={dialogRef}
        className="max-w-md rounded-2xl border border-[var(--growth-border)] bg-[var(--growth-surface-2)] p-6 text-[var(--growth-text)] backdrop:bg-black/60"
      >
        <div className="flex flex-col items-center text-center">
          <BadgeIcon badgeKey={badgeKey} earned size="xxl" showGlow animate />
          <h3 className="mt-4 text-lg font-bold">{t("confirmTitle")}</h3>
          <p className="mt-2 text-sm text-[var(--growth-text-sub)]">
            {t("confirmBody", {
              badge: selected?.label ?? badgeKey,
              partner: partnerLabel,
            })}
          </p>
          <div className="mt-6 flex w-full gap-3">
            <GoldButton
              variant="ghost"
              className="flex-1"
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              {t("cancel")}
            </GoldButton>
            <GoldButton className="flex-1" type="button" disabled={pending} onClick={() => void confirmGrant()}>
              {t("confirmSubmit")}
            </GoldButton>
          </div>
        </div>
      </dialog>
    </GlassCard>
  );
}
