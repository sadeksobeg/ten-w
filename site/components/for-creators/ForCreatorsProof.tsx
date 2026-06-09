"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatedNumber } from "@/components/growth/ui/AnimatedNumber";

export type CreatorPreview = {
  name: string;
  submissions: number;
  cupRank: number | null;
  levelCode: string;
  referrals?: number;
};

type Props = {
  topCreators: CreatorPreview[];
  creatorCount: number;
  approvalRate: number;
};

function StatBlock({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="creator-card p-6 text-center">
      <p className="font-[family-name:var(--font-cairo)] text-4xl font-black text-[var(--creator-secondary)] sm:text-5xl">
        {visible ? (
          <>
            <AnimatedNumber value={value} format={(n) => String(Math.round(n))} />
            {suffix ?? ""}
          </>
        ) : (
          "0"
        )}
      </p>
      <p className="mt-2 text-sm text-white/60">{label}</p>
    </div>
  );
}

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * 17) % 360;
  return `hsl(${h}, 55%, 42%)`;
}

export function ForCreatorsProof({ topCreators, creatorCount, approvalRate }: Props) {
  const t = useTranslations("Creators.public.proofStats");
  const cards =
    topCreators.length > 0
      ? topCreators
      : [
          { name: t("archetypeName"), submissions: 12, cupRank: 3, levelCode: "CREATOR", referrals: 4 },
          { name: t("archetypeName2"), submissions: 8, cupRank: 5, levelCode: "HUNTER", referrals: 2 },
          { name: t("archetypeName3"), submissions: 5, cupRank: 8, levelCode: "STARTER", referrals: 1 },
        ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("title")}
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatBlock value={creatorCount} suffix="+" label={t("creators")} />
        <StatBlock value={approvalRate} suffix="%" label={t("approval")} />
        <StatBlock value={3} label={t("weeksToEarn")} />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <div key={i} className="creator-card flex items-start gap-3 p-5">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: avatarColor(c.name) }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 text-start">
              <p className="truncate font-bold">{c.name}</p>
              <p className="text-[11px] text-white/45">{t("archetypeRole")}</p>
              <p className="mt-2 text-xs text-white/55">
                {t("cardMeta", {
                  posts: c.submissions,
                  refs: c.referrals ?? 0,
                })}
              </p>
              {c.cupRank ? (
                <p className="mt-1 text-[10px] text-[var(--creator-secondary)]">
                  {t("rank", { rank: c.cupRank })}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
