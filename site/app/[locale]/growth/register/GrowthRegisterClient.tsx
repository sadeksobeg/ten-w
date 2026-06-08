"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { registerPartnerAction } from "@/lib/growth/actions";
import { RegisterReferralField } from "@/components/growth/RegisterReferralField";
import { PasswordInput } from "@/components/growth/ui/PasswordInput";

function registerErrorText(t: (key: string) => string, code: string) {
  switch (code) {
    case "registration_closed":
      return t("errors.registration_closed");
    case "invalid_input":
      return t("errors.invalid_input");
    case "email_taken":
      return t("errors.email_taken");
    case "invalid_referral":
      return t("errors.invalid_referral");
    case "missing_seed":
      return t("errors.missing_seed");
    default:
      return t("errors.unknown");
  }
}

type Props = {
  inviteSlug?: string | null;
  defaultName?: string;
  isCreatorInvite?: boolean;
};

export function GrowthRegisterClient({
  inviteSlug,
  defaultName = "",
  isCreatorInvite = false,
}: Props) {
  const t = useTranslations("Growth.auth");
  const router = useRouter();
  const [state, formAction] = useActionState(registerPartnerAction, undefined);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state && typeof state === "object" && "ok" in state && state.ok === true) {
      if ("isCreator" in state && state.isCreator) {
        router.push("/growth/creators?welcome=1");
        router.refresh();
        return;
      }
      const q = new URLSearchParams({ registered: "1" });
      if ("email" in state && typeof state.email === "string") {
        q.set("email", state.email);
      }
      router.push(`/growth/sign-in?${q.toString()}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-lg">
      <GlassCard className="p-4 sm:p-8">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm text-white/60">{t("registerIntro")}</p>

        {inviteSlug ? (
          <div className="mt-4 rounded-xl border border-gold/25 bg-gold/10 px-4 py-4">
            <p className="text-xs font-semibold text-gold/95">{t("inviteRegisterBanner")}</p>
            {isCreatorInvite ? (
              <div className="mt-3 flex items-center gap-2">
                <BadgeIcon badgeKey="content_creator" earned size="sm" showGlow />
                <p className="text-[11px] text-gold/80">{t("inviteCreatorBadge")}</p>
              </div>
            ) : null}
            <p className="mt-2 text-[11px] text-white/50">{t("inviteRegisterHint")}</p>
          </div>
        ) : null}

        <form action={formAction} className="mt-8 space-y-4">
          {inviteSlug ? <input type="hidden" name="inviteSlug" value={inviteSlug} /> : null}
          <label className="block">
            <span className="text-xs text-white/55">{t("name")}</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              name="name"
              defaultValue={defaultName}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("email")}</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
              name="email"
              type="email"
              required
            />
          </label>
          <PasswordInput
            name="password"
            label={t("password")}
            required
            minLength={8}
            value={password}
            onChange={setPassword}
          />
          <Suspense fallback={null}>
            <RegisterReferralField
              label={t("referral")}
              readOnly={Boolean(inviteSlug)}
            />
          </Suspense>

          {state && typeof state === "object" && "ok" in state && state.ok === false ? (
            <div className="text-sm text-red-300" role="alert">
              {registerErrorText(t, String((state as { error?: string }).error ?? ""))}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg"
          >
            {t("create")}
          </button>
        </form>

        <div className="mt-6 text-sm text-white/65">
          <Link href="/growth/sign-in" className="text-gold hover:text-gold-bright">
            {t("switchToSignIn")}
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
