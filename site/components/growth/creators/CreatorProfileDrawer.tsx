"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconClose } from "@/components/growth/icons/GrowthIcons";
import type { CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";

type Props = {
  creator: CreatorFeaturedCreator | null;
  totalSubmissions?: number;
  onClose: () => void;
  onChallenge?: (creator: CreatorFeaturedCreator) => void;
};

export function CreatorProfileDrawer({
  creator,
  totalSubmissions = 0,
  onClose,
  onChallenge,
}: Props) {
  const t = useTranslations("Growth.creators.drawer");
  const tStatus = useTranslations("Growth.creators.status");

  useEffect(() => {
    if (!creator) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [creator, onClose]);

  if (!creator) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label={t("close")}
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col border-s border-white/10 bg-[#0a0612]/95 p-5 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal
        aria-labelledby="creator-drawer-title"
      >
        <div className="flex items-start justify-between gap-3">
          <GrowthAvatar
            name={creator.name}
            email={creator.userId}
            avatarUrl={creator.avatarUrl}
            size="lg"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white"
            aria-label={t("close")}
          >
            <IconClose size={18} />
          </button>
        </div>

        <GlassCard className="mt-4 border border-white/10 bg-white/[0.03] p-4">
          <h2
            id="creator-drawer-title"
            className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white"
          >
            {creator.name}
          </h2>
          <p className="mt-2 text-xs text-white/55">
            {t("status")}:{" "}
            <span className="font-semibold text-gold">{tStatus(creator.status)}</span>
          </p>
          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-white/50">{t("submissions")}</dt>
              <dd className="font-bold text-white">{totalSubmissions}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-white/50">{t("featured")}</dt>
              <dd className="font-bold text-gold">{creator.featuredCount}</dd>
            </div>
          </dl>
        </GlassCard>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {creator.publicSlug ? (
            <Link
              href={`/growth/profile/${creator.publicSlug}`}
              className="text-center text-xs font-semibold text-gold underline-offset-4 hover:underline"
            >
              {t("viewProfile")}
            </Link>
          ) : null}
          {onChallenge ? (
            <GoldButton type="button" className="w-full" onClick={() => onChallenge(creator)}>
              {t("challenge")}
            </GoldButton>
          ) : null}
        </div>
      </aside>
    </>
  );
}
