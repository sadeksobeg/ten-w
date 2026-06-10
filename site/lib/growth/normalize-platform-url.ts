/** Ensures creator platform URLs pass strict URL validation (adds https:// when omitted). */
export function normalizePlatformUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
