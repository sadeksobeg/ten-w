"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  adminAdjustPartnerXpFormAction,
  adminCreatePartnerAction,
  adminSetPartnerLevelFormAction,
  togglePartnerActiveFormAction,
} from "@/lib/growth/actions";

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
    case "unauthorized":
      return t("errors.unauthorized");
    default:
      return t("errors.unknown");
  }
}

export function CreatePartnerForm() {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminCreatePartnerAction, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-12">
      <label className="sm:col-span-3">
        <span className="text-xs text-white/55">{t("name")}</span>
        <input
          name="name"
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
      </label>
      <label className="sm:col-span-3">
        <span className="text-xs text-white/55">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs text-white/55">{t("password")}</span>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs text-white/55">{t("phone")}</span>
        <input
          name="phone"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs text-white/55">{t("referralOptional")}</span>
        <input
          name="referralCode"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
        />
      </label>
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <div className="sm:col-span-12 text-sm text-red-300" role="alert">
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </div>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <div className="sm:col-span-12 text-sm text-emerald-300">{t("created")}</div>
      ) : null}
      <div className="sm:col-span-12">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg"
        >
          {t("createSubmit")}
        </button>
      </div>
    </form>
  );
}

function PartnerXpControls({ partnerId, levels }: { partnerId: string; levels: LevelOption[] }) {
  const t = useTranslations("Growth.admin.partners");

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
      {[100, 500, 1000, -100].map((amt) => (
        <form key={amt} action={adminAdjustPartnerXpFormAction}>
          <input type="hidden" name="partnerId" value={partnerId} />
          <input type="hidden" name="amount" value={amt} />
          <input type="hidden" name="reason" value="quick_adjust" />
          <button
            type="submit"
            className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 hover:border-gold/30"
          >
            {amt > 0 ? `+${amt}` : amt}
          </button>
        </form>
      ))}
      <form action={adminSetPartnerLevelFormAction} className="flex items-center gap-2">
        <input type="hidden" name="partnerId" value={partnerId} />
        <select
          name="levelId"
          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white"
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
          className="rounded-lg border border-gold/30 px-2 py-1 text-[11px] font-semibold text-gold"
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
    <div className="divide-y divide-white/10">
      {partners.length === 0 ? (
        <p className="px-4 py-8 text-sm text-white/55">{t("empty")}</p>
      ) : (
        partners.map((p) => (
          <div key={p.userId} className="px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-1 text-xs text-white/55">{p.email}</div>
                {p.phone ? <div className="text-xs text-white/45">{p.phone}</div> : null}
                <div className="mt-2 text-xs text-white/45">
                  {p.levelName} · {p.totalXp} XP · {new Date(p.joinedAt).toLocaleDateString()}
                </div>
                {p.publicSlug ? (
                  <a
                    href={`/${p.locale}/growth/profile/${p.publicSlug}`}
                    className="mt-2 inline-block text-xs text-gold hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /growth/profile/{p.publicSlug}
                  </a>
                ) : null}
              </div>
              <form action={togglePartnerActiveFormAction}>
                <input type="hidden" name="userId" value={p.userId} />
                <button
                  type="submit"
                  className={
                    p.isActive
                      ? "rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
                      : "rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                  }
                >
                  {p.isActive ? t("active") : t("inactive")}
                </button>
              </form>
            </div>
            <PartnerXpControls partnerId={p.userId} levels={levels} />
          </div>
        ))
      )}
    </div>
  );
}
