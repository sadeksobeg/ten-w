import { CINEMA_BRAND } from "@/lib/cinema-demo/data";

type Props = {
  variant: "splash" | "dark" | "compact" | "light";
  className?: string;
  alt?: string;
  tagline?: string;
};

export function CinemaBrandLogo({ variant, className = "", alt = CINEMA_BRAND.nameAr, tagline }: Props) {
  const sizeClass =
    variant === "splash"
      ? "cinema-wordmark--splash"
      : variant === "compact"
        ? "cinema-wordmark--compact"
        : variant === "light"
          ? "cinema-wordmark--light"
          : "cinema-wordmark--dark";

  return (
    <div
      className={`cinema-wordmark ${sizeClass} ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg className="cinema-wordmark-arc" viewBox="0 0 280 32" aria-hidden>
        <defs>
          <linearGradient id="cinema-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#f5c518" />
            <stop offset="80%" stopColor="#f5c518" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M20 28 Q140 4 260 28"
          fill="none"
          stroke="url(#cinema-arc-grad)"
          strokeWidth="2"
        />
        <circle cx="20" cy="28" r="3" fill="#f5c518" opacity="0.8" />
        <circle cx="260" cy="28" r="3" fill="#f5c518" opacity="0.8" />
      </svg>

      <div className="cinema-wordmark-core">
        <svg className="cinema-wordmark-reel" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9" />
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
        <div className="cinema-wordmark-text">
          <span className="cinema-wordmark-ar">سلمية</span>
          <span className="cinema-wordmark-en">CINEMA</span>
        </div>
      </div>

      {variant === "splash" && tagline ? (
        <span className="cinema-wordmark-tagline">{tagline}</span>
      ) : null}
    </div>
  );
}
