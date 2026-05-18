/** First paragraph, trimmed for cards. */
export function previewParagraph(text: string, max = 140): string {
  const para = text.split(/\n\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (para.length <= max) return para;
  return `${para.slice(0, max).trim()}…`;
}
