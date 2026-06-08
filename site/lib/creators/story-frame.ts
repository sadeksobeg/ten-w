/** Renders a 9:16 TENEGTA story frame on canvas for creator screenshots. */
export async function renderCreatorStoryFrame(title: string): Promise<Blob> {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0a0612");
  gradient.addColorStop(0.45, "#12081f");
  gradient.addColorStop(1, "#1a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(228,184,77,0.35)";
  ctx.lineWidth = 6;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = "rgba(228,184,77,0.9)";
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("T.E.N.E.G.T.A", width / 2, 180);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 56px system-ui, sans-serif";
  const lines = wrapText(ctx, title, width - 160);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 420 + i * 72);
  });

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText("Creator Arena · ASCEND", width / 2, height - 220);

  ctx.fillStyle = "rgba(228,184,77,0.85)";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText("#TENEGTA", width / 2, height - 140);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("blob_failed"));
      else resolve(blob);
    }, "image/png");
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
