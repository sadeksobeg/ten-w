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
  ctx.fillStyle = "rgba(201,146,42,0.07)";
  for (let x = 0; x < W; x += 24) {
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCorner(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 8);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fillStyle = "#C9922A";
  ctx.fill();
  ctx.strokeStyle = "rgba(201,146,42,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(0, 48);
  ctx.stroke();
  ctx.restore();
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  roundRect(ctx, x, y, 60, 44, 6);
  ctx.fillStyle = "#1A1430";
  ctx.fill();
  ctx.strokeStyle = "rgba(201,146,42,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = "rgba(201,146,42,0.5)";
  ctx.beginPath();
  ctx.moveTo(x + 30, y);
  ctx.lineTo(x + 30, y + 44);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 12 + i * 10);
    ctx.lineTo(x + 48, y + 12 + i * 10);
    ctx.stroke();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y;
}

export async function generateInviteCardCanvas(input: InviteCanvasInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.fillStyle = "#03010A";
  ctx.fillRect(0, 0, W, H);

  const goldGlow = ctx.createRadialGradient(540, 200, 0, 540, 200, 500);
  goldGlow.addColorStop(0, "rgba(201,146,42,0.2)");
  goldGlow.addColorStop(1, "transparent");
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, W, H);

  const purpleGlow = ctx.createRadialGradient(100, 1700, 0, 100, 1700, 600);
  purpleGlow.addColorStop(0, "rgba(107,33,168,0.15)");
  purpleGlow.addColorStop(1, "transparent");
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, W, H);

  drawDotTexture(ctx);

  const frameGrad = ctx.createLinearGradient(30, 30, W - 30, H - 30);
  frameGrad.addColorStop(0, "#8B6514");
  frameGrad.addColorStop(0.5, "#E4B84D");
  frameGrad.addColorStop(1, "#8B6514");
  roundRect(ctx, 30, 30, 1020, 1860, 32);
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 2;
  ctx.stroke();

  roundRect(ctx, 50, 50, 980, 1820, 24);
  ctx.strokeStyle = "rgba(201,146,42,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  drawCorner(ctx, 70, 70, 0);
  drawCorner(ctx, 1010, 70, Math.PI / 2);
  drawCorner(ctx, 70, 1850, -Math.PI / 2);
  drawCorner(ctx, 1010, 1850, Math.PI);

  ctx.textAlign = "center";
  ctx.fillStyle = "#E4B84D";
  ctx.font = "bold 44px Cairo, Arial, sans-serif";
  ctx.fillText("TENEGTA", 540, 155);

  ctx.strokeStyle = "rgba(201,146,42,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(380, 175);
  ctx.lineTo(700, 175);
  ctx.stroke();

  ctx.font = "16px JetBrains Mono, monospace";
  ctx.fillStyle = "rgba(201,146,42,0.7)";
  ctx.fillText("ASCEND PARTNER", 540, 210);

  const cardGrad = ctx.createLinearGradient(80, 280, 1000, 660);
  cardGrad.addColorStop(0, "#0F0B1E");
  cardGrad.addColorStop(0.5, "#1A1530");
  cardGrad.addColorStop(1, "#0F0B1E");
  roundRect(ctx, 80, 280, 920, 380, 20);
  ctx.fillStyle = cardGrad;
  ctx.fill();
  const cardBorder = ctx.createLinearGradient(80, 280, 1000, 660);
  cardBorder.addColorStop(0, "#8B6514");
  cardBorder.addColorStop(0.5, "#E4B84D");
  cardBorder.addColorStop(1, "#8B6514");
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawChip(ctx, 820, 310);

  ctx.fillStyle = "#F5F0E8";
  ctx.font = "bold 64px Cairo, Arial, sans-serif";
  ctx.fillText(input.name, 540, 430);

  ctx.fillStyle = "#C9922A";
  ctx.font = "18px JetBrains Mono, monospace";
  ctx.fillText(input.tier.toUpperCase(), 540, 480);

  ctx.fillStyle = "rgba(201,146,42,0.8)";
  ctx.font = "20px JetBrains Mono, monospace";
  ctx.fillText(`◆  ${input.token}  ◆`, 540, 620);

  ctx.font = "bold 100px Georgia, serif";
  ctx.fillStyle = "rgba(201,146,42,0.15)";
  ctx.textAlign = "left";
  ctx.fillText("«", 80, 780);
  ctx.textAlign = "right";
  ctx.fillText("»", 1000, 900);
  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(245,240,232,0.85)";
  ctx.font = "26px Cairo, Arial, sans-serif";
  wrapText(ctx, input.message.slice(0, 200), 540, 740, 800, 44);

  const divider = ctx.createLinearGradient(200, 960, 880, 960);
  divider.addColorStop(0, "transparent");
  divider.addColorStop(0.5, "#C9922A");
  divider.addColorStop(1, "transparent");
  ctx.strokeStyle = divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 960);
  ctx.lineTo(880, 960);
  ctx.stroke();

  ctx.fillStyle = "#C9922A";
  ctx.font = "22px Cairo, Arial, sans-serif";
  ctx.fillText("امسح للانضمام", 540, 1040);

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, input.inviteUrl, {
    width: 280,
    margin: 2,
    color: { dark: "#C9922A", light: "#03010A" },
  });

  const qrX = 400;
  const qrY = 1070;
  roundRect(ctx, qrX - 4, qrY - 4, 288, 288, 6);
  ctx.strokeStyle = "rgba(201,146,42,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.drawImage(qrCanvas, qrX, qrY, 280, 280);

  const shortUrl = input.inviteUrl.replace(/^https?:\/\//, "");
  ctx.fillStyle = "rgba(201,146,42,0.6)";
  ctx.font = "18px JetBrains Mono, monospace";
  ctx.fillText(shortUrl, 540, 1385);

  ctx.fillStyle = "rgba(201,146,42,0.5)";
  for (let i = 0; i < 5; i++) {
    const sx = 430 + i * 55;
    drawStar(ctx, sx, 1450, 6);
  }

  ctx.strokeStyle = "rgba(201,146,42,0.3)";
  ctx.beginPath();
  ctx.moveTo(300, 1480);
  ctx.lineTo(780, 1480);
  ctx.stroke();

  ctx.fillStyle = "rgba(201,146,42,0.8)";
  ctx.font = "24px Cairo, Arial, sans-serif";
  ctx.fillText("tenegta.com", 540, 1540);

  ctx.fillStyle = "rgba(201,146,42,0.4)";
  ctx.font = "16px Cairo, Arial, sans-serif";
  ctx.fillText("ASCEND · PARTNER NETWORK · 2026", 540, 1580);

  ctx.strokeStyle = "rgba(201,146,42,0.2)";
  ctx.beginPath();
  ctx.moveTo(50, 1880);
  ctx.lineTo(300, 1700);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1030, 1880);
  ctx.lineTo(780, 1700);
  ctx.stroke();

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
