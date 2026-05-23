"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { addLeadDealAction } from "@/lib/growth/actions";
import { GAME_CONFIG } from "@/lib/growth/game-config";
import { useToast } from "@/hooks/useToast";
import { IconCheck, IconChevronDown, IconPlus } from "@/components/growth/icons/GrowthIcons";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  commissionBaseCents: number;
};

type Props = {
  products: Product[];
  referralCode: string;
};

export function AddLeadDealForm({ products, referralCode }: Props) {
  const t = useTranslations("Growth");
  const locale = useLocale();
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(addLeadDealAction, null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(products[0] ?? null);
  const rootRef = useRef<HTMLDivElement>(null);

  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = (cents: number) =>
    new Intl.NumberFormat(nf, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("deals.toastLeadAdded") });
    else showToast({ type: "error", title: t("deals.errors.invalid_input") });
  }, [state, showToast, t]);

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [isOpen]);

  useEffect(() => {
    if (products.length && !selected) {
      setSelected(products[0]!);
    }
  }, [products, selected]);

  return (
    <form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-12">
      <div className="sm:col-span-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-white/55">{t("hero.addLead")}</div>
          <div className="mt-2 text-sm text-white/70">{t("hero.addLeadHint")}</div>
        </div>
        <div className="text-xs text-white/45">{t("networkRefWithCode", { code: referralCode })}</div>
      </div>

      <div className="relative sm:col-span-4" ref={rootRef}>
        <span className="text-xs text-white/55">{t("lead.product")}</span>
        <button
          type="button"
          disabled={pending || products.length === 0}
          onClick={() => setIsOpen((v) => !v)}
          className={`mt-2 flex w-full items-center justify-between gap-2 rounded-xl border bg-black/30 px-3 py-3 text-start text-sm text-white outline-none transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
            isOpen ? "border-gold/50 ring-1 ring-gold/30" : "border-white/10 hover:border-gold/30"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="min-w-0 truncate">
            {selected ? (
              <>
                <span className="font-semibold">{selected.name}</span>
                <span className="mt-0.5 block text-[11px] text-white/50">
                  {fmt(selected.priceCents)} · {t("lead.commission")}: {fmt(selected.commissionBaseCents)}
                </span>
              </>
            ) : (
              <span className="text-white/50">{t("lead.product")}</span>
            )}
          </span>
          <IconChevronDown
            size={18}
            className={`shrink-0 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <input type="hidden" name="productId" value={selected?.id ?? ""} required />
        {isOpen && products.length > 0 ? (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-[200px] w-full overflow-y-auto rounded-xl border border-gold/30 bg-[var(--growth-surface-2)] py-1 shadow-xl"
          >
            {products.map((p) => {
              const active = selected?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-start gap-2 px-3 py-2.5 text-start transition hover:bg-gold/10 ${
                      active ? "bg-gold/10" : ""
                    }`}
                    onClick={() => {
                      setSelected(p);
                      setIsOpen(false);
                    }}
                  >
                    {active ? (
                      <IconCheck size={14} className="mt-0.5 shrink-0 text-gold" />
                    ) : (
                      <span className="mt-1.5 size-3.5 shrink-0 rounded-full border border-white/20" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{p.name}</span>
                      <span className="block text-[11px] text-white/50">
                        {fmt(p.priceCents)} · {t("lead.commission")}: {fmt(p.commissionBaseCents)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

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
      {selected ? (
        <p className="sm:col-span-12 text-xs text-white/50">
          {t("lead.estimate", {
            commission: fmt(selected.commissionBaseCents),
            xp: GAME_CONFIG.dealCloseXpEstimate,
          })}
        </p>
      ) : null}
      <div className="sm:col-span-12">
        <button
          type="submit"
          disabled={pending || !selected}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-4 text-sm font-extrabold text-bg shadow-[0_0_60px_-20px_rgba(201,160,97,0.75)] transition-transform hover:-translate-y-px disabled:opacity-60 sm:w-auto"
        >
          <IconPlus size={18} />
          {t("hero.addLead")}
        </button>
      </div>
    </form>
  );
}
