import { getLinkedInUrl } from "@/lib/site-links";
import { getSiteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  const origin = getSiteUrl().origin;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const linkedIn = getLinkedInUrl();

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
          url: `${origin}/tenegta-icon.png`,
        },
        description:
          "T.E.N.E.G.T.A builds secure, intelligent systems that help organizations work with higher efficiency and clearer decisions.",
        areaServed: ["SA", "AE", "SY", "FR", "LB"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: `${origin}/en/contact`,
          availableLanguage: ["Arabic", "English", "French"],
        },
        sameAs: linkedIn ? [linkedIn] : [],
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
