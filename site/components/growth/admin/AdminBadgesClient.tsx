"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import { assignAdminBadgeAction } from "@/lib/growth/actions";

type BadgeOption = { key: string; name: string };

type Props = {
  adminBadges: BadgeOption[];
};

export function AdminBadgesClient({ adminBadges }: Props) {
  const t = useTranslations("Growth.admin.badgesPage");
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [badgeKey, setBadgeKey] = useState(adminBadges[0]?.key ?? "");
  const [partnerLabel, setPartnerLabel] = useState("");
  const [pending, setPending] = useState(false);

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
        <form onSubmit={openConfirm} className="grid gap-3 sm:grid-cols-12">
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
          <label className="sm:col-span-4">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("badgeKey")}</span>
            <select
              required
              value={badgeKey}
              onChange={(e) => setBadgeKey(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {adminBadges.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.key}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-3">
            <GoldButton type="submit" className="w-full">
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
            {t("confirmBody", { badge: badgeKey, partner: partnerLabel })}
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
