"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { savePartnerOathFormAction } from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";

type Props = {
  open: boolean;
  defaultName: string;
  onComplete: () => void;
};

export function OathModal({ open, defaultName, onComplete }: Props) {
  const t = useTranslations("Growth.oath");
  const [step, setStep] = useState(0);
  const [typedName, setTypedName] = useState(defaultName);
  const [done, setDone] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setTypedName(defaultName);
      setDone(false);
    }
  }, [open, defaultName]);

  if (!open) return null;

  const oathLines = t("oathBody", { name: typedName || "…" }).split("\n");

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/90 p-4">
      {showParticles ? (
        <ParticleEffect className="pointer-events-none absolute inset-0" active />
      ) : null}
      <div className="relative max-w-md w-full rounded-3xl border border-gold/40 bg-gradient-to-b from-[#1a1408] to-[#0a0a0f] p-8 text-center shadow-[0_0_60px_-12px_rgba(228,184,77,0.5)]">
        {done ? (
          <>
            <p className="font-[family-name:var(--font-cairo)] text-xl font-bold text-gold">
              {t("complete")}
            </p>
            <p className="mt-2 text-sm text-white/70">{t("welcome")}</p>
          </>
        ) : step === 0 ? (
          <>
            <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-black text-gold">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm text-white/65">{t("prompt")}</p>
            <input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="mt-6 w-full rounded-xl border border-gold/30 bg-black/40 px-4 py-3 text-center text-lg font-bold text-white"
              aria-label={t("nameLabel")}
            />
            <GoldButton
              type="button"
              className="mt-6 w-full"
              onClick={() => typedName.trim().length >= 2 && setStep(1)}
            >
              {t("continue")}
            </GoldButton>
          </>
        ) : (
          <form
            action={async (fd) => {
              await savePartnerOathFormAction(fd);
              setDone(true);
              setShowParticles(true);
              window.setTimeout(() => onComplete(), 2200);
            }}
          >
            <input type="hidden" name="typedName" value={typedName} />
            <div className="space-y-2 font-[family-name:var(--font-cairo)] text-sm leading-relaxed text-white/90">
              {oathLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <GoldButton
              type="submit"
              className="mt-8 w-full motion-safe:animate-pulse motion-reduce:animate-none"
            >
              {t("swear")}
            </GoldButton>
          </form>
        )}
      </div>
    </div>
  );
}
