/**
 * Generates premium medal SVG assets for site/public/badges/
 * Run: node scripts/generate-badge-svgs.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, "..", "public", "badges");
mkdirSync(outDir, { recursive: true });

/** @type {Record<string, { primary: string; secondary: string; accent: string; emblem: string }>} */
const BADGES = {
  first_deal: { primary: "#E4B84D", secondary: "#8B6914", accent: "#FFF8E7", emblem: "★" },
  deals_5: { primary: "#60A5FA", secondary: "#1E40AF", accent: "#DBEAFE", emblem: "5" },
  deals_10: { primary: "#22D3EE", secondary: "#0E7490", accent: "#CFFAFE", emblem: "10" },
  first_referral: { primary: "#34D399", secondary: "#047857", accent: "#D1FAE5", emblem: "∞" },
  network_builder: { primary: "#3B82F6", secondary: "#1D4ED8", accent: "#DBEAFE", emblem: "◈" },
  ai_seller: { primary: "#A78BFA", secondary: "#6D28D9", accent: "#EDE9FE", emblem: "AI" },
  fast_closer: { primary: "#FBBF24", secondary: "#B45309", accent: "#FEF3C7", emblem: "⚡" },
  top_performer: { primary: "#E4B84D", secondary: "#92400E", accent: "#FEF9C3", emblem: "♛" },
  elite_pulse: { primary: "#A855F7", secondary: "#6B21A8", accent: "#F3E8FF", emblem: "◉" },
  trusted_partner: { primary: "#E4B84D", secondary: "#78716C", accent: "#F5F5F4", emblem: "✓" },
  vip_seller: { primary: "#F472B6", secondary: "#BE185D", accent: "#FCE7F3", emblem: "VIP" },
  strategic_agent: { primary: "#534AB7", secondary: "#312E81", accent: "#E0E7FF", emblem: "♞" },
  night_owl: { primary: "#6366F1", secondary: "#3730A3", accent: "#E0E7FF", emblem: "☾" },
  triple_close_day: { primary: "#F59E0B", secondary: "#B45309", accent: "#FFEDD5", emblem: "3×" },
  revenue_10k: { primary: "#22C55E", secondary: "#15803D", accent: "#DCFCE7", emblem: "$" },
  content_creator: { primary: "#E4B84D", secondary: "#9333EA", accent: "#FAE8FF", emblem: "▶" },
  verified_partner: { primary: "#38BDF8", secondary: "#0369A1", accent: "#E0F2FE", emblem: "✓" },
};

function medalSvg(key, { primary, secondary, accent, emblem }) {
  const holo =
    key === "content_creator" || key === "top_performer" || key === "elite_pulse"
      ? `<linearGradient id="holo-${key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="${accent}" stop-opacity="0.7"/>
          <stop offset="65%" stop-color="${secondary}" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="${primary}" stop-opacity="0.95"/>
        </linearGradient>`
      : `<linearGradient id="holo-${key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="50%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>`;

  const fontSize = emblem.length > 2 ? 22 : emblem.length > 1 ? 28 : 36;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${key}">
  <defs>
    ${holo}
    <radialGradient id="rim-${key}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </radialGradient>
    <filter id="glow-${key}" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${primary}" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <clipPath id="hex-${key}">
      <path d="M64 8 L110 32 L110 80 L64 104 L18 80 L18 32 Z"/>
    </clipPath>
  </defs>
  <g filter="url(#glow-${key})">
    <circle cx="64" cy="64" r="58" fill="none" stroke="url(#rim-${key})" stroke-width="6"/>
    <circle cx="64" cy="64" r="50" fill="#0a0a0f" stroke="${primary}" stroke-width="2" opacity="0.9"/>
    <g clip-path="url(#hex-${key})">
      <rect width="128" height="128" fill="url(#holo-${key})"/>
      <path d="M64 14 L100 34 L100 78 L64 98 L28 78 L28 34 Z" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.55"/>
      <ellipse cx="64" cy="42" rx="28" ry="12" fill="white" opacity="0.12"/>
    </g>
    <text x="64" y="72" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="${fontSize}" fill="${accent}" stroke="${secondary}" stroke-width="0.5">${emblem}</text>
    <circle cx="64" cy="64" r="52" fill="none" stroke="${primary}" stroke-width="1" opacity="0.35"/>
  </g>
</svg>`;
}

for (const [key, cfg] of Object.entries(BADGES)) {
  const path = join(outDir, `${key}.svg`);
  writeFileSync(path, medalSvg(key, cfg), "utf8");
  console.log("wrote", path);
}

console.log(`Generated ${Object.keys(BADGES).length} badge SVGs`);
