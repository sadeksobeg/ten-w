/** Public profile URLs for JSON-LD sameAs and footer. */
export function getLinkedInUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim() ||
    "https://www.linkedin.com/in/sadek-al-etr-084b34205"
  );
}
