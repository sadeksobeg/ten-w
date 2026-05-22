"use client";

export type ShareCardClientData = {
  name: string;
  levelName: string;
  totalXp: number;
  closedDeals: number;
  badgeCount: number;
  referralCode: string;
  profileUrl: string;
  topBadges: string[];
  locale: string;
};

export type ShareCardFormat = "landscape" | "story";

const sizes: Record<ShareCardFormat, { width: number; height: number }> = {
  landscape: { width: 1200, height: 630 },
  story: { width: 1080, height: 1080 },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function renderShareCardCanvas(
  data: ShareCardClientData,
  format: ShareCardFormat,
): HTMLCanvasElement {
  const { width, height } = sizes[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const isRtl = data.locale === "ar";
  const pad = format === "story" ? 72 : 56;
  const font = 'Cairo, "Segoe UI", Tahoma, sans-serif';

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#1a1208");
  bg.addColorStop(0.35, "#0a0a0f");
  bg.addColorStop(0.65, "#2a1f0a");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(176, 125, 43, 0.55)";
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, width - 4, height - 4, 12);
  ctx.stroke();

  const align: CanvasTextAlign = isRtl ? "right" : "left";
  const xMain = isRtl ? width - pad : pad;
  const xOpp = isRtl ? pad : width - pad;

  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.font = `800 28px ${font}`;
  ctx.fillStyle = "#e4b84d";
  ctx.fillText("T.E.N.E.G.T.A", xMain, pad);
  ctx.font = `600 14px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(isRtl ? "شريك معتمد" : "CERTIFIED PARTNER", xMain, pad + 36);

  ctx.textAlign = isRtl ? "left" : "right";
  ctx.font = `700 22px ${font}`;
  const levelW = ctx.measureText(data.levelName).width;
  const pillX = isRtl ? pad : width - pad - levelW - 40;
  roundRect(ctx, pillX, pad, levelW + 40, 40, 20);
  ctx.fillStyle = "rgba(176,125,43,0.45)";
  ctx.fill();
  ctx.fillStyle = "#e4b84d";
  ctx.textAlign = "center";
  ctx.fillText(data.levelName, pillX + (levelW + 40) / 2, pad + 10);

  const nameY = format === "story" ? pad + 120 : pad + 100;
  ctx.textAlign = align;
  ctx.font = `800 ${format === "story" ? 64 : 52}px ${font}`;
  ctx.fillStyle = "#f0ede8";
  ctx.fillText(data.name, xMain, nameY);

  ctx.font = `500 28px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  const stats = `${data.totalXp} XP · ${data.closedDeals} ${isRtl ? "صفقة" : "deals"} · ${data.badgeCount} ${isRtl ? "شارة" : "badges"}`;
  ctx.fillText(stats, xMain, nameY + (format === "story" ? 80 : 68));

  let badgeY = nameY + (format === "story" ? 130 : 110);
  ctx.font = `500 18px ${font}`;
  for (const b of data.topBadges.slice(0, 3)) {
    const bw = ctx.measureText(b).width + 28;
    const bx = isRtl ? xMain - bw : xMain;
    roundRect(ctx, bx, badgeY, bw, 32, 8);
    ctx.fillStyle = "rgba(83, 74, 183, 0.35)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.stroke();
    ctx.fillStyle = "#f0ede8";
    ctx.textAlign = "center";
    ctx.fillText(b, bx + bw / 2, badgeY + 8);
    badgeY += 40;
  }

  const qrSize = format === "story" ? 200 : 180;
  const qrX = isRtl ? pad : width - pad - qrSize;
  const qrY = format === "story" ? height - pad - qrSize - 120 : nameY + 20;
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 16);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "rgba(228,184,77,0.45)";
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `500 11px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.textAlign = "center";
  ctx.fillText(isRtl ? "رابط البروفايل" : "Profile link", qrX + qrSize / 2, qrY + 24);
  ctx.font = `600 12px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  const shortUrl = data.profileUrl.replace(/^https?:\/\//, "");
  wrapText(ctx, shortUrl, qrX + qrSize / 2, qrY + 48, qrSize - 24, 14, 4);

  const footY = height - pad - 72;
  ctx.strokeStyle = "rgba(176, 125, 43, 0.35)";
  ctx.beginPath();
  ctx.moveTo(pad, footY);
  ctx.lineTo(width - pad, footY);
  ctx.stroke();

  ctx.textAlign = align;
  ctx.font = `500 18px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(isRtl ? "كود الإحالة" : "Referral code", xMain, footY + 12);
  ctx.font = `800 40px ${font}`;
  ctx.fillStyle = "#e4b84d";
  ctx.fillText(data.referralCode, xMain, footY + 36);

  ctx.textAlign = isRtl ? "left" : "right";
  ctx.font = `500 16px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  const tagline = isRtl ? "انضم لشبكة النمو" : "Join the growth network";
  ctx.fillText(tagline, xOpp, footY + 40);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/[/\?&=]/).filter(Boolean);
  let line = "";
  let ly = y;
  let lines = 0;
  for (const w of words.length ? words : [text]) {
    const test = line ? `${line}/${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, centerX, ly);
      line = w;
      ly += lineHeight;
      lines += 1;
      if (lines >= maxLines) return;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.slice(0, 48), centerX, ly);
}

export function shareCardCanvasToBlob(
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png");
  });
}

export async function renderShareCardBlob(
  data: ShareCardClientData,
  format: ShareCardFormat,
): Promise<Blob> {
  const canvas = renderShareCardCanvas(data, format);
  return shareCardCanvasToBlob(canvas);
}
