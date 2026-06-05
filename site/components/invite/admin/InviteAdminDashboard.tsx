"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
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

export function InviteAdminDashboard({ cards, stats, origin }: Props) {
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
        setError("Could not create card — check fields");
        return;
      }
      const form = document.getElementById("invite-create-form") as HTMLFormElement | null;
      form?.reset();
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this invitation?")) return;
    start(async () => {
      await deleteInviteCardAction(id);
    });
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="invite-font-mono text-xs text-[var(--invite-teal)]">{">"} invite_admin.sys</p>
          <h1 className="mt-2 text-2xl font-bold text-white">TENEGTA Invite Control</h1>
          <p className="mt-1 text-sm text-white/50">Access Token invitations · Content Creators</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/admin/login" })}
          className="invite-font-mono rounded border border-white/15 px-3 py-2 text-xs text-white/70 hover:text-white"
        >
          logout
        </button>
      </header>

      <div className="invite-safe-banner mb-8 rounded-xl p-4 text-sm leading-relaxed text-white/70">
        <p className="invite-font-mono text-xs text-[var(--invite-teal)]">// safe_deploy · additive only</p>
        <p className="mt-2">
          نظام الدعوات يضيف جدول <strong className="text-white/90">InviteCard</strong> فقط — لا يغيّر
          حسابات الشركاء، كلمات المرور، أو بيانات Growth الموجودة.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "TOTAL", value: stats.total },
          { label: "ACCEPTED", value: stats.accepted },
          { label: "PENDING", value: stats.pending },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"
          >
            <p className="invite-font-mono text-[10px] text-white/40">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--invite-purple)]">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-10 rounded-xl border border-[var(--invite-purple)]/25 bg-[var(--invite-surface)] p-5">
        <h2 className="invite-font-mono text-sm text-[var(--invite-teal)]">$ create_invite --new</h2>
        {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
        <form id="invite-create-form" action={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">name</span>
            <input name="name" required className="invite-admin-input" placeholder="أحمد الرشيد" />
          </label>
          <label className="block sm:col-span-1">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">handle</span>
            <input
              name="handle"
              required
              className="invite-admin-input"
              placeholder="ahmed.rashid"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">tier</span>
            <select name="tier" defaultValue="CONTENT CREATOR" className="invite-admin-input">
              {INVITE_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-1">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">scope</span>
            <input
              name="scope"
              required
              className="invite-admin-input"
              placeholder="Technology storytelling · Arabic"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">message</span>
            <textarea
              name="message"
              required
              rows={4}
              className="invite-admin-input resize-y"
              placeholder="Personal invitation message..."
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="invite-font-mono rounded-lg border border-[var(--invite-purple)]/50 bg-[var(--invite-purple)]/15 px-5 py-2.5 text-sm text-white hover:bg-[var(--invite-purple)]/25 disabled:opacity-50"
            >
              {pending ? "$ generating..." : "$ generate_access_token"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="invite-font-mono mb-4 text-sm text-white/60">issued_tokens ({cards.length})</h2>
        <div className="space-y-3">
          {cards.length === 0 ? (
            <p className="text-sm text-white/40">No invitations yet.</p>
          ) : (
            cards.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-white/10 bg-black/25 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="invite-font-mono text-xs text-[var(--invite-purple)]">@{c.handle}</p>
                  <p className="invite-font-mono mt-1 truncate text-[10px] text-white/35">{c.token}</p>
                  <p className="mt-2 text-[10px] text-white/45">
                    {c.tier} ·{" "}
                    <span className={c.accepted ? "text-[var(--invite-teal)]" : "text-amber-300/80"}>
                      {c.accepted ? "accepted" : "pending"}
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
                  <a
                    href={`/api/invite/${c.slug}/card`}
                    className="invite-font-mono inline-flex items-center rounded border border-[var(--invite-gold)]/35 bg-[var(--invite-gold)]/10 px-3 py-1.5 text-[10px] text-[var(--invite-gold)] hover:bg-[var(--invite-gold)]/15"
                  >
                    تحميل بطاقة QR
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(c.slug)}
                    className="invite-font-mono rounded border border-white/15 px-3 py-1.5 text-[10px] hover:border-[var(--invite-teal)]/40"
                  >
                    {copied === c.slug ? "copied!" : "copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    disabled={pending}
                    className="invite-font-mono rounded border border-rose-500/30 px-3 py-1.5 text-[10px] text-rose-300 hover:bg-rose-500/10"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
