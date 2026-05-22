export function relativeDate(date: Date | string, locale: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (locale === "ar") {
    if (diffMin < 1) return "الآن";
    if (diffMin < 60) return `منذ ${diffMin} د`;
    if (diffH < 24) return `منذ ${diffH} س`;
    if (diffD === 1) return "أمس";
    if (diffD < 7) return `منذ ${diffD} أيام`;
    return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
  }
  if (locale === "fr") {
    if (diffMin < 1) return "maintenant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    if (diffH < 24) return `il y a ${diffH}h`;
    if (diffD === 1) return "hier";
    return `il y a ${diffD}j`;
  }
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "yesterday";
  return `${diffD}d ago`;
}
