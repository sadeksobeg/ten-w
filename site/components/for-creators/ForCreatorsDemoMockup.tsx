"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = { locale: string };

const FRAMES = ["ai", "cyber", "software", "ascend", "services"] as const;

function FrameContent({ frame }: { frame: (typeof FRAMES)[number] }) {
  if (frame === "ai") {
    return (
      <div className="flex h-full flex-col justify-center bg-[#050208] p-6">
        <p className="font-mono text-[10px] tracking-[0.28em] text-violet-300/80">AI SYSTEMS</p>
        <p className="mt-3 text-lg font-black text-white">ذكاء اصطناعي للمؤسسات</p>
        <div className="mt-6 space-y-2">
          {[82, 64, 91].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/10">
              <div
                className="fc-service-bar h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (frame === "cyber") {
    return (
      <div className="relative h-full bg-gradient-to-b from-[#060a14] to-[#0a1020] p-5">
        <div className="fc-service-grid absolute inset-0 opacity-30" aria-hidden />
        <p className="relative mt-6 text-[10px] font-mono text-emerald-300/80">CYBER DEFENSE</p>
        <p className="relative mt-2 text-base font-bold text-white">أمن سيبراني متكامل</p>
        <div className="relative mt-8 grid grid-cols-3 gap-2">
          {["SOC", "EDR", "IAM"].map((label) => (
            <div key={label} className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-3 text-center text-[9px] font-bold text-emerald-100">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (frame === "software") {
    return (
      <div className="grid h-full grid-cols-2 gap-2 bg-[#0c0818] p-4">
        {["منصات", "تطبيقات", "تكامل", "سحابة"].map((label, i) => (
          <div key={label} className="fc-service-card rounded-lg border border-white/10 bg-black/30 p-3" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-[10px] text-white/45">{label}</p>
            <p className="mt-1 text-lg font-black text-[var(--creator-secondary)]">
              {["12+", "48", "API", "99.9%"][i]}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (frame === "services") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#080510] p-6 text-center">
        <div className="fc-service-orbit relative size-24 rounded-full border border-amber-500/30">
          <span className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/10" />
        </div>
        <p className="mt-4 text-sm font-bold text-white">خدمات الشركة</p>
        <p className="mt-1 text-[10px] text-white/45">T.E.N.E.G.T.A Enterprise Stack</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-end bg-[#0a0612] p-4">
      <div className="mb-2 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="fc-service-bar flex-1 rounded-t bg-gradient-to-t from-rose-600/60 to-amber-400/40"
            style={{ height: `${h}%`, maxHeight: "4rem", animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <p className="text-[10px] text-white/50">ASCEND · Creator Hub</p>
    </div>
  );
}

export function ForCreatorsDemoMockup({ locale }: Props) {
  const t = useTranslations("Creators.public.demo");

  return (
    <section id="demo" className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/60">{t("subtitle")}</p>

      <div className="fc-demo-browser mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0a0614] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-500/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-500/80" />
          <span className="ms-2 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-white/35">
            tenegta.com/solutions/intelligent-systems
          </span>
        </div>
        <div className="relative aspect-[16/10] bg-black">
          {FRAMES.map((f) => (
            <div key={f} className="fc-mockup-frame">
              <FrameContent frame={f} />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-white/55">{t("below")}</p>
      <div className="mt-4 flex justify-center">
        <Link href={`/${locale}/solutions/intelligent-systems`}>
          <GoldButton type="button">{t("cta")}</GoldButton>
        </Link>
      </div>
    </section>
  );
}
