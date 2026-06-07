import type { CinemaMovie } from "@/lib/cinema-demo/data";

type DrawOpts = {
  mode: "preMovie" | "playing" | "intermission";
  movie: CinemaMovie | null;
  locale: string;
  time: number;
  reducedMotion: boolean;
};

function parseGradientStops(gradient: string): string[] {
  const matches = gradient.match(/#[0-9a-fA-F]{3,8}/g);
  return matches?.length ? matches : ["#1a2848", "#3d5a8a", "#c9922a"];
}

export function drawCinemaScreenCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { mode, movie, locale, time, reducedMotion }: DrawOpts,
): void {
  const w = canvas.width;
  const h = canvas.height;
  const title = movie ? (locale.startsWith("ar") ? movie.titleAr : movie.titleEn) : "سينما سلمية";
  const genre = movie ? (locale.startsWith("ar") ? movie.genreAr : movie.genreEn) : "";

  if (mode === "preMovie") {
    const stops = parseGradientStops(movie?.posterGradient ?? "");
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, stops[0] ?? "#1a2848");
    g.addColorStop(0.5, stops[1] ?? stops[0] ?? "#3d5a8a");
    g.addColorStop(1, stops[2] ?? stops[1] ?? "#c9922a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, w, h * 0.12);
    ctx.fillStyle = "rgba(245,197,24,0.9)";
    ctx.font = "600 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(locale.startsWith("ar") ? "يبدأ العرض قريباً" : "Starting soon", w / 2, 28);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(title, w / 2, h / 2 - 6);
    if (genre) {
      ctx.font = "500 14px sans-serif";
      ctx.fillStyle = "rgba(255,248,220,0.85)";
      ctx.fillText(genre, w / 2, h / 2 + 22);
    }
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px sans-serif";
    ctx.fillText("سينما سلمية · Salamiya Cinema", w / 2, h - 18);
    return;
  }

  if (mode === "intermission") {
    ctx.fillStyle = "#c9922a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(locale.startsWith("ar") ? "استراحة" : "Intermission", w / 2, h / 2);
    return;
  }

  const t = reducedMotion ? 0 : time;
  const scene = Math.floor(t / 4) % 4;
  const stops = parseGradientStops(movie?.posterGradient ?? "");
  const base = stops[scene % stops.length] ?? "#1a2848";
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, base);
  g.addColorStop(1, stops[(scene + 1) % stops.length] ?? "#0a0a12");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (!reducedMotion) {
    for (let i = 0; i < 6; i++) {
      const px = ((t * 40 + i * 90) % (w + 120)) - 60;
      const py = 40 + i * 28 + Math.sin(t + i) * 12;
      ctx.fillStyle = `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`;
      ctx.fillRect(px, py, 48 + i * 8, 6);
    }
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, w, 36);
  ctx.fillStyle = "#f5c518";
  ctx.font = "600 12px sans-serif";
  ctx.textAlign = "start";
  ctx.fillText(locale.startsWith("ar") ? "● يعرض الآن" : "● NOW PLAYING", 16, 22);
  ctx.textAlign = "end";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(title, w - 16, 22);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, h - 28, w, 28);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  const barW = reducedMotion ? w * 0.35 : w * (0.2 + ((t % 8) / 8) * 0.55);
  ctx.fillRect(w / 2 - barW / 2, h - 14, barW, 3);
}
