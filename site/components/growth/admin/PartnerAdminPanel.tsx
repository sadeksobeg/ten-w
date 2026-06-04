"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  adminAdjustPartnerXpFormAction,
  adminCreatePartnerAction,
  adminDeletePartnerAction,
  adminSetPartnerLevelFormAction,
  adminSetPartnerUplineAction,
  adminSetPartnerVerifiedAction,
  adminUpdatePartnerCredentialsAction,
  togglePartnerActiveFormAction,
} from "@/lib/growth/actions";
import { VerifiedBadge } from "@/components/growth/ui/VerifiedBadge";
import { PasswordInput } from "@/components/growth/ui/PasswordInput";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { AdminOpenChatLink } from "@/components/growth/admin/AdminOpenChatLink";
import { PartnerNetworkTree } from "@/components/growth/profile/PartnerNetworkTree";

type LevelOption = { id: string; name: string };

type PickerOption = {
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  publicSlug: string | null;
};

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
  uplineName: string | null;
  uplineUserId: string | null;
  uplineSlug: string | null;
  directCount: number;
  totalCount: number;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
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
    case "cycle":
      return t("errors.cycle");
    case "self":
      return t("errors.self");
    case "invalid_upline_scope":
      return t("errors.invalid_upline_scope");
    case "not_found":
      return t("errors.not_found");
    case "confirm_mismatch":
      return t("errors.confirm_mismatch");
    default:
      return t("errors.unknown");
  }
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20";

export function CreatePartnerForm({
  pickerOptions,
  referralChildren,
}: {
  pickerOptions: PickerOption[];
  referralChildren: Record<string, string[]>;
}) {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminCreatePartnerAction, undefined);
  const [networkOwnerId, setNetworkOwnerId] = useState("");
  const [parentId, setParentId] = useState("");
  const [password, setPassword] = useState("");
  const [lastCreatedPassword, setLastCreatedPassword] = useState<string | null>(null);

  const uplineOptions = useMemo(() => {
    if (!networkOwnerId) return pickerOptions;
    const childIds = new Set(referralChildren[networkOwnerId] ?? []);
    return pickerOptions.filter(
      (p) => p.userId === networkOwnerId || childIds.has(p.userId),
    );
  }, [networkOwnerId, pickerOptions, referralChildren]);

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
        <PasswordInput
          name="password"
          label={t("password")}
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(v) => setPassword(v)}
        />
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("phone")}</span>
          <input name="phone" type="tel" className={fieldClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-white/55">{t("networkOwnerPicker")}</span>
          <select
            name="networkOwnerUserId"
            className={fieldClass}
            value={networkOwnerId}
            onChange={(e) => {
              setNetworkOwnerId(e.target.value);
              setParentId("");
            }}
          >
            <option value="">{t("networkOwnerAny")}</option>
            {pickerOptions.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.name} ({p.referralCode})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-white/40">{t("networkOwnerHint")}</p>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-white/55">{t("uplinePicker")}</span>
          <select
            name="parentUserId"
            className={fieldClass}
            value={parentId}
            onChange={(e) => {
              const id = e.target.value;
              setParentId(id);
              const opt = pickerOptions.find((p) => p.userId === id);
              const refInput = document.querySelector<HTMLInputElement>(
                'input[name="referralCode"]',
              );
              if (refInput && opt) refInput.value = opt.referralCode;
            }}
          >
            <option value="">{t("uplineNone")}</option>
            {uplineOptions.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.name} ({p.referralCode})
              </option>
            ))}
          </select>
          {networkOwnerId ? (
            <p className="mt-1 text-[10px] text-amber-200/70">{t("uplineScopedHint")}</p>
          ) : null}
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-white/55">{t("referralOptional")}</span>
          <input name="referralCode" className={fieldClass} placeholder={t("referralOrPicker")} />
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
          <p>{t("created")}</p>
          {lastCreatedPassword ? (
            <p className="mt-2 font-mono text-xs">
              {t("createdWithPassword")} <strong>{lastCreatedPassword}</strong>
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        onClick={() => {
          if (password.length >= 8) setLastCreatedPassword(password);
        }}
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

function PartnerVerifiedForm({
  partnerId,
  isVerified,
  officialDisplayName,
}: {
  partnerId: string;
  isVerified: boolean;
  officialDisplayName: string | null;
}) {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminSetPartnerVerifiedAction, undefined);

  return (
    <form action={action} className="mt-3 space-y-2 rounded-xl border border-amber-500/25 bg-amber-950/25 p-3">
      <p className="text-[10px] font-semibold text-amber-100/90">{t("verifiedTitle")}</p>
      <p className="text-[10px] text-white/45">{t("verifiedHint")}</p>
      <input type="hidden" name="partnerId" value={partnerId} />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isVerifiedOfficial"
          defaultChecked={isVerified}
          className="size-4 rounded border-white/20"
        />
        <span className="text-xs text-white/80">{t("verifiedToggle")}</span>
        {isVerified ? <VerifiedBadge label={t("verifiedBadge")} variant="gold" /> : null}
      </label>
      <label className="block">
        <span className="text-[10px] text-white/50">{t("verifiedDisplayName")}</span>
        <input
          name="officialDisplayName"
          defaultValue={officialDisplayName ?? ""}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
          placeholder={t("verifiedDisplayNamePlaceholder")}
        />
      </label>
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <p className="text-xs text-rose-300" role="alert">
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </p>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <p className="text-xs text-emerald-300">{t("verifiedSaved")}</p>
      ) : null}
      <button
        type="submit"
        className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold"
      >
        {t("verifiedSave")}
      </button>
    </form>
  );
}

function PartnerCredentialsForm({
  partnerId,
  email,
}: {
  partnerId: string;
  email: string;
}) {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminUpdatePartnerCredentialsAction, undefined);
  const [newPassword, setNewPassword] = useState("");

  return (
    <form action={action} className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-semibold text-white/55">{t("credentialsTitle")}</p>
      <p className="text-[10px] text-white/40">{t("credentialsHint")}</p>
      <input type="hidden" name="partnerId" value={partnerId} />
      <label className="block">
        <span className="text-[10px] text-white/50">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
        />
      </label>
      <PasswordInput
        name="newPassword"
        label={t("newPassword")}
        autoComplete="new-password"
        className="block"
        value={newPassword}
        onChange={setNewPassword}
      />
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <p className="text-xs text-rose-300" role="alert">
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </p>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <p className="text-xs text-emerald-300">{t("credentialsSaved")}</p>
      ) : null}
      <button
        type="submit"
        className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold"
      >
        {t("updateCredentials")}
      </button>
    </form>
  );
}

function PartnerUplineForm({
  partnerId,
  pickerOptions,
  currentUplineId,
}: {
  partnerId: string;
  pickerOptions: PickerOption[];
  currentUplineId: string | null;
}) {
  const t = useTranslations("Growth.admin.partners");
  const [state, action] = useActionState(adminSetPartnerUplineAction, undefined);
  const [showWarn, setShowWarn] = useState(false);

  return (
    <form action={action} className="mt-3 space-y-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
      <p className="text-[10px] font-semibold text-amber-100/80">{t("uplineWarning")}</p>
      <input type="hidden" name="partnerId" value={partnerId} />
      <select
        name="parentUserId"
        defaultValue={currentUplineId ?? ""}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
      >
        <option value="">{t("uplineNone")}</option>
        {pickerOptions
          .filter((p) => p.userId !== partnerId)
          .map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.name}
            </option>
          ))}
      </select>
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <p className="text-xs text-rose-300" role="alert">
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </p>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <p className="text-xs text-emerald-300">{t("uplineSaved")}</p>
      ) : null}
      <button
        type="submit"
        className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold"
        onClick={() => setShowWarn(true)}
      >
        {showWarn ? t("uplineConfirm") : t("setUpline")}
      </button>
    </form>
  );
}

function PartnerDeleteForm({
  partnerId,
  email,
  directCount,
}: {
  partnerId: string;
  email: string;
  directCount: number;
}) {
  const t = useTranslations("Growth.admin.partners");
  const router = useRouter();
  const [state, action] = useActionState(adminDeletePartnerAction, undefined);
  const [confirm, setConfirm] = useState("");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (state && typeof state === "object" && "ok" in state && state.ok === true) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="mt-4 space-y-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3">
      <p className="text-[10px] font-semibold text-rose-100">{t("deleteTitle")}</p>
      <p className="text-[10px] text-white/45">{t("deleteHint")}</p>
      {directCount > 0 ? (
        <p className="text-[10px] text-amber-200/80">
          {t("deleteWarningReferrals", { n: directCount })}
        </p>
      ) : null}
      <input type="hidden" name="partnerId" value={partnerId} />
      <label className="block">
        <span className="text-[10px] text-white/50">{t("deleteConfirmLabel")}</span>
        <input
          name="confirmEmail"
          type="email"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("deleteConfirmPlaceholder")}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
          autoComplete="off"
        />
      </label>
      {state && typeof state === "object" && "ok" in state && state.ok === false ? (
        <p className="text-xs text-rose-300" role="alert">
          {createErrorText(t, String((state as { error?: string }).error ?? ""))}
        </p>
      ) : null}
      {state && typeof state === "object" && "ok" in state && state.ok === true ? (
        <p className="text-xs text-emerald-300">{t("deleteSuccess")}</p>
      ) : null}
      {!armed ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-200"
        >
          {t("deleteTitle")}
        </button>
      ) : (
        <button
          type="submit"
          disabled={confirm.trim().toLowerCase() !== email.toLowerCase()}
          className="rounded-lg border border-rose-500/50 bg-rose-600/20 px-3 py-1.5 text-xs font-bold text-rose-100 disabled:opacity-40"
        >
          {t("deleteSubmit")}
        </button>
      )}
    </form>
  );
}

export function PartnerList({
  partners,
  levels,
  pickerOptions,
}: {
  partners: PartnerRow[];
  levels: LevelOption[];
  pickerOptions: PickerOption[];
}) {
  const t = useTranslations("Growth.admin.partners");
  const [expandedTree, setExpandedTree] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) => {
      if (filter === "active" && !p.isActive) return false;
      if (filter === "inactive" && p.isActive) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [partners, query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-h-10 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold/40"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold"
                  : "rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:border-white/20"
              }
            >
              {key === "all" ? t("filterAll") : key === "active" ? t("filterActive") : t("filterInactive")}
            </button>
          ))}
        </div>
      </div>
    <ul className="divide-y divide-white/10">
      {filtered.length === 0 ? (
        <li className="px-5 py-10 text-center text-sm text-white/50">{t("empty")}</li>
      ) : (
        filtered.map((p) => (
          <li key={p.userId} className="px-4 py-5 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <GrowthAvatar name={p.name} email={p.email} size="lg" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 truncate text-base font-bold text-white">
                      <span className="truncate">{p.name}</span>
                      {p.isVerifiedOfficial ? (
                        <VerifiedBadge label={t("verifiedBadge")} variant="gold" />
                      ) : null}
                    </h3>
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
                <div className="mt-2 text-xs text-white/50">
                  <span className="font-semibold text-white/60">{t("networkColumn")}: </span>
                  {p.uplineName ? (
                    <>
                      {t("uplineLabel")}{" "}
                      {p.uplineSlug ? (
                        <a
                          href={`/${p.locale}/growth/profile/${p.uplineSlug}`}
                          className="text-gold hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {p.uplineName}
                        </a>
                      ) : (
                        p.uplineName
                      )}
                      {" · "}
                    </>
                  ) : (
                    <span>{t("uplineNone")} · </span>
                  )}
                  {t("networkCounts", { direct: p.directCount, total: p.totalCount })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminOpenChatLink partnerUserId={p.userId} />
                  {p.publicSlug ? (
                    <a
                      href={`/${p.locale}/growth/profile/${p.publicSlug}`}
                      className="inline-flex min-h-[var(--growth-touch-min)] items-center rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:border-gold/30 hover:text-white"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("viewProfile")}
                    </a>
                  ) : null}
                </div>
                <PartnerVerifiedForm
                  partnerId={p.userId}
                  isVerified={p.isVerifiedOfficial}
                  officialDisplayName={p.officialDisplayName}
                />
                <PartnerCredentialsForm partnerId={p.userId} email={p.email} />
                <PartnerUplineForm
                  partnerId={p.userId}
                  pickerOptions={pickerOptions}
                  currentUplineId={p.uplineUserId}
                />
                <button
                  type="button"
                  className="mt-2 text-[10px] font-bold text-gold hover:underline"
                  onClick={() =>
                    setExpandedTree((id) => (id === p.userId ? null : p.userId))
                  }
                >
                  {expandedTree === p.userId ? t("hideTree") : t("showTree")}
                </button>
                {expandedTree === p.userId ? (
                  <PartnerNetworkTree
                    tree={[]}
                    locale={p.locale}
                    compact
                    fetchUserId={p.userId}
                    className="mt-2"
                  />
                ) : null}
                <PartnerXpControls partnerId={p.userId} levels={levels} />
                <PartnerDeleteForm
                  partnerId={p.userId}
                  email={p.email}
                  directCount={p.directCount}
                />
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
    </div>
  );
}

export function PartnerStatsBar({ partners }: { partners: PartnerRow[] }) {
  const t = useTranslations("Growth.admin.partners");
  const active = partners.filter((p) => p.isActive).length;
  const inactive = partners.length - active;

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {[
        { label: t("statsTotal"), value: partners.length },
        { label: t("statsActive"), value: active },
        { label: t("statsInactive"), value: inactive },
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
