import type { SystemType, VisualizationConfig } from "@/lib/system-visualizer";

export type SceneDrawArgs = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  config: VisualizationConfig;
  time: number;
  locale: "ar" | "en" | "fr";
  reduced: boolean;
};

export function setupCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function fillBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primary: string,
) {
  ctx.fillStyle = "#050807";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, hexToRgba(primary, 0.14));
  g.addColorStop(0.55, "rgba(8, 10, 12, 0.5)");
  g.addColorStop(1, "#040504");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  step = 28,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  labels: [string, string, string],
  values: [string, string, string],
  accent: string,
) {
  const pad = 10;
  const boxW = Math.min(118, (w - pad * 4) / 3);
  for (let i = 0; i < 3; i++) {
    const x = pad + i * (boxW + 6);
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.strokeStyle = hexToRgba(accent, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, pad, boxW, 38, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 8px system-ui,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(labels[i], x + 8, pad + 12);
    ctx.fillStyle = "#fff";
    ctx.font = "600 12px ui-monospace,monospace";
    ctx.fillText(values[i], x + 8, pad + 28);
  }
}

function drawNodeStrip(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: VisualizationConfig,
  locale: "ar" | "en" | "fr",
  primary: string,
) {
  const nodes = config.nodes.slice(0, 6);
  const gap = w / (nodes.length + 1);
  const y = h - 36;
  nodes.forEach((n, i) => {
    const x = gap * (i + 1);
    const label = locale === "ar" ? n.label.ar : n.label.en;
    const short = label.length > 14 ? `${label.slice(0, 13)}…` : label;
    ctx.fillStyle = hexToRgba(primary, 0.12);
    ctx.strokeStyle = hexToRgba(primary, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - 52, y - 14, 104, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "500 9px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(short, x, y + 4);
  });
}

function sceneAi({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const cx = w * 0.5;
  const cy = h * 0.48;
  const phase = reduced ? 0 : time;

  const bars = 28;
  const inLeft = w * 0.04;
  const inW = w * 0.11;
  const bw = inW / bars;
  for (let i = 0; i < bars; i++) {
    const amp = 0.2 + 0.8 * Math.abs(Math.sin(phase * 1.1 + i * 0.4));
    const bh = h * 0.35 * amp;
    const bx = inLeft + i * bw;
    const by = cy - bh * 0.5;
    const g = ctx.createLinearGradient(bx, by + bh, bx, by);
    g.addColorStop(0, hexToRgba(primary, 0.2));
    g.addColorStop(1, hexToRgba(accent, 0.75));
    ctx.fillStyle = g;
    ctx.fillRect(bx, by, bw * 0.85, bh);
  }

  const outLeft = w * 0.86;
  const obars = 7;
  for (let i = 0; i < obars; i++) {
    const amp = 0.15 + 0.85 * Math.sin(phase * 0.8 + i * 0.65) ** 2;
    const bh = h * 0.22 * amp;
    ctx.fillStyle = hexToRgba(secondary, 0.35 + 0.45 * amp);
    ctx.fillRect(outLeft + i * 12, cy - bh, 10, bh);
  }

  const n = 42;
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + i * 0.3;
    const rad = 55 + (i % 7) * 14 + Math.sin(i * 0.7 + phase) * 12;
    nodes.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad * 0.85 });
  }
  ctx.strokeStyle = hexToRgba(secondary, 0.12);
  ctx.lineWidth = 0.6;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 72) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  if (!reduced) {
    for (let k = 0; k < 24; k++) {
      const a = nodes[k % n];
      const b = nodes[(k * 7 + 3) % n];
      const t = (phase * 0.35 + k * 0.04) % 1;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      ctx.fillStyle = hexToRgba(accent, 0.85);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const node of nodes) {
    ctx.fillStyle = hexToRgba(primary, 0.85);
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const conf = 0.88 + 0.1 * Math.sin(phase * 0.6);
  drawHud(
    ctx,
    w,
    locale === "ar" ? ["ثقة", "رموز/ث", "خسارة"] : ["Confidence", "Tok/s", "Loss"],
    [`${(conf * 100).toFixed(1)}%`, `${Math.floor(900 + 600 * Math.sin(phase))}`, `${(0.01 + 0.02 * Math.sin(phase * 0.4)).toFixed(3)}`],
    primary,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneCyber({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  drawGrid(ctx, w, h, hexToRgba(secondary, 0.06));
  const cx = w * 0.5;
  const cy = h * 0.46;
  const R = Math.min(w, h) * 0.34;
  const sweep = reduced ? 0 : (time * 0.9) % (Math.PI * 2);

  for (let i = 1; i <= 4; i++) {
    ctx.strokeStyle = hexToRgba(secondary, 0.15);
    ctx.beginPath();
    ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(sweep);
  const g = ctx.createLinearGradient(0, 0, R, 0);
  g.addColorStop(0, hexToRgba(accent, 0.35));
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, R, -0.4, 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const blipCount = 8;
  for (let i = 0; i < blipCount; i++) {
    const a = (i / blipCount) * Math.PI * 2 + 0.3;
    const r = R * (0.35 + (i % 3) * 0.18);
    const bx = cx + Math.cos(a) * r;
    const by = cy + Math.sin(a) * r;
    const threat = i % 4 === 0;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i);
    ctx.fillStyle = threat ? hexToRgba(accent, 0.25 + pulse * 0.35) : hexToRgba(secondary, 0.2);
    ctx.beginPath();
    ctx.arc(bx, by, 6 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();
    if (threat && !reduced) {
      ctx.strokeStyle = hexToRgba(accent, 0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, 10 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["تهديدات", "محاولة/د", "تغطية"] : ["Threats", "RPM", "Coverage"],
    [`${3 + Math.floor(2 * Math.sin(time))}`, `${36 + Math.floor(8 * Math.sin(time * 1.2))}`, `${(94 + 4 * Math.sin(time * 0.5)).toFixed(0)}%`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneSoftware({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const cx = w * 0.5;
  const cy = h * 0.46;
  const mods = config.nodes.slice(0, 5).map((n, i) => {
    const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const r = Math.min(w, h) * 0.28;
    return {
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r,
      label: locale === "ar" ? n.label.ar : n.label.en,
    };
  });

  ctx.strokeStyle = hexToRgba(secondary, 0.2);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < mods.length; i++) {
    const a = mods[i];
    const b = mods[(i + 1) % mods.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (!reduced) {
      const t = (time * 0.25 + i * 0.15) % 1;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      ctx.fillStyle = hexToRgba(accent, 0.9);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = hexToRgba(primary, 0.25);
  ctx.strokeStyle = hexToRgba(accent, 0.7);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 36, cy - 22, 72, 44, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "600 10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("API", cx, cy + 4);

  for (const m of mods) {
    ctx.fillStyle = hexToRgba(primary, 0.15);
    ctx.strokeStyle = hexToRgba(secondary, 0.5);
    ctx.beginPath();
    ctx.roundRect(m.x - 40, m.y - 16, 80, 32, 8);
    ctx.fill();
    ctx.stroke();
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["p99", "طلب/ث", "صحة"] : ["p99 ms", "RPS", "Healthy"],
    [`${28 + Math.floor(15 * Math.sin(time))}`, `${(2100 + 800 * Math.sin(time * 1.1)).toFixed(0)}`, `${7 + (Math.sin(time) > 0 ? 1 : 0)}/8`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneInfra({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const lanes = 5;
  const laneH = (h * 0.5) / lanes;
  const top = h * 0.22;
  const regions = locale === "ar" ? ["أوروبا", "الشرق", "آسيا", "أمريكا", "محلي"] : ["EU", "MENA", "APAC", "US", "LOCAL"];

  for (let L = 0; L < lanes; L++) {
    const y = top + L * laneH;
    const load = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(time * 0.65 + L));
    const barW = w * 0.55 * load;
    const bx = w * 0.18;
    const gg = ctx.createLinearGradient(bx, y, bx + barW, y);
    gg.addColorStop(0, hexToRgba(primary, 0.15));
    gg.addColorStop(1, hexToRgba(accent, 0.55));
    ctx.fillStyle = gg;
    ctx.fillRect(bx, y + laneH * 0.28, barW, laneH * 0.44);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "500 9px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(regions[L] ?? "", bx, y + laneH * 0.2);
    if (!reduced) {
      const px = bx + ((time * 80 + L * 40) % (barW + 20));
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, y + laneH * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = hexToRgba(secondary, 0.35);
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, top);
  ctx.lineTo(w * 0.5, top + lanes * laneH);
  ctx.stroke();
  ctx.setLineDash([]);

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["طلب/ث", "SLO", "مناطق"] : ["RPS", "SLO", "Regions"],
    [`${(9 + 5 * Math.sin(time * 0.5)).toFixed(1)}k`, `${(98.8 + 0.8 * Math.sin(time * 0.35)).toFixed(2)}%`, "5"],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneFintech({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const stages = Math.min(config.nodes.length, 5);
  const gap = w / (stages + 1);
  const y = h * 0.46;

  for (let i = 0; i < stages - 1; i++) {
    const x1 = gap * (i + 1);
    const x2 = gap * (i + 2);
    ctx.strokeStyle = hexToRgba(secondary, 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1 + 28, y);
    ctx.lineTo(x2 - 28, y);
    ctx.stroke();
    if (!reduced) {
      const t = (time * 0.4 + i * 0.2) % 1;
      const px = x1 + 28 + (x2 - x1 - 56) * t;
      ctx.fillStyle = hexToRgba(accent, 0.95);
      ctx.beginPath();
      ctx.arc(px, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < stages; i++) {
    const x = gap * (i + 1);
    ctx.fillStyle = hexToRgba(primary, 0.18);
    ctx.strokeStyle = hexToRgba(accent, i === 2 ? 0.8 : 0.4);
    ctx.lineWidth = i === 2 ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x - 30, y - 28, 60, 56, 10);
    ctx.fill();
    ctx.stroke();
    if (i === 2) {
      ctx.fillStyle = hexToRgba(accent, 0.25);
      ctx.beginPath();
      ctx.arc(x, y - 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 5, y - 14, 10, 8);
    }
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["معاملات", "احتيال", "امتثال"] : ["TPS", "Fraud", "Compliance"],
    [`${(1200 + 400 * Math.sin(time)).toFixed(0)}`, `${(0.02 + 0.01 * Math.sin(time * 2)).toFixed(2)}%`, "OK"],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneHealth({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const y = h * 0.5;
  ctx.strokeStyle = hexToRgba(accent, 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  const steps = Math.floor(w / 4);
  for (let i = 0; i < steps; i++) {
    const x = (i / steps) * w;
    const beat =
      Math.sin((i / steps) * Math.PI * 8 + time * 4) *
        Math.exp(-(((i / steps) * 4) % 1) ** 2 * 8) *
        28 +
      Math.sin(i * 0.2 + time) * 4;
    if (i === 0) ctx.moveTo(x, y + beat);
    else ctx.lineTo(x, y + beat);
  }
  ctx.stroke();

  const panels = [
    { x: w * 0.12, label: locale === "ar" ? "نبض" : "HR", val: `${72 + Math.floor(8 * Math.sin(time))}` },
    { x: w * 0.38, label: locale === "ar" ? "SpO₂" : "SpO₂", val: `${96 + Math.floor(2 * Math.sin(time * 0.7))}%` },
    { x: w * 0.64, label: locale === "ar" ? "سرير" : "Beds", val: `${84 + Math.floor(5 * Math.sin(time * 0.4))}%` },
  ];
  for (const p of panels) {
    ctx.fillStyle = hexToRgba(primary, 0.12);
    ctx.strokeStyle = hexToRgba(secondary, 0.4);
    ctx.beginPath();
    ctx.roundRect(p.x - 42, h * 0.18, 84, 52, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "500 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(p.label, p.x, h * 0.18 + 18);
    ctx.fillStyle = accent;
    ctx.font = "700 16px ui-monospace";
    ctx.fillText(p.val, p.x, h * 0.18 + 38);
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["مرضى", "زمن", "تكامل"] : ["Patients", "Latency", "FHIR"],
    [`${(420 + 80 * Math.sin(time * 0.5)).toFixed(0)}`, `${(45 + 12 * Math.sin(time)).toFixed(0)}ms`, "HL7"],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneLogistics({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  drawGrid(ctx, w, h, hexToRgba(secondary, 0.05), 32);
  const hubs = [
    { x: w * 0.15, y: h * 0.35 },
    { x: w * 0.45, y: h * 0.55 },
    { x: w * 0.75, y: h * 0.4 },
    { x: w * 0.55, y: h * 0.72 },
  ];
  const routes = [
    [0, 1],
    [1, 2],
    [1, 3],
    [0, 3],
  ];
  for (const [a, b] of routes) {
    const p1 = hubs[a];
    const p2 = hubs[b];
    ctx.strokeStyle = hexToRgba(secondary, 0.35);
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    if (!reduced) {
      const t = (time * 0.3 + a * 0.15) % 1;
      const px = p1.x + (p2.x - p1.x) * t;
      const py = p1.y + (p2.y - p1.y) * t;
      ctx.fillStyle = hexToRgba(accent, 0.95);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const hub of hubs) {
    ctx.fillStyle = hexToRgba(primary, 0.2);
    ctx.strokeStyle = hexToRgba(accent, 0.6);
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["شحنات", "تأخير", "أسطول"] : ["Shipments", "Delay", "Fleet"],
    [`${(180 + 40 * Math.sin(time)).toFixed(0)}`, `${(4 + 3 * Math.abs(Math.sin(time))).toFixed(0)}%`, `${12 + Math.floor(4 * Math.sin(time * 0.8))}`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneIot({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const gw = { x: w * 0.5, y: h * 0.46 };
  const sensors = Array.from({ length: 10 }, (_, i) => {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = Math.min(w, h) * 0.32;
    return { x: gw.x + Math.cos(ang) * r, y: gw.y + Math.sin(ang) * r * 0.9 };
  });

  if (!reduced) {
    for (let i = 0; i < sensors.length; i++) {
      const s = sensors[i];
      const wave = ((time * 1.2 + i * 0.2) % 1) * 50;
      ctx.strokeStyle = hexToRgba(accent, 0.25 * (1 - wave / 50));
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8 + wave, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  for (const s of sensors) {
    ctx.strokeStyle = hexToRgba(secondary, 0.35);
    ctx.beginPath();
    ctx.moveTo(gw.x, gw.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.fillStyle = hexToRgba(primary, 0.9);
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = hexToRgba(accent, 0.25);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(gw.x - 34, gw.y - 24, 68, 48, 10);
  ctx.fill();
  ctx.stroke();

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["أجهزة", "رسائل/ث", "تأخر"] : ["Devices", "Msg/s", "Lag"],
    [`${(240 + 60 * Math.sin(time)).toFixed(0)}`, `${(8 + 4 * Math.sin(time * 1.3)).toFixed(1)}k`, `${(12 + 8 * Math.sin(time * 0.6)).toFixed(0)}ms`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneData({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const cols = 4;
  const colW = w / (cols + 1);
  const y = h * 0.44;
  const labels =
    locale === "ar"
      ? ["استيعاب", "تحويل", "مستودع", "تحليلات"]
      : ["Ingest", "Transform", "Warehouse", "Analytics"];

  for (let i = 0; i < cols; i++) {
    const x = colW * (i + 1);
    const hBar = 40 + 50 * (0.5 + 0.5 * Math.sin(time * 0.7 + i));
    ctx.fillStyle = hexToRgba(primary, 0.12 + i * 0.04);
    ctx.strokeStyle = hexToRgba(secondary, 0.45);
    ctx.beginPath();
    ctx.roundRect(x - 36, y - hBar, 72, hBar * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "500 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(labels[i] ?? "", x, y + hBar + 16);
    if (i < cols - 1 && !reduced) {
      const t = (time * 0.35 + i * 0.18) % 1;
      const px = x + 36 + (colW - 72) * t;
      ctx.fillStyle = hexToRgba(accent, 0.9);
      for (let d = 0; d < 3; d++) {
        ctx.fillRect(px, y - 4 + d * 5, 6, 3);
      }
    }
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["سجلات", "ETL", "جودة"] : ["Rows", "ETL", "Quality"],
    [`${(2.1 + 0.4 * Math.sin(time)).toFixed(1)}M`, `${(98 + 2 * Math.sin(time * 0.5)).toFixed(0)}%`, `${(99.1 + 0.5 * Math.sin(time)).toFixed(1)}%`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

function sceneEcommerce({ ctx, w, h, config, time, locale, reduced }: SceneDrawArgs) {
  const { primary, secondary, accent } = config.palette;
  fillBg(ctx, w, h, primary);
  const funnelW = w * 0.5;
  const cx = w * 0.5;
  const levels = 4;
  for (let i = 0; i < levels; i++) {
    const fw = funnelW * (1 - i * 0.18);
    const fh = h * 0.1;
    const y = h * 0.22 + i * (fh + 10);
    const load = 0.55 + 0.45 * Math.sin(time * 0.8 + i);
    ctx.fillStyle = hexToRgba(primary, 0.1 + load * 0.12);
    ctx.strokeStyle = hexToRgba(secondary, 0.4);
    ctx.beginPath();
    ctx.moveTo(cx - fw / 2, y);
    ctx.lineTo(cx + fw / 2, y);
    ctx.lineTo(cx + fw / 2 - 20, y + fh);
    ctx.lineTo(cx - fw / 2 + 20, y + fh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (!reduced && i < levels - 1) {
      const t = (time * 0.5 + i * 0.12) % 1;
      const py = y + fh * t;
      ctx.fillStyle = hexToRgba(accent, 0.85);
      ctx.beginPath();
      ctx.arc(cx, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHud(
    ctx,
    w,
    locale === "ar" ? ["تحويل", "سلة", "إيراد"] : ["CVR", "Cart", "GMV"],
    [`${(3.2 + 0.8 * Math.sin(time)).toFixed(1)}%`, `${(420 + 120 * Math.sin(time * 0.9)).toFixed(0)}`, `$${(48 + 12 * Math.sin(time * 0.6)).toFixed(0)}k`],
    accent,
  );
  drawNodeStrip(ctx, w, h, config, locale, primary);
}

const SCENES: Record<SystemType, (args: SceneDrawArgs) => void> = {
  ai: sceneAi,
  cyber: sceneCyber,
  software: sceneSoftware,
  infra: sceneInfra,
  fintech: sceneFintech,
  health: sceneHealth,
  logistics: sceneLogistics,
  iot: sceneIot,
  data: sceneData,
  ecommerce: sceneEcommerce,
};

export function drawSystemScene(args: SceneDrawArgs): void {
  const fn = SCENES[args.config.type] ?? sceneSoftware;
  fn(args);
  ctxVignette(args.ctx, args.w, args.h);
}

function ctxVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const v = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  v.addColorStop(0, "transparent");
  v.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}
