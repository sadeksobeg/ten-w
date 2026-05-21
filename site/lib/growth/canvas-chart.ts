export type ChartPoint = { label: string; value: number };

export type BarChartOptions = {
  rtl?: boolean;
  title?: string;
  valueFormat?: (n: number) => string;
  barColorStart?: string;
  barColorEnd?: string;
};

function setupCanvas(canvas: HTMLCanvasElement, height: number) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const w = canvas.clientWidth || 320;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  return { ctx, width: w, height };
}

export function drawBarChart(
  canvas: HTMLCanvasElement,
  data: ChartPoint[],
  options: BarChartOptions = {},
): void {
  const {
    rtl = false,
    valueFormat = (n) => String(n),
    barColorStart = "#B07D2B",
    barColorEnd = "#E4B84D",
  } = options;

  const setup = setupCanvas(canvas, 200);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { top: 16, right: 12, bottom: 36, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(pad.left, pad.top, chartW, chartH);

  const max = Math.max(1, ...data.map((d) => d.value));
  const barGap = 8;
  const barW = Math.max(12, (chartW - barGap * (data.length + 1)) / Math.max(1, data.length));

  data.forEach((point, i) => {
    const idx = rtl ? data.length - 1 - i : i;
    const p = data[idx]!;
    const x = pad.left + barGap + i * (barW + barGap);
    const h = (p.value / max) * chartH;
    const y = pad.top + chartH - h;
    const grad = ctx.createLinearGradient(0, y, 0, pad.top + chartH);
    grad.addColorStop(0, barColorEnd);
    grad.addColorStop(1, barColorStart);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, h);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.label, x + barW / 2, height - 10);
  });

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let hit: ChartPoint | undefined;
    for (let i = 0; i < data.length; i++) {
      const idx = rtl ? data.length - 1 - i : i;
      const point = data[idx]!;
      const x = pad.left + barGap + i * (barW + barGap);
      if (mx >= x && mx <= x + barW) hit = point;
    }
    canvas.title = hit ? `${hit.label}: ${valueFormat(hit.value)}` : "";
  };
}

export type LineChartOptions = {
  rtl?: boolean;
  valueFormat?: (n: number) => string;
  strokeColor?: string;
};

export function drawLineChart(
  canvas: HTMLCanvasElement,
  data: ChartPoint[],
  options: LineChartOptions = {},
): void {
  const { strokeColor = "#B07D2B", valueFormat = (n) => String(n) } = options;
  const setup = setupCanvas(canvas, 200);
  if (!setup || data.length < 2) return;
  const { ctx, width, height } = setup;
  const pad = { top: 16, right: 12, bottom: 36, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = chartW / (data.length - 1);

  ctx.beginPath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  data.forEach((p, i) => {
    const x = pad.left + i * step;
    const y = pad.top + chartH - (p.value / max) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  data.forEach((p, i) => {
    const x = pad.left + i * step;
    const y = pad.top + chartH - (p.value / max) * chartH;
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.label, x, height - 10);
  });

  canvas.title = data.map((d) => `${d.label}: ${valueFormat(d.value)}`).join(" · ");
}

export type DonutSegment = { label: string; value: number; color: string };

export function drawDonutChart(canvas: HTMLCanvasElement, segments: DonutSegment[]): void {
  const setup = setupCanvas(canvas, 220);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const cx = width / 2;
  const cy = height / 2 - 8;
  const outer = Math.min(width, height) * 0.32;
  const inner = outer * 0.55;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  ctx.clearRect(0, 0, width, height);
  let start = -Math.PI / 2;
  segments.forEach((seg) => {
    const slice = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, start, start + slice);
    ctx.arc(cx, cy, inner, start + slice, start, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    start += slice;
  });

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(total), cx, cy + 4);
}

export function drawHorizontalBarChart(
  canvas: HTMLCanvasElement,
  data: ChartPoint[],
  options: { rtl?: boolean; maxBars?: number } = {},
): void {
  const { maxBars = 10 } = options;
  const rows = data.slice(0, maxBars);
  const setup = setupCanvas(canvas, Math.max(160, rows.length * 28 + 24));
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { top: 12, right: 16, bottom: 12, left: 120 };
  const chartW = width - pad.left - pad.right;
  const rowH = (height - pad.top - pad.bottom) / Math.max(1, rows.length);
  const max = Math.max(1, ...rows.map((d) => d.value));

  ctx.clearRect(0, 0, width, height);
  rows.forEach((row, i) => {
    const y = pad.top + i * rowH + 4;
    const w = (row.value / max) * chartW;
    ctx.fillStyle = "rgba(176,125,43,0.35)";
    ctx.fillRect(pad.left, y, w, rowH - 8);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";
    const label =
      row.label.length > 18 ? `${row.label.slice(0, 16)}…` : row.label;
    ctx.fillText(label, 8, y + (rowH - 8) / 2 + 4);
    ctx.textAlign = "right";
    ctx.fillText(String(row.value), width - 8, y + (rowH - 8) / 2 + 4);
  });
}
