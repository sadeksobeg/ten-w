"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import {
  campaignText,
  type AscendCampaign,
  type AscendCampaignTheme,
} from "@/lib/growth/ascend-campaigns";
import { IconCapsule, IconGhost, IconLightbulb } from "@/components/growth/icons/GrowthIcons";

export const ASCEND_CAMPAIGN_DISMISS_KEY = "ascend_campaign_dismissed";

export type AscendRevealBannerProps = {
  campaign: AscendCampaign;
  locale: string;
  onDismiss?: () => void;
  /** Carousel slide — tighter layout & fixed height */
  variant?: "carousel" | "stack";
};

const THEME_CLASS: Record<AscendCampaignTheme, string> = {
  gold_command: "ascend-reveal--gold",
  nebula_vault: "ascend-reveal--vault",
  constellation: "ascend-reveal--constellation",
  territory_atlas: "ascend-reveal--atlas",
  chronicle: "ascend-reveal--chronicle",
  capsule_seal: "ascend-reveal--capsule",
  event_launch: "ascend-reveal--event",
};

function ThemeArt({ theme }: { theme: AscendCampaignTheme }) {
  if (theme === "constellation") {
    return (
      <svg className="ascend-reveal-art" viewBox="0 0 200 120" aria-hidden>
        <circle cx="100" cy="60" r="2" fill="#E4B84D" className="ascend-reveal-pulse" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const r = 38 + (i % 3) * 14;
          const x = 100 + r * Math.cos((deg * Math.PI) / 180);
          const y = 60 + r * Math.sin((deg * Math.PI) / 180);
          return (
            <g key={deg}>
              <line x1="100" y1="60" x2={x} y2={y} stroke="#818CF8" strokeOpacity="0.35" />
              <circle cx={x} cy={y} r="3" fill="#A78BFA" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    );
  }
  if (theme === "territory_atlas") {
    return (
      <svg className="ascend-reveal-art" viewBox="0 0 200 120" aria-hidden>
        <path
          d="M40 70 Q70 35 100 45 T160 55 L175 85 Q140 95 100 88 T45 78 Z"
          fill="url(#atlasFill)"
          stroke="#E4B84D"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <defs>
          <linearGradient id="atlasFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a2035" />
            <stop offset="100%" stopColor="#0d1220" />
          </linearGradient>
        </defs>
        <circle cx="95" cy="58" r="5" fill="#E4B84D" className="ascend-reveal-pulse" />
      </svg>
    );
  }
  if (theme === "nebula_vault") {
    return (
      <>
        <IconLightbulb size={44} className="text-violet-300 opacity-90 sm:hidden" aria-hidden />
        <IconLightbulb size={56} className="hidden text-violet-300 opacity-90 sm:block" aria-hidden />
      </>
    );
  }
  if (theme === "capsule_seal") {
    return (
      <>
        <IconCapsule size={44} className="text-gold opacity-90 sm:hidden" aria-hidden />
        <IconCapsule size={56} className="hidden text-gold opacity-90 sm:block" aria-hidden />
      </>
    );
  }
  if (theme === "chronicle") {
    return (
      <>
        <IconGhost size={40} className="text-sky-300 opacity-80 sm:hidden" aria-hidden />
        <IconGhost size={48} className="hidden text-sky-300 opacity-80 sm:block" aria-hidden />
      </>
    );
  }
  return (
    <svg className="ascend-reveal-art" viewBox="0 0 120 120" aria-hidden>
      <polygon
        points="60,12 108,40 108,88 60,116 12,88 12,40"
        fill="none"
        stroke="#E4B84D"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle cx="60" cy="60" r="18" fill="#E4B84D" opacity="0.15" className="ascend-reveal-pulse" />
    </svg>
  );
}

function BadgePreview({ badgeKey }: { badgeKey: string }) {
  return (
    <>
      <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center sm:hidden">
        <BadgeIcon badgeKey={badgeKey} earned size="md" showGlow animate />
      </div>
      <div className="hidden h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center sm:flex">
        <BadgeIcon badgeKey={badgeKey} earned size="md" showGlow animate />
      </div>
    </>
  );
}

export function AscendRevealBanner({
  campaign,
  locale,
  onDismiss,
  variant = "carousel",
}: AscendRevealBannerProps) {
  const t = useTranslations("Growth.campaigns");

  const title = campaignText(campaign.title, locale);
  const body = campaignText(campaign.body, locale);
  const cta = campaignText(campaign.ctaLabel, locale);
  const themeClass = THEME_CLASS[campaign.theme];

  const endsAt = new Date(campaign.endsAt);
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86400000));

  const isCarousel = variant === "carousel";

  return (
    <article
      className={`ascend-reveal relative h-full overflow-hidden border ${themeClass} ${
        isCarousel ? "ascend-reveal--carousel-slide sm:rounded-3xl" : "rounded-3xl"
      }`}
      aria-label={title}
    >
      <div className="ascend-reveal-bg" aria-hidden />
      <div className="ascend-reveal-grid" aria-hidden />
      <div className="ascend-reveal-sheen" aria-hidden />
      <div className="ascend-reveal-vignette" aria-hidden />

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute start-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg leading-none text-white/55 transition hover:text-white sm:end-3 sm:start-auto"
          aria-label={t("dismiss")}
        >
          <span aria-hidden>×</span>
        </button>
      ) : null}

      <div
        className={`relative flex h-full min-h-0 ${
          isCarousel
            ? "flex-col items-stretch gap-3 p-4 pt-12 sm:flex-row sm:items-center sm:gap-5 sm:p-6 sm:pt-6 sm:pe-12"
            : "flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
        }`}
      >
        <div className="ascend-reveal-art-wrap mx-auto flex shrink-0 items-center justify-center sm:mx-0">
          {campaign.badgePreviewKey ? (
            <BadgePreview badgeKey={campaign.badgePreviewKey} />
          ) : (
            <ThemeArt theme={campaign.theme} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center text-center sm:text-start">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold/90 sm:text-[10px] sm:tracking-[0.25em]">
            {campaign.type === "event_launch" ? t("eyebrowEvent") : t("eyebrowFeature")}
          </p>
          <h2 className="mt-1 line-clamp-2 font-[family-name:var(--font-cairo)] text-base font-extrabold leading-snug text-white sm:mt-2 sm:text-xl sm:leading-tight md:text-2xl">
            {title}
          </h2>
          <p
            className={`mt-1 text-white/70 sm:mt-2 ${
              isCarousel
                ? "line-clamp-2 text-xs leading-relaxed sm:line-clamp-3 sm:text-sm"
                : "max-w-xl text-sm leading-relaxed"
            }`}
          >
            {body}
          </p>
          {daysLeft > 0 && daysLeft < 120 ? (
            <p className="mt-1 text-[10px] font-semibold text-white/45 sm:mt-2 sm:text-xs">
              {t("endsIn", { days: daysLeft })}
            </p>
          ) : null}
          <div
            className={`mt-3 gap-2 sm:mt-4 sm:gap-3 ${
              isCarousel
                ? "grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap"
                : "flex flex-wrap gap-2"
            }`}
          >
            <Link
              href={campaign.ctaHref}
              className="inline-flex min-h-[var(--growth-touch-min)] items-center justify-center rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold-bright px-4 py-2 text-xs font-extrabold text-bg shadow-[0_0_24px_-8px_rgba(228,184,77,0.75)] transition hover:brightness-110 sm:min-h-11 sm:flex-none sm:px-7 sm:text-sm"
            >
              {cta}
            </Link>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex min-h-[var(--growth-touch-min)] items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/65 transition hover:border-white/30 hover:text-white sm:min-h-11 sm:px-5 sm:text-sm"
              >
                {t("dismiss")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function readDismissedCampaignIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASCEND_CAMPAIGN_DISMISS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function dismissCampaignId(id: string): void {
  try {
    const dismissed = readDismissedCampaignIds();
    if (!dismissed.includes(id)) {
      localStorage.setItem(ASCEND_CAMPAIGN_DISMISS_KEY, JSON.stringify([...dismissed, id]));
    }
  } catch {
    /* ignore */
  }
}
