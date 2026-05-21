"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addLeadDealAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";

type Product = { id: string; name: string };

type Props = {
  products: Product[];
  referralCode: string;
};

export function AddLeadDealForm({ products, referralCode }: Props) {
  const t = useTranslations("Growth");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(addLeadDealAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("deals.toastLeadAdded") });
    else showToast({ type: "error", title: t("deals.errors.invalid_input") });
  }, [state, showToast, t]);

  return (
    <form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-white/55">{t("hero.addLead")}</div>
          <div className="mt-2 text-sm text-white/70">{t("hero.addLeadHint")}</div>
        </div>
        <div className="text-xs text-white/45">{t("networkRefWithCode", { code: referralCode })}</div>
      </div>
      <label className="sm:col-span-4">
        <span className="text-xs text-white/55">{t("lead.product")}</span>
        <select
          name="productId"
          required
          disabled={pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          defaultValue={products[0]?.id}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-4">
        <span className="text-xs text-white/55">{t("lead.client")}</span>
        <input
          name="clientLabel"
          disabled={pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          placeholder={t("lead.clientPh")}
        />
      </label>
      <label className="sm:col-span-4">
        <span className="text-xs text-white/55">{t("lead.notes")}</span>
        <input
          name="notes"
          disabled={pending}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          placeholder={t("lead.notesPh")}
        />
      </label>
      <div className="sm:col-span-12">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg shadow-[0_0_60px_-20px_rgba(201,160,97,0.75)] transition-transform hover:translate-y-[-1px] disabled:opacity-60 sm:w-auto"
        >
          + {t("hero.addLead")}
        </button>
      </div>
    </form>
  );
}
