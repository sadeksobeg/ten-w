"use client";

export type ChronicleShareInput = {
  name: string;
  levelName: string;
  milestones: string[];
  locale: string;
};

export function renderChronicleShareCanvas(input: ChronicleShareInput): HTMLCanvasElement {
  const w = 1080;
  const h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const rtl = input.locale === "ar";

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#1a1208");
  grad.addColorStop(0.5, "#0a0a0f");
  grad.addColorStop(1, "#2a1f0a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(176,125,43,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, w - 64, h - 64);

  ctx.fillStyle = "#E4B84D";
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.textAlign = rtl ? "right" : "left";
  const titleX = rtl ? w - 72 : 72;
  ctx.fillText(rtl ? "سجل TENEGTA ASCEND" : "TENEGTA ASCEND Chronicle", titleX, 120);

  ctx.fillStyle = "#f0ede8";
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText(input.name, titleX, 200);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText(input.levelName, titleX, 250);

  input.milestones.slice(0, 3).forEach((m, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "22px system-ui, sans-serif";
    ctx.fillText(`• ${m}`, titleX, 340 + i * 56);
  });

  ctx.fillStyle = "rgba(176,125,43,0.8)";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("T.E.N.E.G.T.A", w / 2, h - 64);

  return canvas;
}
