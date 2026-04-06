/**
 * Canonical site URL for metadata, JSON-LD, and absolute links.
 * On Netlify, `URL` / `DEPLOY_PRIME_URL` are set when `NEXT_PUBLIC_SITE_URL` is missing.
 */
function getSiteUrlString(): string {
  const a = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (a) return a;
  const netlify = process.env.URL?.trim() ?? process.env.DEPLOY_PRIME_URL?.trim();
  if (netlify) return netlify;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  return "http://localhost:3000";
}

export function getSiteUrl(): URL {
  const raw = getSiteUrlString();
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}
