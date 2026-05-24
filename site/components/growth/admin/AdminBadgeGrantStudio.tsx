"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BadgeGrantLivePreview } from "@/components/growth/admin/BadgeGrantLivePreview";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { useToast } from "@/hooks/useToast";
import { assignAdminBadgesBatchAction } from "@/lib/growth/actions";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";

export type AdminBadgeOption = {
  key: string;
  name: string;
  description: string | null;
  type: string;
};

export type GrantPartnerOption = {
  userId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  earnedBadgeKeys: string[];
};

const FEATURED_KEYS = [
  "content_creator",
  "verified_partner",
  "trusted_partner",
  "beta_tester",
  "founding_partner",
] as const;

type Props = {
  adminBadges: AdminBadgeOption[];
  partners: GrantPartnerOption[];
};

export function AdminBadgeGrantStudio({ adminBadges, partners }: Props) {
  const t = useTranslations("Growth.admin.badgesPage.grantStudio");
  const locale = useLocale();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [badgeKey, setBadgeKey] = useState<string>(FEATURED_KEYS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [partnerQuery, setPartnerQuery] = useState("");
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
  const featured = options.filter((o) => (FEATURED_KEYS as readonly string[]).includes(o.key));

  const filteredPartners = useMemo(() => {
    const q = partnerQuery.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.name?.toLowerCase().includes(q) ?? false),
    );
  }, [partners, partnerQuery]);

  const previewPartner = useMemo(() => {
    const firstId = [...selectedIds][0];
    if (firstId) return partners.find((p) => p.userId === firstId) ?? partners[0];
    return partners[0];
  }, [selectedIds, partners]);

  function togglePartner(userId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of filteredPartners) next.add(p.userId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function openConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.size === 0 || !badgeKey) return;
    dialogRef.current?.showModal();
  }

  async function confirmGrant() {
    setPending(true);
    const res = await assignAdminBadgesBatchAction([...selectedIds], badgeKey);
    dialogRef.current?.close();
    setPending(false);
    if (res.ok) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1200);
      showToast({
        type: "success",
        title: t("toastCeremony"),
        body: t("toastBatchResult", {
          granted: res.granted,
          skipped: res.skipped,
        }),
        badgeKey,
      });
      setSelectedIds(new Set());
    } else {
      showToast({ type: "error", title: t("errors.unknown") });
    }
  }

  const selectedLabels = partners
    .filter((p) => selectedIds.has(p.userId))
    .map((p) => p.name ?? p.email);

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
              <span className="max-w-[7rem] truncate text-[10px] font-bold text-white/80">{b.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={openConfirm} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-xs text-[var(--growth-text-sub)]">{t("badgeKey")}</span>
            <select
              required
              value={badgeKey}
              onChange={(e) => setBadgeKey(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
            >
              {options.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label} ({b.key})
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--growth-text-sub)]">
                {t("selectPartners")} ({selectedIds.size})
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-[10px] font-bold text-gold hover:underline"
                  onClick={selectAllVisible}
                >
                  {t("selectAll")}
                </button>
                <button
                  type="button"
                  className="text-[10px] font-bold text-white/50 hover:underline"
                  onClick={clearSelection}
                >
                  {t("clearSelection")}
                </button>
              </div>
            </div>
            <input
              type="search"
              value={partnerQuery}
              onChange={(e) => setPartnerQuery(e.target.value)}
              placeholder={t("partnerSearch")}
              className="mb-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
            />
            <ul className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
              {filteredPartners.length === 0 ? (
                <li className="px-2 py-4 text-center text-xs text-white/45">{t("noPartners")}</li>
              ) : (
                filteredPartners.map((p) => {
                  const checked = selectedIds.has(p.userId);
                  const hasBadge = p.earnedBadgeKeys.includes(badgeKey);
                  return (
                    <li key={p.userId}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition ${
                          checked ? "bg-gold/10" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePartner(p.userId)}
                          className="size-4 rounded border-white/20 accent-[var(--growth-gold)]"
                        />
                        <GrowthAvatar
                          name={p.name}
                          email={p.email}
                          avatarUrl={p.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white">
                            {p.name ?? p.email}
                          </p>
                          <p className="truncate text-[10px] text-white/45">{p.email}</p>
                        </div>
                        {hasBadge ? (
                          <span className="shrink-0 text-[9px] font-bold text-emerald-300/90">
                            {t("alreadyHas")}
                          </span>
                        ) : null}
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {previewPartner && selected ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gold">{t("livePreviewTitle")}</p>
              <BadgeGrantLivePreview
                partnerName={previewPartner.name ?? ""}
                partnerEmail={previewPartner.email}
                avatarUrl={previewPartner.avatarUrl}
                earnedBadgeKeys={previewPartner.earnedBadgeKeys}
                grantBadgeKey={badgeKey}
              />
              <p className="text-[10px] text-white/45">{selected.valueText}</p>
            </div>
          ) : null}

          <GoldButton type="submit" className="w-full sm:w-auto" disabled={selectedIds.size === 0}>
            {t("submit")} ({selectedIds.size})
          </GoldButton>
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
            {t("confirmBatchBody", {
              badge: selected?.label ?? badgeKey,
              count: selectedIds.size,
            })}
          </p>
          <p className="mt-2 max-h-24 overflow-y-auto text-xs text-white/55">
            {selectedLabels.slice(0, 8).join(" · ")}
            {selectedLabels.length > 8 ? ` +${selectedLabels.length - 8}` : ""}
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
