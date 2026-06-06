"use client";

type Props = {
  active?: boolean;
};

const NODES = [
  { label: "AI", ar: "ذكاء", color: "#A855F7" },
  { label: "CYBER", ar: "أمن", color: "#C9922A" },
  { label: "DEV", ar: "هندسة", color: "#F5E6C3" },
];

export function WorldSystemsOrbit({ active = true }: Props) {
  if (!active) return null;

  return (
    <div className="invite-world-orbit-bg" aria-hidden>
      <div className="invite-world-mesh" />
      <svg className="invite-world-orbit-svg" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9922A" stopOpacity="0.2" />
            <stop offset="55%" stopColor="#6B21A8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#C9922A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbit-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9922A" stopOpacity="0" />
            <stop offset="50%" stopColor="#E4B84D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C9922A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="170" fill="url(#orbit-glow)" />
        <circle
          cx="200"
          cy="200"
          r="145"
          fill="none"
          stroke="rgba(201,146,42,0.08)"
          strokeWidth="0.5"
          className="invite-orbit-ring invite-orbit-ring--0"
        />
        <circle
          cx="200"
          cy="200"
          r="130"
          fill="none"
          stroke="rgba(201,146,42,0.14)"
          strokeWidth="1"
          strokeDasharray="6 10"
          className="invite-orbit-ring invite-orbit-ring--1"
        />
        <circle
          cx="200"
          cy="200"
          r="95"
          fill="none"
          stroke="rgba(168,85,247,0.18)"
          strokeWidth="0.5"
          className="invite-orbit-ring invite-orbit-ring--2"
        />
        <circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="rgba(201,146,42,0.22)"
          strokeWidth="1"
          className="invite-orbit-ring invite-orbit-ring--3"
        />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="200"
            y1="200"
            x2="200"
            y2="72"
            stroke="url(#orbit-beam)"
            strokeWidth="0.5"
            opacity="0.35"
            transform={`rotate(${deg} 200 200)`}
            className="invite-orbit-beam"
          />
        ))}
        {NODES.map((node, i) => (
          <g key={node.label} className={`invite-orbit-node invite-orbit-node--${i + 1}`}>
            <circle r="8" fill={node.color} opacity="0.95" />
            <circle r="14" fill="none" stroke={node.color} strokeWidth="0.5" opacity="0.35" className="invite-orbit-node-pulse" />
            <text y="22" textAnchor="middle" fill={node.color} fontSize="8" fontFamily="monospace" opacity="0.85">
              {node.label}
            </text>
            <text y="34" textAnchor="middle" fill="rgba(245,230,195,0.55)" fontSize="7" fontFamily="sans-serif">
              {node.ar}
            </text>
          </g>
        ))}
        <circle cx="200" cy="200" r="28" fill="rgba(10,6,21,0.85)" stroke="rgba(201,146,42,0.35)" strokeWidth="1" />
        <text x="200" y="208" textAnchor="middle" fill="#E4B84D" fontSize="26" fontFamily="Georgia, serif" className="invite-orbit-core">
          T
        </text>
      </svg>
    </div>
  );
}
