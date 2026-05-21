"use client";

import { useActionState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { requestPayoutAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import type { PartnerWallet } from "@/lib/growth/get-dashboard";

type Props = {
  wallet: PartnerWallet;
};

export function PayoutRequestForm({ wallet }: Props) {
  const t = useTranslations("Growth.earnings");
  const locale = useLocale();
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(requestPayoutAction, null);
  const disabled = wallet.availableCents <= 0;

  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({ type: "success", title: t("toastPayoutSent") });
    } else if (state.error === "insufficient_balance") {
      showToast({ type: "error", title: t("errors.insufficient_balance") });
    } else if (state.error) {
      showToast({ type: "error", title: t("errors.invalid_input") });
    }
  }, [state, showToast, t]);

  const maxUsd = Math.floor(wallet.availableCents / 100);

  return (
    <form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-12 rounded-xl border border-gold/25 bg-gold/5 p-4">
        <div className="text-xs font-semibold text-white/55">{t("wallet.availableLabel")}</div>
        <div className="mt-1 text-2xl font-extrabold text-gold">{fmt(wallet.availableCents)}</div>
        <div className="mt-2 text-xs text-white/45">
          {t("wallet.pendingLine", { amount: fmt(wallet.pendingCents) })} ·{" "}
          {t("wallet.paidLine", { amount: fmt(wallet.paidOutCents) })}
        </div>
      </div>
      <label className="sm:col-span-4">
        <span className="text-xs text-white/55">{t("withdrawAmount")}</span>
        <input
          name="amountUsd"
          type="number"
          min={10}
          max={Math.max(10, maxUsd)}
          disabled={disabled || pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40 disabled:opacity-50"
          placeholder="250"
          required
        />
      </label>
      <label className="sm:col-span-5">
        <span className="text-xs text-white/55">{t("method")}</span>
        <input
          name="method"
          disabled={disabled || pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40 disabled:opacity-50"
          placeholder={t("methodPh")}
        />
      </label>
      <div className="flex items-end sm:col-span-3">
        <button
          type="submit"
          disabled={disabled || pending}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:border-gold/35 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("request")}
        </button>
      </div>
      {disabled ? (
        <p className="sm:col-span-12 text-xs text-amber-200/80">{t("wallet.noAvailable")}</p>
      ) : null}
    </form>
  );
}
