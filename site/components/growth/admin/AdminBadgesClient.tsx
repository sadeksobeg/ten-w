"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import { assignAdminBadgeAction } from "@/lib/growth/actions";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";

export type AdminBadgeOption = {
  key: string;
  name: string;
  description: string | null;
  type: string;
};

type Props = {
  adminBadges: AdminBadgeOption[];
};

export function AdminBadgesClient({ adminBadges }: Props) {
  const t = useTranslations("Growth.admin.badgesPage");
  const locale = useLocale();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [badgeKey, setBadgeKey] = useState(adminBadges[0]?.key ?? "");
  const [partnerLabel, setPartnerLabel] = useState("");
  const [pending, setPending] = useState(false);

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
      showToast({
        type: "success",
        title: t("toastSuccess"),
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
    <>
      <GlassCard>
        <form onSubmit={openConfirm} className="grid gap-4 sm:grid-cols-12">
          <label className="sm:col-span-5">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <div className="sm:col-span-12 flex flex-col gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4 sm:flex-row sm:items-center">
              <BadgeIcon badgeKey={selected.key} earned size="lg" showGlow />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gold">{selected.label}</p>
                <p className="mt-1 text-xs text-white/60">{t("badgeValueHint")}</p>
                <p className="mt-2 text-sm text-white/80">{selected.valueText || "—"}</p>
              </div>
            </div>
          ) : null}
          <div className="flex items-end sm:col-span-12">
            <GoldButton type="submit" className="w-full sm:w-auto">
              {t("submit")}
            </GoldButton>
          </div>
        </form>
      </GlassCard>

      <dialog
        ref={dialogRef}
        className="max-w-md rounded-2xl border border-[var(--growth-border)] bg-[var(--growth-surface-2)] p-6 text-[var(--growth-text)] backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-in"
      >
        <div className="flex flex-col items-center text-center">
          <BadgeIcon badgeKey={badgeKey} earned size="xl" showGlow animate />
          <h3 className="mt-4 text-lg font-bold">{t("confirmTitle")}</h3>
          <p className="mt-2 text-sm text-[var(--growth-text-sub)]">
            {t("confirmBody", {
              badge: selected?.label ?? badgeKey,
              partner: partnerLabel,
            })}
          </p>
          {selected?.valueText ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
              {selected.valueText}
            </p>
          ) : null}
          <div className="mt-6 flex w-full gap-3">
            <GoldButton
              variant="ghost"
              className="flex-1"
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              {t("cancel")}
            </GoldButton>
            <GoldButton
              className="flex-1"
              type="button"
              disabled={pending}
              onClick={() => void confirmGrant()}
            >
              {t("confirmSubmit")}
            </GoldButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
