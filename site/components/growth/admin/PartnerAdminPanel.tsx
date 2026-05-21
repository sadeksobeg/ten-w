"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  adminAdjustPartnerXpFormAction,
  adminCreatePartnerAction,
  adminSetPartnerLevelFormAction,
  togglePartnerActiveFormAction,
} from "@/lib/growth/actions";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";

type LevelOption = { id: string; name: string };

type PartnerRow = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  levelName: string;
  totalXp: number;
  joinedAt: string;
  isActive: boolean;
  publicSlug: string | null;
  locale: string;
};

function createErrorText(t: (k: string) => string, code: string) {
  switch (code) {
    case "email_taken":
      return t("errors.email_taken");
    case "invalid_referral":
      return t("errors.invalid_referral");
    case "invalid_input":
      return t("errors.invalid_input");
    case "missing_seed":
      return t("errors.missing_seed");
    case "server_error":
      return t("errors.server_error");
    case "unauthorized":
      return t("errors.unauthorized");
    default:
      return t("errors.unknown");
  }
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20";

export function CreatePartnerForm() {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminCreatePartnerAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-white/55">{t("name")}</span>
          <input name="name" required className={fieldClass} autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("password")}</span>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className={fieldClass}
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("phone")}</span>
          <input name="phone" type="tel" className={fieldClass} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("referralOptional")}</span>
          <input name="referralCode" className={fieldClass} />
        </label>
      </div>

      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <div
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          role="alert"
        >
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </div>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {t("created")}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg sm:w-auto sm:min-w-[200px]"
      >
        {t("createSubmit")}
      </button>
    </form>
  );
}

function PartnerXpControls({ partnerId, levels }: { partnerId: string; levels: LevelOption[] }) {
  const t = useTranslations("Growth.admin.partners");

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
      <span className="w-full text-[10px] font-bold uppercase tracking-wide text-white/40">
        {t("xpControls")}
      </span>
      {[100, 500, 1000, -100].map((amt) => (
        <form key={amt} action={adminAdjustPartnerXpFormAction}>
          <input type="hidden" name="partnerId" value={partnerId} />
          <input type="hidden" name="amount" value={amt} />
          <input type="hidden" name="reason" value="quick_adjust" />
          <button
            type="submit"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-gold/30"
          >
            {amt > 0 ? `+${amt}` : amt} XP
          </button>
        </form>
      ))}
      <form action={adminSetPartnerLevelFormAction} className="ms-auto flex flex-wrap items-center gap-2">
        <input type="hidden" name="partnerId" value={partnerId} />
        <select
          name="levelId"
          className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
          defaultValue={levels[0]?.id}
        >
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold"
        >
          {t("setLevel")}
        </button>
      </form>
    </div>
  );
}

export function PartnerList({ partners, levels }: { partners: PartnerRow[]; levels: LevelOption[] }) {
  const t = useTranslations("Growth.admin.partners");

  return (
    <ul className="divide-y divide-white/10">
      {partners.length === 0 ? (
        <li className="px-5 py-10 text-center text-sm text-white/50">{t("empty")}</li>
      ) : (
        partners.map((p) => (
          <li key={p.userId} className="px-4 py-5 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <GrowthAvatar name={p.name} email={p.email} size="lg" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white">{p.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-white/55">{p.email}</p>
                    {p.phone ? <p className="text-xs text-white/45">{p.phone}</p> : null}
                  </div>
                  <form action={togglePartnerActiveFormAction} className="shrink-0">
                    <input type="hidden" name="userId" value={p.userId} />
                    <button
                      type="submit"
                      className={
                        p.isActive
                          ? "rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-1.5 text-xs font-bold text-emerald-200"
                          : "rounded-full border border-rose-500/40 bg-rose-500/15 px-4 py-1.5 text-xs font-bold text-rose-200"
                      }
                    >
                      {p.isActive ? t("active") : t("inactive")}
                    </button>
                  </form>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-semibold text-white/70">
                    {p.levelName}
                  </span>
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 font-semibold text-gold">
                    {p.totalXp} XP
                  </span>
                  <span className="text-white/40">
                    {new Date(p.joinedAt).toLocaleDateString()}
                  </span>
                </div>
                {p.publicSlug ? (
                  <a
                    href={`/${p.locale}/growth/profile/${p.publicSlug}`}
                    className="mt-2 inline-block text-xs font-semibold text-gold hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /growth/profile/{p.publicSlug}
                  </a>
                ) : null}
                <PartnerXpControls partnerId={p.userId} levels={levels} />
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  );
}
