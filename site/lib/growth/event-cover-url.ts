/** Normalizes cover paths for <img src> (DB may store /uploads/..., uploads/..., or data: URLs). */
export function resolveEventCoverUrl(cover: string | null | undefined): string | null {
  if (!cover?.trim()) return null;
  const c = cover.trim();
  if (c.startsWith("data:") || c.startsWith("http://") || c.startsWith("https://")) {
    return c;
  }
  if (c.startsWith("/")) return c;
  return `/${c.replace(/^\/+/, "")}`;
}
