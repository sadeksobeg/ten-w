"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";

const FEATURE_KEYS = ["hub", "chat", "challenge", "cup", "kit", "earn"] as const;
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

type CreatorPreview = {
  name: string;
  submissions: number;
  cupRank: number | null;
  levelCode: string;
};

type Props = {
  locale: string;
  topCreators: CreatorPreview[];
};

export function ForCreatorsLanding({ locale, topCreators }: Props) {
  const t = useTranslations("Creators.public");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/creator-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        mainPlatformUrl: fd.get("url"),
        platform: fd.get("platform"),
        contentTypes: fd.getAll("types"),
        followersRange: fd.get("followers"),
      }),
    });
    setPending(false);
    if (res.ok) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#03010A] text-white">
      <section className="relative flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-20 end-0 h-96 w-96 rounded-full bg-[var(--creator-primary)]/20 blur-[120px]" />
          <div className="absolute bottom-0 start-0 h-80 w-80 rounded-full bg-[var(--creator-secondary)]/15 blur-[100px]" />
        </div>
        <p className="relative font-mono text-xs tracking-[0.3em] text-[var(--creator-secondary)]/60">T.E.N.E.G.T.A · Creator Network</p>
        <h1 className="relative mt-6 font-[family-name:var(--font-cairo)] text-4xl font-black sm:text-6xl lg:text-7xl">
          {t("hero.title1")}
          <br />
          <span className="bg-gradient-to-r from-[var(--creator-secondary)] to-[var(--creator-primary)] bg-clip-text text-transparent">
            {t("hero.title2")}
          </span>
        </h1>
        <p className="relative mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">{t("hero.subtitle")}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a href="#apply"><GoldButton type="button">{t("hero.cta")}</GoldButton></a>
          <a href="#how" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/75">{t("hero.secondary")}</a>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{topCreators.length > 0 ? t("proofTitle") : t("proofFallback")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(topCreators.length > 0 ? topCreators : [{ name: t("archetype1"), submissions: 0, cupRank: null, levelCode: "CREATOR" }]).map((c, i) => (
            <div key={i} className="creator-card p-5 text-center">
              <p className="font-bold">{c.name}</p>
              <p className="mt-2 text-xs text-white/50">{c.submissions} {t("posts")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("featuresTitle")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((key) => (
            <div key={key} className="creator-card p-5">
              <h3 className="font-bold text-[var(--creator-secondary)]">{t(`features.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-white/60">{t(`features.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("demoTitle")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">{t("demoBody")}</p>
        <Link href={`/${locale}/demo/cinema`} className="mt-6 inline-block">
          <GoldButton type="button">{t("demoCta")}</GoldButton>
        </Link>
      </section>

      <section id="how" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("howTitle")}</h2>
        <ol className="mt-10 space-y-8">
          {["step1", "step2", "step3", "step4"].map((key, i) => (
            <li key={key} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--creator-secondary)]/40 font-black text-[var(--creator-secondary)]">{i + 1}</span>
              <div>
                <h3 className="font-bold">{t(`${key}.title`)}</h3>
                <p className="mt-1 text-sm text-white/60">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("faqTitle")}</h2>
        <ul className="mt-8 space-y-3">
          {FAQ_KEYS.map((key) => (
            <li key={key} className="creator-card overflow-hidden">
              <details className="group">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  {t(`faq.${key}`)}
                </summary>
                <p className="border-t border-white/10 px-5 py-3 text-sm text-white/60">{t(`faq.a${key.slice(1)}`)}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold">{t("finalCta.title")}</h2>
        <p className="mx-auto mt-3 max-w-md text-white/60">{t("finalCta.body")}</p>
        <a href="#apply" className="mt-6 inline-block">
          <GoldButton type="button">{t("finalCta.cta")}</GoldButton>
        </a>
      </section>

      <section id="apply" className="mx-auto max-w-lg px-4 py-20">
        <div className="creator-card p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold">{t("apply.title")}</h2>
          {submitted ? (
            <p className="mt-4 text-emerald-200">{t("apply.success")}</p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <input name="name" required placeholder={t("apply.name")} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm" />
              <input name="email" type="email" required placeholder={t("apply.email")} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm" />
              <select name="platform" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
              </select>
              <input name="url" type="url" required placeholder={t("apply.url")} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm" />
              <select name="followers" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                <option value="under1k">{t("apply.followers.under1k")}</option>
                <option value="1k-10k">1K–10K</option>
                <option value="10k-100k">10K–100K</option>
                <option value="100k+">100K+</option>
              </select>
              <GoldButton type="submit" className="w-full" disabled={pending}>{t("apply.submit")}</GoldButton>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <Link href={`/${locale}/growth/sign-in`} className="text-[var(--creator-secondary)] hover:underline">ASCEND</Link>
      </footer>
    </div>
  );
}
