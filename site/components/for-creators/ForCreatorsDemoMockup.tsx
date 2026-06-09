"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = { locale: string };

const FRAMES = ["cinema", "hall", "dashboard", "ticket", "ascend"] as const;

function FrameContent({ frame }: { frame: (typeof FRAMES)[number] }) {
  if (frame === "cinema") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#050208] p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-rose-400/80">SALAMIYA CINEMA</p>
        <p className="mt-4 text-lg font-black text-white">Cinema OS</p>
        <div className="mt-6 w-48 space-y-2">
          {[72, 45, 88].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (frame === "hall") {
    return (
      <div className="relative h-full bg-gradient-to-b from-[#0a0614] to-[#120a1e] p-4">
        <div className="mx-auto mt-8 h-16 w-3/4 rounded bg-gradient-to-b from-amber-200/30 to-transparent" />
        <div className="mt-6 grid grid-cols-6 gap-1 px-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-sm bg-violet-900/40 border border-white/5" />
          ))}
        </div>
      </div>
    );
  }
  if (frame === "dashboard") {
    return (
      <div className="grid h-full grid-cols-2 gap-2 bg-[#0c0818] p-4">
        {["1.2K", "89%", "340", "12"].map((n, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-lg font-black text-[var(--creator-secondary)]">{n}</p>
            <div className="mt-2 h-1 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }
  if (frame === "ticket") {
    return (
      <div className="flex h-full items-center justify-center bg-[#080510] p-6">
        <div className="w-48 rotate-[-4deg] rounded-xl border-2 border-dashed border-amber-500/40 bg-gradient-to-br from-rose-950/80 to-violet-950/60 p-4">
          <p className="text-[10px] font-mono text-amber-300/80">VIP · ROW A</p>
          <p className="mt-2 text-sm font-bold">Cinema Night</p>
          <p className="mt-4 text-[9px] text-white/40">T.E.N.E.G.T.A</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-end bg-[#0a0612] p-4">
      <div className="mb-2 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-rose-600/60 to-amber-400/40"
            style={{ height: `${h}%`, maxHeight: "4rem" }}
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

      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0a0614] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-500/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-500/80" />
          <span className="ms-2 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-white/35">
            tenegta.com/demo/cinema
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
        <Link href={`/${locale}/demo/cinema`}>
          <GoldButton type="button">{t("cta")}</GoldButton>
        </Link>
      </div>
    </section>
  );
}
