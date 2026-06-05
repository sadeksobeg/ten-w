"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import {
  createInviteCardAction,
  deleteInviteCardAction,
} from "@/lib/invite/actions";
import { INVITE_TIERS } from "@/lib/invite/generate";

export type InviteCardRow = {
  id: string;
  name: string;
  handle: string;
  tier: string;
  scope: string;
  slug: string;
  token: string;
  accepted: boolean;
  acceptedAt: Date | null;
  createdAt: Date;
};

type Props = {
  cards: InviteCardRow[];
  stats: { total: number; accepted: number; pending: number };
  origin: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20";

function InviteStatsBar({ stats }: { stats: Props["stats"] }) {
  const t = useTranslations("Growth.admin.invites");

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: t("statsTotal"), value: stats.total },
        { label: t("statsAccepted"), value: stats.accepted },
        { label: t("statsPending"), value: stats.pending },
      ].map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {s.label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function InviteAdminPanel({ cards, stats, origin }: Props) {
  const t = useTranslations("Growth.admin.invites");
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function copyLink(slug: string) {
    const url = `${origin}/invite/${slug}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(slug);
      window.setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleCreate(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createInviteCardAction(formData);
      if (!res.ok) {
        setError(t("errors.createFailed"));
        return;
      }
      const form = document.getElementById("invite-create-form") as HTMLFormElement | null;
      form?.reset();
    });
  }

  function onDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    start(async () => {
      await deleteInviteCardAction(id);
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("subtitle")}</p>
      </header>

      <InviteStatsBar stats={stats} />

      <GlassCard className="border border-white/10 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">{t("createTitle")}</h2>
        <p className="mt-1 text-xs text-white/45">{t("createHint")}</p>
        {error ? <p className="mt-3 text-xs text-rose-400">{error}</p> : null}
        <form id="invite-create-form" action={handleCreate} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-white/55">{t("name")}</span>
              <input name="name" required className={fieldClass} placeholder={t("namePlaceholder")} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-white/55">{t("handle")}</span>
              <input
                name="handle"
                required
                className={fieldClass}
                placeholder={t("handlePlaceholder")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-white/55">{t("tier")}</span>
              <select name="tier" defaultValue="CONTENT CREATOR" className={fieldClass}>
                {INVITE_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-white/55">{t("scope")}</span>
              <input
                name="scope"
                required
                className={fieldClass}
                placeholder={t("scopePlaceholder")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-white/55">{t("message")}</span>
              <textarea
                name="message"
                required
                rows={4}
                className={`${fieldClass} resize-y`}
                placeholder={t("messagePlaceholder")}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
          >
            {pending ? t("createSubmitting") : t("createSubmit")}
          </button>
        </form>
      </GlassCard>

      <GlassCard className="border border-white/10 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">{t("listTitle")}</h2>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/55">
            {cards.length}
          </span>
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-white/45">{t("empty")}</p>
        ) : (
          <div className="space-y-3">
            {cards.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-white/10 bg-black/25 p-4 lg:flex lg:items-center lg:justify-between lg:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{c.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        c.accepted
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-200"
                      }`}
                    >
                      {c.accepted ? t("statusAccepted") : t("statusPending")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">@{c.handle}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {c.tier} · {c.scope}
                  </p>
                  <p className="mt-2 truncate font-mono text-[10px] text-white/30">{c.token}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 lg:mt-0 lg:shrink-0">
                  <a
                    href={`/api/invite/${c.slug}/card`}
                    className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/15"
                  >
                    {t("downloadQr")}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(c.slug)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 hover:border-gold/30"
                  >
                    {copied === c.slug ? t("copied") : t("copyLink")}
                  </button>
                  <a
                    href={`/invite/${c.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 hover:border-gold/30"
                  >
                    {t("preview")}
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    disabled={pending}
                    className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
