import Image from "next/image";
import type { CinemaMovie } from "@/lib/cinema-demo/data";

type Props = {
  movie: CinemaMovie;
  title: string;
  priority?: boolean;
  className?: string;
};

export function CinemaMoviePoster({ movie, title, priority, className = "" }: Props) {
  return (
    <div className={`cinema-poster-frame ${className}`}>
      <Image
        src={movie.posterSrc}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="cinema-poster-img"
        priority={priority}
      />
      <div className="cinema-poster-shine" aria-hidden />
      <span className="cinema-poster-rating">{movie.rating}</span>
    </div>
  );
}
