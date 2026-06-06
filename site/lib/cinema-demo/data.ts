export type CinemaMovie = {
  id: string;
  titleAr: string;
  titleEn: string;
  genreAr: string;
  genreEn: string;
  durationMin: number;
  rating: string;
  posterSrc: string;
  posterGradient: string;
};

export type CinemaShowtime = {
  id: string;
  movieId: string;
  hall: string;
  hallLabelAr: string;
  hallLabelEn: string;
  time: string;
  dateLabelAr: string;
  dateLabelEn: string;
};

export const CINEMA_BRAND = {
  nameAr: "سينما سلمية",
  nameEn: "Salamiya Cinema",
  /** Full marketing flat-lay (legacy) */
  logoSrc: "/demo/salamiya-cinema-logo.png",
  /** Cropped wordmark — yellow + سلمية CINEMA only */
  logoMarkSrc: "/demo/salamiya-cinema-mark.png",
  yellow: "#F5C518",
  black: "#0a0a0a",
} as const;

export const CINEMA_MOVIES: CinemaMovie[] = [
  {
    id: "dune-3",
    titleAr: "كثيب: جزء ثالث",
    titleEn: "Dune: Part Three",
    genreAr: "خيال علمي · مغامرة",
    genreEn: "Sci-Fi · Adventure",
    durationMin: 156,
    rating: "PG-13",
    posterSrc: "/demo/posters/dune.jpg",
    posterGradient: "linear-gradient(145deg, #1a1208 0%, #c9922a 45%, #3d2a0a 100%)",
  },
  {
    id: "comedy-night",
    titleAr: "ليلة كوميديا",
    titleEn: "Comedy Night Live",
    genreAr: "كوميديا · عائلي",
    genreEn: "Comedy · Family",
    durationMin: 98,
    rating: "PG",
    posterSrc: "/demo/posters/comedy.jpg",
    posterGradient: "linear-gradient(145deg, #2a1a0a 0%, #f5c518 50%, #1a1400 100%)",
  },
  {
    id: "local-drama",
    titleAr: "أرض الأحلام",
    titleEn: "Land of Dreams",
    genreAr: "دراما · محلي",
    genreEn: "Drama · Local",
    durationMin: 122,
    rating: "PG-13",
    posterSrc: "/demo/posters/drama.jpg",
    posterGradient: "linear-gradient(145deg, #0f0b1e 0%, #6b21a8 40%, #03010a 100%)",
  },
];

export const CINEMA_SHOWTIMES: CinemaShowtime[] = [
  {
    id: "st-1",
    movieId: "dune-3",
    hall: "hall-1",
    hallLabelAr: "القاعة ١ — IMAX",
    hallLabelEn: "Hall 1 — IMAX",
    time: "17:30",
    dateLabelAr: "اليوم · الجمعة",
    dateLabelEn: "Today · Friday",
  },
  {
    id: "st-2",
    movieId: "dune-3",
    hall: "hall-2",
    hallLabelAr: "القاعة ٢ — VIP",
    hallLabelEn: "Hall 2 — VIP",
    time: "20:45",
    dateLabelAr: "اليوم · الجمعة",
    dateLabelEn: "Today · Friday",
  },
  {
    id: "st-3",
    movieId: "comedy-night",
    hall: "hall-1",
    hallLabelAr: "القاعة ١ — IMAX",
    hallLabelEn: "Hall 1 — IMAX",
    time: "19:00",
    dateLabelAr: "اليوم · الجمعة",
    dateLabelEn: "Today · Friday",
  },
  {
    id: "st-4",
    movieId: "local-drama",
    hall: "hall-2",
    hallLabelAr: "القاعة ٢ — VIP",
    hallLabelEn: "Hall 2 — VIP",
    time: "21:15",
    dateLabelAr: "اليوم · الجمعة",
    dateLabelEn: "Today · Friday",
  },
];

export function getMovie(id: string) {
  return CINEMA_MOVIES.find((m) => m.id === id);
}

export function getShowtime(id: string) {
  return CINEMA_SHOWTIMES.find((s) => s.id === id);
}

export function showtimesForMovie(movieId: string) {
  return CINEMA_SHOWTIMES.filter((s) => s.movieId === movieId);
}
