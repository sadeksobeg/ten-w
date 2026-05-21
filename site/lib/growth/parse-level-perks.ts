export function parseLevelPerks(perksJson: unknown): string[] {
  if (perksJson == null) return [];
  if (Array.isArray(perksJson)) {
    return perksJson
      .map((x) => (typeof x === "string" ? x : typeof x === "object" && x && "tag" in x ? String((x as { tag: string }).tag) : ""))
      .filter(Boolean);
  }
  if (typeof perksJson === "object" && perksJson !== null) {
    if ("tag" in perksJson && typeof (perksJson as { tag: string }).tag === "string") {
      return [(perksJson as { tag: string }).tag];
    }
    return Object.entries(perksJson as Record<string, unknown>)
      .map(([k, v]) => (typeof v === "string" ? v : `${k}: ${String(v)}`))
      .filter(Boolean);
  }
  return [];
}
