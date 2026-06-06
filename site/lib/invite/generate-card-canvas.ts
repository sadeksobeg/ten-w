import QRCode from "qrcode";

export type InviteCanvasInput = {
  name: string;
  handle: string;
  tier: string;
  token: string;
  scope: string;
  message: string;
  inviteUrl: string;
};

const W = 1080;
const H = 1920;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDotTexture(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let x = 0; x < W; x += 24) {
    for (let y = 0; y < H; y += 24) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  roundRect(ctx, x, y, 70, 50, 8);
  ctx.strokeStyle = "#E4B84D";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(228,184,77,0.5)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 16 + i * 10);
    ctx.lineTo(x + 58, y + 16 + i * 10);
    ctx.stroke();
  }
}

export async function generateInviteCardCanvas(input: InviteCanvasInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#03010A");
  bg.addColorStop(0.5, "#0F0B1E");
  bg.addColorStop(1, "#080612");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const goldGlow = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, 400);
  goldGlow.addColorStop(0, "rgba(201,146,42,0.15)");
  goldGlow.addColorStop(1, "transparent");
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, W, H);

  const purpleGlow = ctx.createRadialGradient(0, H, 0, 0, H, 600);
  purpleGlow.addColorStop(0, "rgba(107,33,168,0.1)");
  purpleGlow.addColorStop(1, "transparent");
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, W, H);

  drawDotTexture(ctx);

  roundRect(ctx, 20, 20, W - 40, H - 40, 32);
  ctx.strokeStyle = "#C9922A";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 32, 32, W - 64, H - 64, 24);
  ctx.strokeStyle = "rgba(201,146,42,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#E4B84D";
  const corners = [
    [48, 48],
    [W - 48, 48],
    [48, H - 48],
    [W - 48, H - 48],
  ];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#E4B84D";
  ctx.font = "700 36px Cairo, sans-serif";
  ctx.fillText("TENEGTA", W / 2, 120);
  ctx.fillRect(W / 2 - 90, 140, 180, 1);
  ctx.font = "500 18px JetBrains Mono, monospace";
  ctx.fillStyle = "rgba(228,184,77,0.7)";
  ctx.fillText("ASCEND PARTNER", W / 2, 175);

  roundRect(ctx, 60, 340, W - 120, 380, 20);
  ctx.fillStyle = "rgba(15,11,30,0.9)";
  ctx.fill();
  ctx.strokeStyle = "#C9922A";
  ctx.lineWidth = 2;
  ctx.stroke();
  drawChip(ctx, W - 160, 370);

  ctx.fillStyle = "#F5F0E8";
  ctx.font = "700 52px Cairo, sans-serif";
  ctx.fillText(input.name, W / 2, 500);
  ctx.fillStyle = "#E4B84D";
  ctx.font = "500 18px JetBrains Mono, monospace";
  ctx.fillText(input.tier.toUpperCase(), W / 2, 560);
  ctx.font = "500 20px JetBrains Mono, monospace";
  ctx.fillText(`◆ ${input.token} ◆`, W / 2, 670);

  ctx.font = "700 72px Georgia, serif";
  ctx.fillStyle = "rgba(201,146,42,0.25)";
  ctx.fillText("«", W / 2 - 420, 820);
  ctx.fillText("»", W / 2 + 420, 920);

  ctx.fillStyle = "rgba(245,240,232,0.85)";
  ctx.font = "400 24px Cairo, sans-serif";
  const msg = input.message.slice(0, 120);
  const words = msg.split(/\s+/);
  let line = "";
  let y = 860;
  const maxWidth = 880;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, W / 2, y);
      line = word;
      y += 40;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, W / 2, y);

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, input.inviteUrl, {
    width: 280,
    margin: 2,
    color: { dark: "#E4B84D", light: "#0A0615" },
  });

  ctx.fillStyle = "#E4B84D";
  ctx.font = "600 20px Cairo, sans-serif";
  ctx.fillText("امسح للانضمام", W / 2, 1120);

  const qrX = (W - 280) / 2;
  const qrY = 1150;
  roundRect(ctx, qrX - 8, qrY - 8, 296, 296, 8);
  ctx.strokeStyle = "#C9922A";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.drawImage(qrCanvas, qrX, qrY, 280, 280);

  ctx.fillStyle = "rgba(228,184,77,0.6)";
  ctx.font = "400 16px JetBrains Mono, monospace";
  ctx.fillText(input.inviteUrl.replace(/^https?:\/\//, ""), W / 2, 1480);

  ctx.fillStyle = "#E4B84D";
  ctx.font = "600 24px Cairo, sans-serif";
  ctx.fillText("tenegta.com", W / 2, 1820);
  ctx.font = "400 14px JetBrains Mono, monospace";
  ctx.fillStyle="rgba(168,152,200,0.8)";
  ctx.fillText(input.scope, W / 2, 1860);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

export function downloadInviteBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
