/** Minimal markdown → HTML string (no external deps). */
export function renderMarkdownLite(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      out.push(`<h2 class="text-lg font-bold mt-4 mb-2">${inline(line.slice(2))}</h2>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push(`<h3 class="text-base font-semibold mt-3 mb-1">${inline(line.slice(3))}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        out.push('<ul class="list-disc ps-5 space-y-1 my-2">');
        inList = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    flushList();
    out.push(`<p class="my-2 text-white/80 leading-relaxed">${inline(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
