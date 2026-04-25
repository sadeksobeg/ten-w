/**
 * Wrap text in Unicode LRI…PDI so digits and Latin stay left-to-right inside RTL UI.
 * @see https://www.unicode.org/reports/tr9/
 */
export function ltrIsolate(text: string): string {
  return `\u2066${text}\u2069`;
}
