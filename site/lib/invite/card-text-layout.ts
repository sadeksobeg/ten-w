const LRI = "\u2066";
const PDI = "\u2069";

/** Latin tokens, URLs, and alphanumeric runs embedded in Arabic card copy. */
const LATIN_RUN = /[A-Za-z0-9][A-Za-z0-9@#_.\-/·:]*/g;

/** Normalize spacing and isolate LTR runs so mixed paragraphs render in correct order. */
export function prepareCardMessageText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(LATIN_RUN, (match) => `${LRI}${match}${PDI}`);
}

export function wrapTextLines(
  text: string,
  measure: (line: string) => number,
  maxWidth: number,
): string[] {
  const words = prepareCardMessageText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function estimateLineWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(char)) {
      width += fontSize * 0.58;
    } else if (/\s/.test(char)) {
      width += fontSize * 0.28;
    } else {
      width += fontSize * 0.52;
    }
  }
  return width;
}

export function wrapTextLinesEstimated(
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  return wrapTextLines(text, (line) => estimateLineWidth(line, fontSize), maxWidth);
}

export function drawWrappedRtlText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const prevDirection = ctx.direction;
  const prevAlign = ctx.textAlign;

  ctx.direction = "rtl";
  ctx.textAlign = "center";

  const lines = wrapTextLines(text, (line) => ctx.measureText(line).width, maxWidth);
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += lineHeight;
  }

  ctx.direction = prevDirection;
  ctx.textAlign = prevAlign;
  return y;
}
