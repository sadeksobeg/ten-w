import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ASCEND_PRODUCT_NAME } from "@/lib/growth/brand";
import {
  IconBadge,
  IconDeals,
  IconLevel,
  IconNetwork,
  IconRank,
  IconStreak,
  IconXp,
} from "@/components/growth/icons/GrowthIcons";

const FEATURE_ICONS = [IconXp, IconLevel, IconRank, IconDeals, IconNetwork, IconBadge] as const;

export async function AscendLanding() {
  const t = await getTranslations("Ascend");
  const features = ["xp", "levels", "leaderboard", "deals", "network", "badges"] as const;
  const steps = ["join", "perform", "ascend"] as const;
  const stats = ["partners", "deals", "levels", "uptime"] as const;

  return (
    <div className="relative overflow-hidden">
      <section className="relative border-b border-white/10 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_0%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(700px_circle_at_85%_15%,rgba(201,160,97,0.2),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold/80">{t("hero.eyebrow")}</p>
          <h1 className="mt-4 font-[family-name:var(--font-cairo)] text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-white/95">T.E.N.E.G.T.A</span>
            <span className="mt-1 block bg-gradient-to-r from-gold via-[#E4B84D] to-gold-bright bg-clip-text text-transparent">ASCEND</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-white/90 md:text-xl">{t("hero.tagline")}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">{t("hero.subtagline")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedLink href="/growth/sign-in" eventName="ascend_cta_sign_in" className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-7 py-3 text-sm font-bold text-bg transition hover:bg-gold-bright">{t("hero.ctaPrimary")}</TrackedLink>
            <Link href="/creators/studio" className="inline-flex min-h-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 px-7 py-3 text-sm font-bold text-gold transition hover:border-gold/60 hover:bg-gold/15">{t("hero.ctaStudio")}</Link>
            <Link href="/growth/sign-in" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-gold/40">{t("hero.ctaSecondary")}</Link>
          </div>
          <p className="mt-4 text-xs text-white/40">{t("hero.note")}</p>
        </div>
      </section>
      <section className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gold/70">{t("preview.label")}</p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">{t("preview.title")}</h2>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-gold/25 bg-[#0A0A0F] p-1 shadow-[0_0_80px_-20px_rgba(201,160,97,0.35)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-rose-400/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-emerald-400/80" />
              <span className="ms-2 text-[10px] font-semibold text-white/40">{ASCEND_PRODUCT_NAME}</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
              {[{ label: t("preview.statXp"), value: "12,480", accent: "text-purple-300" }, { label: t("preview.statRank"), value: "#3", accent: "text-gold" }, { label: t("preview.statStreak"), value: "21d", accent: "text-emerald-300" }].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-center">
                  <div className={`text-2xl font-extrabold ${s.accent}`}>{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-white/45">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gold"><IconStreak size={16} />{t("preview.missionTitle")}</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-gold/80 to-gold" /></div>
                <p className="mt-2 text-[11px] text-white/55">{t("preview.missionHint")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white/70"><IconRank size={16} />{t("preview.leaderboardTitle")}</div>
                <ul className="mt-3 space-y-2 text-xs text-white/60">{[1,2,3].map((n) => (<li key={n} className="flex justify-between rounded-lg bg-black/25 px-3 py-2"><span>#{n} Partner</span><span className="text-gold/90">{1200-n*120} pts</span></li>))}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-white/10 bg-white/[0.02] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((key) => (<div key={key} className="text-center"><div className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">{t(`stats.${key}.value`)}</div><div className="mt-1 text-xs text-muted">{t(`stats.${key}.label`)}</div></div>))}
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">{t("features.title")}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t("features.subtitle")}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((key, i) => { const Icon = FEATURE_ICONS[i]!; return (<article key={key} className="group rounded-2xl border border-white/10 bg-surface/40 p-6 transition hover:border-gold/35"><div className="flex size-11 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold"><Icon size={22} /></div><h3 className="mt-4 font-semibold text-foreground">{t(`features.${key}.title`)}</h3><p className="mt-2 text-sm text-muted">{t(`features.${key}.body`)}</p></article>); })}
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-white/[0.02] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">{t("steps.title")}</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">{steps.map((key, idx) => (<li key={key} className="text-center md:text-start"><span className="inline-flex size-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-black text-gold">{idx+1}</span><h3 className="mt-4 text-lg font-bold">{t(`steps.${key}.title`)}</h3><p className="mt-2 text-sm text-muted">{t(`steps.${key}.body`)}</p></li>))}</ol>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-purple-500/10 p-8 text-center sm:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/80">{t("positioning.eyebrow")}</p>
          <blockquote className="mt-4 font-[family-name:var(--font-cairo)] text-xl font-extrabold leading-snug text-white sm:text-2xl">{t("positioning.quote")}</blockquote>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">{t("positioning.body")}</p>
        </div>
      </section>
      <section className="border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">{t("cta.title")}</h2>
          <p className="mt-3 text-muted">{t("cta.body")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink href="/growth/sign-in" eventName="ascend_cta_bottom_sign_in" className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-bold text-bg hover:bg-gold-bright">{t("cta.primary")}</TrackedLink>
            <TrackedLink href="/contact?topic=ascend" eventName="ascend_cta_contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-8 py-3 text-sm font-semibold text-white/80 hover:border-gold/40">{t("cta.secondary")}</TrackedLink>
          </div>
        </div>
      </section>
    </div>
  );
}
