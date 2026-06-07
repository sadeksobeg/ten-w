import type { CinemaMovie } from "@/lib/cinema-demo/data";

type DrawOpts = {
  mode: "preMovie" | "playing" | "intermission";
  movie: CinemaMovie | null;
  locale: string;
  time: number;
  reducedMotion: boolean;
  poster?: HTMLImageElement | null;
};

function parseGradientStops(gradient: string): string[] {
  const matches = gradient.match(/#[0-9a-fA-F]{3,8}/g);
  return matches?.length ? matches : ["#1a2848", "#3d5a8a", "#c9922a"];
}

function drawPosterCover(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  poster: HTMLImageElement,
  time: number,
  reducedMotion: boolean,
): void {
  const w = canvas.width;
  const h = canvas.height;
  const zoom = reducedMotion ? 1.08 : 1.05 + Math.sin(time * 0.35) * 0.04;
  const panX = reducedMotion ? 0 : Math.sin(time * 0.22) * 24;
  const panY = reducedMotion ? 0 : Math.cos(time * 0.18) * 16;
  const iw = poster.naturalWidth || poster.width;
  const ih = poster.naturalHeight || poster.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(poster, (w - dw) / 2 + panX, (h - dh) / 2 + panY, dw, dh);
}

function drawLetterbox(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bar = h * 0.1;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, bar);
  ctx.fillRect(0, h - bar, w, bar);
}

function drawFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let i = 0; i < 80; i++) {
    const x = (Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5) * w;
    const y = (Math.cos(time * 2.4 + i * 2.1) * 0.5 + 0.5) * h;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

export function drawCinemaScreenCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  { mode, movie, locale, time, reducedMotion, poster }: DrawOpts,
): void {
  const w = canvas.width;
  const h = canvas.height;
  const ar = locale.startsWith("ar");
  const title = movie ? (ar ? movie.titleAr : movie.titleEn) : ar ? "سينما سلمية" : "Salamiya Cinema";
  const genre = movie ? (ar ? movie.genreAr : movie.genreEn) : "";

  if (mode === "preMovie") {
    if (poster?.complete && poster.naturalWidth > 0) {
      drawPosterCover(ctx, canvas, poster, time * 0.15, reducedMotion);
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.fillRect(0, 0, w, h);
    } else {
      const stops = parseGradientStops(movie?.posterGradient ?? "");
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, stops[0] ?? "#1a2848");
      g.addColorStop(0.5, stops[1] ?? stops[0] ?? "#3d5a8a");
      g.addColorStop(1, stops[2] ?? stops[1] ?? "#c9922a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (!reducedMotion) {
        const sweep = (time * 0.25) % 1;
        ctx.fillStyle = `rgba(255,255,255,${0.06 + Math.sin(time * 2) * 0.02})`;
        ctx.fillRect(w * sweep - 80, 0, 160, h);
      }
    }

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, w, h * 0.14);
    ctx.fillStyle = "#f5c518";
    ctx.font = "700 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ar ? "يبدأ العرض قريباً" : "Starting soon", w / 2, 30);

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(title, w / 2, h / 2 - 4);
    if (genre) {
      ctx.font = "500 15px sans-serif";
      ctx.fillStyle = "rgba(255,248,220,0.88)";
      ctx.fillText(genre, w / 2, h / 2 + 24);
    }
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "12px sans-serif";
    ctx.fillText("Salamiya Cinema · سينما سلمية", w / 2, h - 16);
    return;
  }

  if (mode === "intermission") {
    ctx.fillStyle = "#c9922a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ar ? "استراحة" : "Intermission", w / 2, h / 2);
    return;
  }

  const t = reducedMotion ? 0 : time;
  const scene = Math.floor(t / 3.5) % 5;
  const stops = parseGradientStops(movie?.posterGradient ?? "");

  if (poster?.complete && poster.naturalWidth > 0) {
    drawPosterCover(ctx, canvas, poster, t, reducedMotion);
    ctx.fillStyle = `rgba(0,0,0,${0.18 + (scene % 2) * 0.08})`;
    ctx.fillRect(0, 0, w, h);
  } else {
    const base = stops[scene % stops.length] ?? "#1a2848";
    const accent = stops[(scene + 1) % stops.length] ?? "#c9922a";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, base);
    g.addColorStop(0.55, accent);
    g.addColorStop(1, "#050508");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (!reducedMotion) {
    const flareX = w * (0.35 + Math.sin(t * 0.7) * 0.25);
    const flareY = h * (0.4 + Math.cos(t * 0.5) * 0.15);
    const flare = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, w * 0.35);
    flare.addColorStop(0, "rgba(255,255,255,0.14)");
    flare.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 8; i++) {
      const px = ((t * 55 + i * 110) % (w + 140)) - 70;
      const py = 50 + i * 26 + Math.sin(t * 1.2 + i) * 14;
      ctx.fillStyle = `rgba(255,255,255,${0.05 + (i % 3) * 0.025})`;
      ctx.fillRect(px, py, 56 + i * 10, 5);
    }
    drawFilmGrain(ctx, w, h, t);
  }

  drawLetterbox(ctx, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, h * 0.1, w, 34);
  ctx.fillStyle = "#f5c518";
  ctx.font = "700 13px sans-serif";
  ctx.textAlign = "start";
  ctx.fillText(ar ? "● يعرض الآن" : "● NOW PLAYING", 18, h * 0.1 + 22);
  ctx.textAlign = "end";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "600 13px sans-serif";
  ctx.fillText(title, w - 18, h * 0.1 + 22);

  const barY = h - h * 0.1 - 18;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(w * 0.12, barY, w * 0.76, 4);
  const progress = reducedMotion ? 0.42 : (t % 12) / 12;
  ctx.fillStyle = "#f5c518";
  ctx.fillRect(w * 0.12, barY, w * 0.76 * progress, 4);
}
