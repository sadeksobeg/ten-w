"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { adminCreateBadgeDefinitionAction } from "@/lib/growth/actions";
import { GlassCard } from "@/components/growth/ui/GlassCard";

export function AdminCreateBadgeForm() {
  const t = useTranslations("Growth.admin.badgesPage");
  const [state, action] = useActionState(adminCreateBadgeDefinitionAction, undefined);

  return (
    <GlassCard>
      <h2 className="text-lg font-bold">{t("createTitle")}</h2>
      <p className="mt-1 text-sm text-[var(--growth-text-sub)]">{t("createHint")}</p>
      <form action={action} className="mt-5 grid gap-3 sm:grid-cols-12">
        <label className="sm:col-span-3">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("createKey")}</span>
          <input
            name="key"
            required
            pattern="[a-z][a-z0-9_]*"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-sm text-white outline-none focus:border-gold/40"
            placeholder="vip_partner"
          />
        </label>
        <label className="sm:col-span-4">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("createName")}</span>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="sm:col-span-3">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("createType")}</span>
          <select
            name="type"
            defaultValue="ADMIN"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          >
            <option value="ADMIN">{t("typeAdmin")}</option>
            <option value="AUTO">{t("typeAuto")}</option>
          </select>
        </label>
        <label className="sm:col-span-12">
          <span className="text-xs text-[var(--growth-text-sub)]">{t("createDescription")}</span>
          <textarea
            name="description"
            rows={2}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            className="w-full rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 text-xs font-bold text-gold"
          >
            {t("createSubmit")}
          </button>
        </div>
      </form>
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <p className="mt-3 text-sm text-emerald-300">{t("createSuccess", { key: state.key })}</p>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {state.error === "key_taken" ? t("errors.key_taken") : t("errors.unknown")}
        </p>
      ) : null}
    </GlassCard>
  );
}
