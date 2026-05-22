"use client";

export type CompressImageOptions = {
  maxEdge?: number;
  jpegQuality?: number;
  /** Always output JPEG (recommended for photo covers). */
  forceJpeg?: boolean;
  /** Target max length of data URL string (base64). */
  maxBase64Len?: number;
};

const DEFAULTS: Required<CompressImageOptions> = {
  maxEdge: 512,
  jpegQuality: 0.82,
  forceJpeg: false,
  maxBase64Len: 0,
};

function renderToDataUrl(
  bitmap: ImageBitmap,
  maxEdge: number,
  jpegQuality: number,
  forceJpeg: boolean,
): string {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (forceJpeg) return canvas.toDataURL("image/jpeg", jpegQuality);
  return canvas.toDataURL("image/jpeg", jpegQuality);
}

export async function compressImageFile(
  file: File,
  opts: CompressImageOptions = {},
): Promise<string> {
  const base = { ...DEFAULTS, ...opts };
  let edge = base.maxEdge;
  let quality = base.jpegQuality;
  const bitmap = await createImageBitmap(file);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const out = renderToDataUrl(bitmap, edge, quality, base.forceJpeg);
    if (!base.maxBase64Len || out.length <= base.maxBase64Len) {
      bitmap.close();
      return out;
    }
    if (quality > 0.52) {
      quality -= 0.07;
      continue;
    }
    if (edge > 400) {
      edge = Math.round(edge * 0.88);
      quality = base.jpegQuality;
      continue;
    }
    bitmap.close();
    return out;
  }

  const fallback = await createImageBitmap(file);
  const out = renderToDataUrl(fallback, edge, 0.5, base.forceJpeg);
  fallback.close();
  return out;
}

/** Re-compress an existing data URL (e.g. before server action submit). */
export async function shrinkDataUrl(
  dataUrl: string,
  opts: CompressImageOptions = {},
): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) return dataUrl;
  const base = { ...DEFAULTS, ...opts };
  if (base.maxBase64Len && dataUrl.length <= base.maxBase64Len) return dataUrl;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load"));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  let edge = base.maxEdge;
  let quality = base.jpegQuality;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL("image/jpeg", quality);
    if (!base.maxBase64Len || out.length <= base.maxBase64Len) return out;
    if (quality > 0.52) {
      quality -= 0.07;
      continue;
    }
    if (edge > 400) {
      edge = Math.round(edge * 0.88);
      quality = base.jpegQuality;
      continue;
    }
    return out;
  }

  return canvas.toDataURL("image/jpeg", 0.5);
}

/** Limits used for event cover uploads (client + server). */
export const EVENT_COVER_MAX_BASE64 = 1_500_000;

export const EVENT_COVER_COMPRESS_OPTS: CompressImageOptions = {
  maxEdge: 1280,
  jpegQuality: 0.85,
  forceJpeg: true,
  maxBase64Len: EVENT_COVER_MAX_BASE64 - 50_000,
};
