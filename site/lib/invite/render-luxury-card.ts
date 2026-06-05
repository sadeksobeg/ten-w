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
};

/** Premium portrait invitation card (1080×1920) for download / share. */
export function buildLuxuryCardSvg(input: LuxuryCardInput, qrDataUrl: string): string {
  const name = escapeXml(input.name);
  const handle = escapeXml(input.handle.replace(/^@/, ""));
  const tier = escapeXml(input.tier);
  const scope = escapeXml(input.scope.slice(0, 80));
  const token = escapeXml(input.token);
  const url = escapeXml(input.inviteUrl);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="50%" stop-color="#0a0a14"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <radialGradient id="glowP" cx="30%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#7b6fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7b6fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowT" cx="85%" cy="75%" r="45%">
      <stop offset="0%" stop-color="#00e5a0" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#00e5a0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b07d2b"/>
      <stop offset="50%" stop-color="#e4b84d"/>
      <stop offset="100%" stop-color="#b07d2b"/>
    </linearGradient>
    <linearGradient id="frame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7b6fff" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#00e5a0" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7b6fff" stop-opacity="0.55"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#7b6fff" stroke-opacity="0.06"/>
    </pattern>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1080" height="1920" fill="url(#bg)"/>
  <rect width="1080" height="1920" fill="url(#glowP)"/>
  <rect width="1080" height="1920" fill="url(#glowT)"/>
  <rect width="1080" height="1920" fill="url(#grid)"/>

  <rect x="48" y="48" width="984" height="1824" rx="32" fill="none" stroke="url(#frame)" stroke-width="2"/>
  <rect x="64" y="64" width="952" height="1792" rx="24" fill="rgba(10,10,18,0.72)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <text x="540" y="160" text-anchor="middle" fill="#7b6fff" font-family="monospace" font-size="22" letter-spacing="8">T.E.N.E.G.T.A</text>
  <text x="540" y="210" text-anchor="middle" fill="#00e5a0" font-family="monospace" font-size="16" letter-spacing="4">ACCESS TOKEN · CONTENT CREATOR</text>

  <rect x="340" y="250" width="400" height="4" rx="2" fill="url(#gold)" opacity="0.85"/>

  <text x="540" y="320" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="700">دعوة تعاون</text>
  <text x="540" y="365" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="sans-serif" font-size="22">Collaboration Invitation</text>

  <rect x="120" y="420" width="840" height="520" rx="20" fill="rgba(0,0,0,0.35)" stroke="rgba(123,111,255,0.35)" stroke-width="1.5" filter="url(#softGlow)"/>
  <text x="540" y="520" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="52" font-weight="800">${name}</text>
  <text x="540" y="580" text-anchor="middle" fill="#7b6fff" font-family="monospace" font-size="28">@${handle}</text>
  <text x="540" y="650" text-anchor="middle" fill="url(#gold)" font-family="monospace" font-size="20" letter-spacing="3">${tier}</text>
  <text x="540" y="720" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="monospace" font-size="18">${scope}</text>
  <text x="540" y="880" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="16">${token}</text>

  <rect x="290" y="1020" width="500" height="500" rx="24" fill="#ffffff" stroke="rgba(123,111,255,0.4)" stroke-width="2"/>
  <image href="${qrDataUrl}" x="310" y="1040" width="460" height="460" preserveAspectRatio="xMidYMid meet"/>

  <text x="540" y="1580" text-anchor="middle" fill="#00e5a0" font-family="monospace" font-size="20">امسح الرمز · Scan to enter your world</text>
  <text x="540" y="1630" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="monospace" font-size="14">${url}</text>

  <text x="540" y="1780" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-family="monospace" font-size="13">TENEGTA · Technology · Engineering · Narrative · Enterprise · Growth · Trust · Ascend</text>
</svg>`;
}
