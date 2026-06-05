"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import {
  campaignText,
  type AscendCampaign,
  type AscendCampaignTheme,
} from "@/lib/growth/ascend-campaigns";
import { IconCapsule, IconGhost, IconLightbulb } from "@/components/growth/icons/GrowthIcons";

const DISMISS_KEY = "ascend_campaign_dismissed";

type Props = {
  campaign: AscendCampaign;
  locale: string;
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
    return <IconLightbulb size={56} className="text-violet-300 opacity-90" aria-hidden />;
  }
  if (theme === "capsule_seal") {
    return <IconCapsule size={56} className="text-gold opacity-90" aria-hidden />;
  }
  if (theme === "chronicle") {
    return <IconGhost size={48} className="text-sky-300 opacity-80" aria-hidden />;
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

export function AscendRevealBanner({ campaign, locale }: Props) {
  const t = useTranslations("Growth.campaigns");
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      const dismissed: string[] = raw ? JSON.parse(raw) : [];
      setVisible(!dismissed.includes(campaign.id));
    } catch {
      setVisible(true);
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [campaign.id]);

  const dismiss = useCallback(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      const dismissed: string[] = raw ? JSON.parse(raw) : [];
      if (!dismissed.includes(campaign.id)) {
        localStorage.setItem(DISMISS_KEY, JSON.stringify([...dismissed, campaign.id]));
      }
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, [campaign.id]);

  if (!visible) return null;

  const title = campaignText(campaign.title, locale);
  const body = campaignText(campaign.body, locale);
  const cta = campaignText(campaign.ctaLabel, locale);
  const themeClass = THEME_CLASS[campaign.theme];

  const endsAt = new Date(campaign.endsAt);
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86400000));

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={entered && !reduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`ascend-reveal relative overflow-hidden rounded-3xl border ${themeClass}`}
      aria-label={title}
    >
      <div className="ascend-reveal-bg" aria-hidden />
      <div className="ascend-reveal-grid" aria-hidden />
      <div className="ascend-reveal-sheen" aria-hidden />

      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="ascend-reveal-art-wrap flex shrink-0 items-center justify-center sm:w-44">
          {campaign.badgePreviewKey ? (
            <BadgeIcon badgeKey={campaign.badgePreviewKey} earned size="lg" showGlow animate />
          ) : (
            <ThemeArt theme={campaign.theme} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/90">
            {campaign.type === "event_launch" ? t("eyebrowEvent") : t("eyebrowFeature")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{body}</p>
          {daysLeft > 0 && daysLeft < 120 ? (
            <p className="mt-2 text-xs font-semibold text-white/45">
              {t("endsIn", { days: daysLeft })}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={campaign.ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold-bright px-7 py-2.5 text-sm font-extrabold text-bg shadow-[0_0_32px_-8px_rgba(228,184,77,0.8)] transition hover:brightness-110"
            >
              {cta}
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/30 hover:text-white"
            >
              {t("dismiss")}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="absolute end-3 top-3 rounded-full border border-white/10 bg-black/30 p-2 text-white/50 transition hover:text-white"
          aria-label={t("dismiss")}
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </motion.section>
  );
}
