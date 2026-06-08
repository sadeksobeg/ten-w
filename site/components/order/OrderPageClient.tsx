"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { LazyTurnstileField as TurnstileField } from "@/components/contact/LazyTurnstileField";
import {
  computeOrderPrice,
  featureLabel,
  type ProductFeatureOption,
} from "@/lib/growth/product-features";
import type { PublicProductDto } from "@/lib/growth/public-products";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Props = {
  products: PublicProductDto[];
};

function formatUsd(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const PRODUCT_ICONS: Record<string, string> = {
  website: "🌐",
  "automation-ai": "🤖",
  "mobile-app": "📱",
};

function OrderPageInner({ products }: Props) {
  const t = useTranslations("OrderPage");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const initialCode = searchParams.get("code") ?? "";
  const initialCreator = searchParams.get("creator") ?? "";

  const [step, setStep] = useState<"packages" | "configure" | "form" | "done">("packages");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null,
  );
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState(initialCode);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountBps, setDiscountBps] = useState(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    company: "",
    notes: "",
  });

  useEffect(() => {
    if (initialCode) {
      void validateDiscountOnMount(initialCode);
    } else if (initialCreator) {
      void resolveCreatorOnMount(initialCreator);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validateDiscountOnMount(code: string) {
    try {
      const res = await fetch(`/api/order/validate-code?code=${encodeURIComponent(code)}`);
      const data = (await res.json()) as { ok: boolean; discountBps?: number };
      if (data.ok) {
        setDiscountApplied(true);
        setDiscountBps(data.discountBps ?? 300);
      }
    } catch {
      /* ignore */
    }
  }

  async function resolveCreatorOnMount(slug: string) {
    try {
      const res = await fetch(`/api/order/resolve-creator?slug=${encodeURIComponent(slug)}`);
      const data = (await res.json()) as {
        ok: boolean;
        code?: string;
        discountBps?: number;
      };
      if (data.ok && data.code) {
        setDiscountCode(data.code);
        setDiscountApplied(true);
        setDiscountBps(data.discountBps ?? 300);
      }
    } catch {
      /* ignore */
    }
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;

  const pricing = useMemo(() => {
    if (!selectedProduct) return null;
    return computeOrderPrice({
      basePriceCents: selectedProduct.priceCents,
      selectedFeatureIds,
      features: selectedProduct.features,
      discountBps: discountApplied ? discountBps : 0,
    });
  }, [selectedProduct, selectedFeatureIds, discountApplied, discountBps]);

  function toggleFeature(id: string) {
    setSelectedFeatureIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function validateDiscount() {
    const code = discountCode.trim();
    if (!code) {
      setDiscountApplied(false);
      setDiscountBps(0);
      setDiscountError(null);
      return;
    }
    setDiscountError(null);
    try {
      const res = await fetch(`/api/order/validate-code?code=${encodeURIComponent(code)}`);
      const data = (await res.json()) as {
        ok: boolean;
        discountBps?: number;
        creatorName?: string;
        error?: string;
      };
      if (!data.ok) {
        setDiscountApplied(false);
        setDiscountBps(0);
        setDiscountError(t("discount.invalid"));
        return;
      }
      setDiscountApplied(true);
      setDiscountBps(data.discountBps ?? 300);
      setDiscountError(null);
    } catch {
      setDiscountError(t("discount.error"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !pricing) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          productId: selectedProduct.id,
          selectedFeatureIds,
          discountCode: discountApplied ? discountCode.trim() : undefined,
          creatorSlug: initialCreator || undefined,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone || undefined,
          company: form.company || undefined,
          notes: form.notes || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = (await res.json()) as { ok: boolean; orderId?: string; error?: string };
      if (!data.ok) {
        setSubmitError(t(`errors.${data.error ?? "generic"}`));
        return;
      }
      setOrderId(data.orderId ?? null);
      setStep("done");
    } catch {
      setSubmitError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg text-center"
      >
        <GlassCard className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-emerald-500/10 p-10">
          <div className="pointer-events-none absolute -top-16 end-0 h-32 w-32 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/60 bg-gold/15 text-2xl">
              ✓
            </div>
            <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
              {t("success.title")}
            </h2>
            <p className="mt-3 text-sm text-white/60">{t("success.body")}</p>
            {orderId ? (
              <p className="mt-4 font-mono text-xs text-gold">{t("success.ref", { id: orderId.slice(-8).toUpperCase() })}</p>
            ) : null}
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">{t("eyebrow")}</p>
        <h1 className="mt-2 font-[family-name:var(--font-cairo)] text-3xl font-extrabold text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/55">{t("subtitle")}</p>
      </div>

      {step === "packages" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const selected = product.id === selectedProductId;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setSelectedProductId(product.id);
                  setSelectedFeatureIds([]);
                }}
                className="text-start"
              >
                <GlassCard
                  className={`h-full border p-5 transition ${
                    selected
                      ? "border-gold/50 bg-gold/10 shadow-[0_0_40px_rgba(201,160,97,0.15)]"
                      : "border-white/10 bg-white/[0.03] hover:border-gold/30"
                  }`}
                >
                  <span className="text-2xl">{PRODUCT_ICONS[product.slug] ?? "✦"}</span>
                  <h3 className="mt-3 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{product.description}</p>
                  <p className="mt-4 text-2xl font-black text-gold">
                    {formatUsd(product.priceCents, locale)}
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">{t("startsFrom")}</p>
                </GlassCard>
              </button>
            );
          })}
        </motion.div>
      ) : null}

      {step !== "packages" && selectedProduct ? (
        <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gold/70">{t("selectedPackage")}</p>
              <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold text-white">
                {selectedProduct.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep("packages")}
              className="text-xs font-semibold text-gold hover:underline"
            >
              {t("changePackage")}
            </button>
          </div>
        </GlassCard>
      ) : null}

      {(step === "configure" || step === "form") && selectedProduct ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {step === "configure" ? (
              <GlassCard className="border border-white/10 p-5 sm:p-6">
                <h3 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                  {t("features.title")}
                </h3>
                <p className="mt-1 text-xs text-white/50">{t("features.subtitle")}</p>
                <ul className="mt-4 space-y-2">
                  {selectedProduct.features.map((f: ProductFeatureOption) => {
                    const checked = selectedFeatureIds.includes(f.id);
                    return (
                      <li key={f.id}>
                        <label
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                            checked
                              ? "border-gold/40 bg-gold/10"
                              : "border-white/10 bg-black/20 hover:border-white/20"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFeature(f.id)}
                              className="size-4 accent-[#c9a061]"
                            />
                            <span className="text-sm font-semibold text-white">
                              {featureLabel(f, locale)}
                            </span>
                          </span>
                          <span className="text-xs font-bold text-gold">
                            +{formatUsd(f.priceDeltaCents, locale)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            ) : null}

            {step === "form" ? (
              <GlassCard className="border border-white/10 p-5 sm:p-6">
                <h3 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                  {t("form.title")}
                </h3>
                <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="text-xs text-white/55">{t("form.name")}</span>
                    <input
                      required
                      value={form.clientName}
                      onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                    />
                  </label>
                  <label>
                    <span className="text-xs text-white/55">{t("form.email")}</span>
                    <input
                      required
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                    />
                  </label>
                  <label>
                    <span className="text-xs text-white/55">{t("form.phone")}</span>
                    <input
                      value={form.clientPhone}
                      onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="text-xs text-white/55">{t("form.company")}</span>
                    <input
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="text-xs text-white/55">{t("form.notes")}</span>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
                    />
                  </label>
                  {TURNSTILE_SITE_KEY ? (
                    <div className="sm:col-span-2">
                      <TurnstileField
                        siteKey={TURNSTILE_SITE_KEY}
                        onToken={setTurnstileToken}
                      />
                    </div>
                  ) : null}
                  {submitError ? (
                    <p className="sm:col-span-2 text-xs text-rose-300">{submitError}</p>
                  ) : null}
                  <div className="sm:col-span-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("configure")}
                      className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
                    >
                      {t("back")}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-gradient-to-r from-gold/90 to-gold/60 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-50"
                    >
                      {submitting ? t("form.submitting") : t("form.submit")}
                    </button>
                  </div>
                </form>
              </GlassCard>
            ) : null}
          </div>

          <div className="space-y-4">
            <GlassCard className="sticky top-4 border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gold">{t("summary.title")}</h3>
              {pricing ? (
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <dt>{t("summary.base")}</dt>
                    <dd>{formatUsd(selectedProduct.priceCents, locale)}</dd>
                  </div>
                  {pricing.selectedFeatures.map((f) => (
                    <div key={f.id} className="flex justify-between text-white/55">
                      <dt className="max-w-[60%] truncate">{featureLabel(f, locale)}</dt>
                      <dd>+{formatUsd(f.priceDeltaCents, locale)}</dd>
                    </div>
                  ))}
                  {discountApplied ? (
                    <div className="flex justify-between text-emerald-300">
                      <dt>{t("summary.discount", { pct: discountBps / 100 })}</dt>
                      <dd>-{formatUsd(pricing.discountCents, locale)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold text-gold">
                    <dt>{t("summary.total")}</dt>
                    <dd>{formatUsd(pricing.finalPriceCents, locale)}</dd>
                  </div>
                </dl>
              ) : null}
              <p className="mt-3 text-[10px] text-white/40">{t("summary.disclaimer")}</p>

              <div className="mt-4 border-t border-white/10 pt-4">
                <label className="text-xs text-white/55">{t("discount.label")}</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder={t("discount.placeholder")}
                    className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm uppercase text-white outline-none focus:border-gold/40"
                  />
                  <button
                    type="button"
                    onClick={() => void validateDiscount()}
                    className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-gold"
                  >
                    {t("discount.apply")}
                  </button>
                </div>
                {discountError ? (
                  <p className="mt-1 text-[10px] text-rose-300">{discountError}</p>
                ) : discountApplied ? (
                  <p className="mt-1 text-[10px] text-emerald-300">{t("discount.applied")}</p>
                ) : null}
              </div>

              {step === "configure" ? (
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-gold/90 to-gold/60 py-3 text-sm font-extrabold text-black"
                >
                  {t("continue")}
                </button>
              ) : null}
            </GlassCard>
          </div>
        </div>
      ) : null}

      {step === "packages" && selectedProduct ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              if (initialCode) void validateDiscount();
              setStep("configure");
            }}
            className="rounded-xl bg-gradient-to-r from-gold/90 to-gold/60 px-8 py-3 text-sm font-extrabold text-black"
          >
            {t("continue")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function OrderPageClient(props: Props) {
  return (
    <Suspense fallback={<div className="text-center text-white/50">…</div>}>
      <OrderPageInner {...props} />
    </Suspense>
  );
}
