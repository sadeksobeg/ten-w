/** Build an iframe-safe embed URL from a public YouTube/Vimeo/watch URL. */
export function toVideoEmbedSrc(url: string): string | null {
  const u = url.trim();
  if (!u.startsWith("http")) return null;

  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com") || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = parsed.pathname.match(/\/embed\/([^/]+)/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }

    if (host.includes("vimeo.com")) {
      const m = parsed.pathname.match(/\/(\d+)/);
      if (m?.[1]) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}
