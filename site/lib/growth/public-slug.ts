const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function slugifyNameForPublic(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return base || "partner";
}

export function randomSlugSuffix(len = 4): string {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)]!;
  }
  return out;
}

export async function uniquePublicSlug(
  db: {
    user: {
      findUnique: (args: { where: { publicSlug: string } }) => Promise<{ id: string } | null>;
    };
  },
  name: string,
): Promise<string> {
  const base = slugifyNameForPublic(name);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const slug = attempt === 0 ? `${base}-${randomSlugSuffix()}` : `${base}-${randomSlugSuffix(6)}`;
    const exists = await db.user.findUnique({ where: { publicSlug: slug } });
    if (!exists) return slug;
  }
  return `${base}-${Date.now().toString(36).slice(-6)}`;
}
