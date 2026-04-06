import { getSiteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  const url = getSiteUrl().origin;
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "T.E.N.E.G.T.A",
    url,
    description:
      "T.E.N.E.G.T.A builds secure, intelligent systems that help organizations work with higher efficiency and clearer decisions.",
    sameAs: [] as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
