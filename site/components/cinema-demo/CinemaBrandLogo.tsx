import Image from "next/image";
import { CINEMA_BRAND } from "@/lib/cinema-demo/data";

type Props = {
  variant: "splash" | "dark" | "compact";
  className?: string;
  alt?: string;
};

export function CinemaBrandLogo({ variant, className = "", alt = CINEMA_BRAND.nameAr }: Props) {
  if (variant === "splash") {
    return (
      <Image
        src={CINEMA_BRAND.logoMarkSrc}
        alt={alt}
        width={480}
        height={200}
        className={`cinema-splash-mark ${className}`}
        priority
      />
    );
  }

  const sizeClass = variant === "compact" ? "cinema-wordmark--compact" : "cinema-wordmark--dark";

  return (
    <div className={`cinema-wordmark ${sizeClass} ${className}`} aria-label={alt}>
      <span className="cinema-wordmark-ar">سلمية</span>
      <span className="cinema-wordmark-en">C I N E M A</span>
    </div>
  );
}
