function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type LuxuryCardInput = {
  name: string;
  handle: string;
  tier: string;
  scope: string;
  token: string;
  inviteUrl: string;
  message?: string;
};

/** Premium portrait invitation card (1080×1920) for server PNG export. */
export function buildLuxuryCardSvg(input: LuxuryCardInput, qrDataUrl: string): string {
  const name = escapeXml(input.name);
  const tier = escapeXml(input.tier.toUpperCase());
  const token = escapeXml(input.token);
  const url = escapeXml(input.inviteUrl.replace(/^https?:\/\//, ""));
  const message = escapeXml((input.message ?? input.scope).slice(0, 200));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="goldGlow" cx="50%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#C9922A" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#C9922A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="purpleGlow" cx="10%" cy="90%" r="55%">
      <stop offset="0%" stop-color="#6B21A8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#6B21A8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="frameGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B6514"/>
      <stop offset="50%" stop-color="#E4B84D"/>
      <stop offset="100%" stop-color="#8B6514"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F0B1E"/>
      <stop offset="50%" stop-color="#1A1530"/>
      <stop offset="100%" stop-color="#0F0B1E"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="#03010A"/>
  <rect width="1080" height="1920" fill="url(#goldGlow)"/>
  <rect width="1080" height="1920" fill="url(#purpleGlow)"/>

  <rect x="30" y="30" width="1020" height="1860" rx="32" fill="none" stroke="url(#frameGold)" stroke-width="2"/>
  <rect x="50" y="50" width="980" height="1820" rx="24" fill="none" stroke="rgba(201,146,42,0.3)" stroke-width="1"/>

  <polygon points="70,62 78,70 70,78 62,70" fill="#C9922A"/>
  <polygon points="1010,62 1018,70 1010,78 1002,70" fill="#C9922A"/>
  <polygon points="70,1858 78,1866 70,1874 62,1866" fill="#C9922A"/>
  <polygon points="1010,1858 1018,1866 1010,1874 1002,1866" fill="#C9922A"/>

  <text x="540" y="155" text-anchor="middle" fill="#E4B84D" font-family="Cairo, Arial, sans-serif" font-size="44" font-weight="700">TENEGTA</text>
  <line x1="380" y1="175" x2="700" y2="175" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>
  <text x="540" y="210" text-anchor="middle" fill="rgba(201,146,42,0.7)" font-family="monospace" font-size="16" letter-spacing="4">ASCEND PARTNER</text>

  <rect x="80" y="280" width="920" height="380" rx="20" fill="url(#cardBg)" stroke="url(#frameGold)" stroke-width="1.5"/>
  <rect x="820" y="310" width="60" height="44" rx="6" fill="#1A1430" stroke="rgba(201,146,42,0.6)" stroke-width="1.5"/>
  <line x1="850" y1="310" x2="850" y2="354" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>
  <line x1="832" y1="322" x2="868" y2="322" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>
  <line x1="832" y1="332" x2="868" y2="332" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>
  <line x1="832" y1="342" x2="868" y2="342" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>

  <text x="540" y="430" text-anchor="middle" fill="#F5F0E8" font-family="Cairo, Arial, sans-serif" font-size="64" font-weight="700">${name}</text>
  <text x="540" y="480" text-anchor="middle" fill="#C9922A" font-family="monospace" font-size="18" letter-spacing="3">${tier}</text>
  <text x="540" y="620" text-anchor="middle" fill="rgba(201,146,42,0.8)" font-family="monospace" font-size="20">◆  ${token}  ◆</text>

  <text x="80" y="780" fill="rgba(201,146,42,0.15)" font-family="Georgia, serif" font-size="100" font-weight="700">«</text>
  <text x="1000" y="900" text-anchor="end" fill="rgba(201,146,42,0.15)" font-family="Georgia, serif" font-size="100" font-weight="700">»</text>
  <text x="540" y="780" text-anchor="middle" fill="rgba(245,240,232,0.85)" font-family="Cairo, Arial, sans-serif" font-size="26">${message}</text>

  <line x1="200" y1="960" x2="880" y2="960" stroke="rgba(201,146,42,0.5)" stroke-width="1"/>
  <text x="540" y="1040" text-anchor="middle" fill="#C9922A" font-family="Cairo, Arial, sans-serif" font-size="22">امسح للانضمام</text>

  <rect x="396" y="1066" width="288" height="288" rx="6" fill="none" stroke="rgba(201,146,42,0.6)" stroke-width="1.5"/>
  <image href="${qrDataUrl}" x="400" y="1070" width="280" height="280"/>

  <text x="540" y="1385" text-anchor="middle" fill="rgba(201,146,42,0.6)" font-family="monospace" font-size="18">${url}</text>
  <line x1="300" y1="1480" x2="780" y2="1480" stroke="rgba(201,146,42,0.3)" stroke-width="1"/>
  <text x="540" y="1540" text-anchor="middle" fill="rgba(201,146,42,0.8)" font-family="Cairo, Arial, sans-serif" font-size="24">tenegta.com</text>
  <text x="540" y="1580" text-anchor="middle" fill="rgba(201,146,42,0.4)" font-family="Cairo, Arial, sans-serif" font-size="16">ASCEND · PARTNER NETWORK · 2026</text>
</svg>`;
}
