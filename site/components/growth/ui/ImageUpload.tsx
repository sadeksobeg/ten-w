"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Aspect = "16/9" | "1/1" | "4/3";

type Props = {
  value?: string;
  onChange: (base64: string) => void;
  aspectRatio?: Aspect;
  placeholder?: string;
  hint?: string;
  /** Max width/height after compress (default 512). */
  maxEdge?: number;
  /** JPEG quality 0–1 when not PNG (default 0.82). */
  jpegQuality?: number;
};

const aspectClass: Record<Aspect, string> = {
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
};

const MAX_BYTES = 2 * 1024 * 1024;

async function compressImageFile(
  file: File,
  maxEdge: number,
  jpegQuality: number,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const out =
    file.type === "image/png"
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", jpegQuality);
  return out;
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = "16/9",
  placeholder,
  hint,
  maxEdge = 512,
  jpegQuality = 0.82,
}: Props) {
  const t = useTranslations("Growth.settings");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(value ?? "");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("PNG/JPG only");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("< 2MB");
      return;
    }
    setBusy(true);
    try {
      const result = await compressImageFile(file, maxEdge, jpegQuality);
      setPreview(result);
      onChange(result);
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFile(e.dataTransfer.files[0]);
        }}
        className={`relative w-full overflow-hidden rounded-xl border border-dashed border-[var(--growth-border)] bg-black/30 ${aspectClass[aspectRatio]} ${busy ? "opacity-60" : ""}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-[var(--growth-text-sub)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                stroke="var(--growth-gold)"
                strokeWidth="1.5"
                d="M4 7h4l2-3h4l2 3h4v12H4V7zm8 9a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            <span className="text-xs">{placeholder ?? "Drop image or click"}</span>
            {hint ? <span className="text-[10px] opacity-70">{hint}</span> : null}
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {preview ? (
        <button
          type="button"
          onClick={remove}
          className="mt-2 text-xs font-semibold text-rose-300 hover:text-rose-200"
        >
          {t("removeImage")}
        </button>
      ) : null}
      {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
