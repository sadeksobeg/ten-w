const LRI = "\u2066";
const PDI = "\u2069";

export const CARD_MESSAGE_MAX_CHARS = 420;
export const CARD_MESSAGE_MAX_WIDTH = 860;
export const CARD_MESSAGE_RIGHT_X = 960;
export const CARD_MESSAGE_START_Y = 740;
export const CARD_MESSAGE_LINE_HEIGHT = 42;
export const CARD_MESSAGE_FONT_SIZE = 26;
export const CARD_MESSAGE_MAX_LINES = 6;

/** Latin tokens, URLs, and alphanumeric runs embedded in Arabic card copy. */
const LATIN_RUN = /[A-Za-z0-9][A-Za-z0-9@#_.\-/·:]*/g;

/** Normalize spacing and isolate LTR runs so mixed paragraphs render in correct order. */
export function prepareCardMessageText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(LATIN_RUN, (match) => `${LRI}${match}${PDI}`);
}

/** Truncate at a word boundary so PNG/SVG export never cuts mid-token (e.g. tenegta.com). */
export function truncateCardMessage(text: string, maxChars = CARD_MESSAGE_MAX_CHARS): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;

  const cut = normalized.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.55) {
    return `${cut.slice(0, lastSpace).trim()}…`;
  }
  return `${cut.trim()}…`;
}

function splitLongWord(word: string, measure: (line: string) => number, maxWidth: number): string[] {
  if (measure(word) <= maxWidth) return [word];

  const parts: string[] = [];
  let chunk = "";
  for (const char of word) {
    const candidate = chunk + char;
    if (measure(candidate) > maxWidth && chunk) {
      parts.push(chunk);
      chunk = char;
    } else {
      chunk = candidate;
    }
  }
  if (chunk) parts.push(chunk);
  return parts.length > 0 ? parts : [word];
}

export function wrapTextLines(
  text: string,
  measure: (line: string) => number,
  maxWidth: number,
): string[] {
  const words = prepareCardMessageText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const rawWord of words) {
    const wordParts = splitLongWord(rawWord, measure, maxWidth);
    for (const word of wordParts) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function estimateLineWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(char)) {
      width += fontSize * 0.64;
    } else if (/\s/.test(char)) {
      width += fontSize * 0.3;
    } else {
      width += fontSize * 0.56;
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

export function layoutCardMessageLines(
  text: string,
  maxWidth = CARD_MESSAGE_MAX_WIDTH,
  baseFontSize = CARD_MESSAGE_FONT_SIZE,
  maxLines = CARD_MESSAGE_MAX_LINES,
): { lines: string[]; fontSize: number; lineHeight: number } {
  const prepared = truncateCardMessage(text);
  let fontSize = baseFontSize;
  let lineHeight = CARD_MESSAGE_LINE_HEIGHT;

  while (fontSize >= 20) {
    const lines = wrapTextLinesEstimated(prepared, maxWidth, fontSize);
    if (lines.length <= maxLines) {
      lineHeight = Math.round(fontSize * 1.62);
      return { lines, fontSize, lineHeight };
    }
    fontSize -= 2;
  }

  const lines = wrapTextLinesEstimated(prepared, maxWidth, 20);
  return {
    lines: lines.slice(0, maxLines),
    fontSize: 20,
    lineHeight: 34,
  };
}

export function drawWrappedRtlText(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  startY: number,
  maxWidth: number,
  lineHeight = CARD_MESSAGE_LINE_HEIGHT,
): number {
  const prevDirection = ctx.direction;
  const prevAlign = ctx.textAlign;

  ctx.direction = "rtl";
  ctx.textAlign = "right";

  const prepared = truncateCardMessage(text);
  let lines = wrapTextLines(prepared, (line) => ctx.measureText(line).width, maxWidth);
  let lh = lineHeight;

  while (lines.length > CARD_MESSAGE_MAX_LINES && lh > 32) {
    lh -= 2;
    const smaller = Math.max(20, CARD_MESSAGE_FONT_SIZE - (CARD_MESSAGE_LINE_HEIGHT - lh));
    ctx.font = ctx.font.replace(/\d+px/, `${smaller}px`);
    lines = wrapTextLines(prepared, (line) => ctx.measureText(line).width, maxWidth);
  }

  let y = startY;
  for (const line of lines.slice(0, CARD_MESSAGE_MAX_LINES)) {
    ctx.fillText(line, rightX, y);
    y += lh;
  }

  ctx.direction = prevDirection;
  ctx.textAlign = prevAlign;
  return y;
}
