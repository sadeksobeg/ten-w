export function drawSparkline(
  ctx: CanvasRenderingContext2D,
  data: number[],
  width: number,
  height: number,
  color: string,
) {
  if (data.length < 2) return;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

export function drawLineChart(
  canvas: HTMLCanvasElement,
  thisWeek: number[],
  lastWeek: number[],
  labels: string[],
  animProgress: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const pad = { t: 20, r: 16, b: 28, l: 40 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const max = Math.max(...thisWeek, ...lastWeek) * 1.1;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (chartH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }

  const drawLine = (data: number[], color: string, dashed: boolean) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.beginPath();
    const points = Math.max(2, Math.floor(data.length * animProgress));
    for (let i = 0; i < points; i++) {
      const x = pad.l + (i / (data.length - 1)) * chartW;
      const y = pad.t + chartH - (data[i] / max) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawLine(lastWeek, "rgba(107,33,168,0.7)", true);
  drawLine(thisWeek, "#f5c518", false);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  labels.forEach((label, i) => {
    const x = pad.l + (i / (labels.length - 1)) * chartW;
    ctx.fillText(label, x, h - 6);
  });
}
