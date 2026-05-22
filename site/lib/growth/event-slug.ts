import { prisma } from "@/lib/prisma";
import { randomSlugSuffix } from "@/lib/growth/public-slug";

/** URL-safe slug (ASCII only) — avoids 404s with Arabic paths on some hosts/proxies. */
export function eventSlugFromTitle(title: string): string {
  const yearMatch = title.match(/\b(20\d{2})\b/);
  const year = yearMatch?.[1] ?? "";
  const words = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && w !== year);
  const base = (words.slice(0, 5).join("-") || "event").slice(0, 36);
  const prefix = year ? `${year}-` : "";
  return `${prefix}${base}-${randomSlugSuffix()}`;
}

export async function uniqueEventSlug(title: string): Promise<string> {
  let slug = eventSlugFromTitle(title);
  for (let i = 0; i < 12; i += 1) {
    const exists = await prisma.growthEvent.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `event-${randomSlugSuffix(6)}`;
  }
  throw new Error("slug_exhausted");
}

export function normalizeEventRouteSlug(raw: string): string {
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded */
  }
  return s.normalize("NFC");
}
