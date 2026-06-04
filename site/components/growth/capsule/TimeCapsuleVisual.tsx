"use client";

type Props = {
  size?: number;
  sealed?: boolean;
  className?: string;
};

/** Premium 3D time-capsule illustration (SVG — no emoji). */
export function TimeCapsuleVisual({ size = 120, sealed = true, className = "" }: Props) {
  const uid = `cap-${size}-${sealed ? "s" : "o"}`;
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 120 138"
      className={`growth-capsule-visual ${className}`.trim()}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2035" />
          <stop offset="50%" stopColor="#0d1220" />
          <stop offset="100%" stopColor="#050810" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4C2" />
          <stop offset="45%" stopColor="#E4B84D" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id={`${uid}-band`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B4E12" />
          <stop offset="50%" stopColor="#E4B84D" />
          <stop offset="100%" stopColor="#6B4E12" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#E4B84D" floodOpacity={sealed ? 0.25 : 0.45} />
        </filter>
        <clipPath id={`${uid}-body`}>
          <rect x="28" y="24" width="64" height="88" rx="32" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="128" rx="38" ry="6" fill="#000" opacity="0.35" />

      <g filter={`url(#${uid}-shadow)`} className={sealed ? "growth-capsule-visual--sealed" : ""}>
        {/* Cap */}
        <rect x="32" y="12" width="56" height="22" rx="11" fill={`url(#${uid}-gold)`} stroke="#8B6914" strokeWidth="1" />
        <ellipse cx="60" cy="12" rx="28" ry="6" fill="#FFF8E7" opacity="0.35" />

        {/* Body */}
        <rect x="28" y="24" width="64" height="88" rx="32" fill={`url(#${uid}-glass)`} stroke="#E4B84D" strokeWidth="1.5" opacity="0.95" />
        <g clipPath={`url(#${uid}-body)`}>
          <ellipse cx="42" cy="48" rx="18" ry="40" fill="#FFFFFF" opacity="0.06" />
          <rect x="28" y="68" width="64" height="8" fill={`url(#${uid}-band)`} opacity="0.9" />
          <rect x="28" y="92" width="64" height="5" fill={`url(#${uid}-band)`} opacity="0.55" />
        </g>

        {/* Seal / lock */}
        {sealed ? (
          <g transform="translate(60, 72)">
            <circle r="14" fill="#0a0c14" stroke="#E4B84D" strokeWidth="1.5" />
            <rect x="-6" y="-1" width="12" height="9" rx="1.5" fill="none" stroke="#E4B84D" strokeWidth="1.25" />
            <path d="M-4,-1 C-4,-6 4,-6 4,-1" fill="none" stroke="#E4B84D" strokeWidth="1.25" />
            <circle cy="4" r="1.5" fill="#E4B84D" stroke="none" />
          </g>
        ) : (
          <g transform="translate(60, 72)">
            <circle r="14" fill="#E4B84D" opacity="0.15" />
            <path d="M-5 0l3 3 7-7" fill="none" stroke="#E4B84D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
}
