import { getSiteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  const origin = getSiteUrl().origin;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: origin,
        name: "T.E.N.E.G.T.A",
        inLanguage: ["ar", "en", "fr"],
        publisher: { "@id": orgId },
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: "T.E.N.E.G.T.A",
        url: origin,
        logo: {
          "@type": "ImageObject",
          url: `${origin}/ar/opengraph-image`,
        },
        description:
          "T.E.N.E.G.T.A builds secure, intelligent systems that help organizations work with higher efficiency and clearer decisions.",
        sameAs: [] as string[],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
