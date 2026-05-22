import { mkdir, writeFile } from "fs/promises";
import path from "path";

/** Saves base64 cover under /public/uploads/events — small DB value, survives large posters. */
export async function saveEventCoverToPublic(
  eventId: string,
  dataUrl: string,
): Promise<string> {
  const m = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i.exec(dataUrl);
  if (!m) throw new Error("invalid_image");
  const ext = m[1].toLowerCase() === "png" ? "png" : "jpg";
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 2_500_000) throw new Error("image_too_large");

  const relDir = path.join("uploads", "events");
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });
  const filename = `${eventId}.${ext}`;
  await writeFile(path.join(absDir, filename), new Uint8Array(buf));
  return `/${relDir}/${filename}`;
}
