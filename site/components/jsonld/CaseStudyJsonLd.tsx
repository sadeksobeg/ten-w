import { getSiteUrl } from "@/lib/site";

type Props = {
  title: string;
  description: string;
  urlPath: string;
};

export function CaseStudyJsonLd({ title, description, urlPath }: Props) {
  const site = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Organization",
      name: "T.E.N.E.G.T.A",
      url: site.origin,
    },
    publisher: {
      "@type": "Organization",
      name: "T.E.N.E.G.T.A",
      url: site.origin,
    },
    mainEntityOfPage: `${site.origin}${urlPath}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
