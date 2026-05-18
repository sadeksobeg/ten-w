import { getSiteUrl } from "@/lib/site";

type Props = {
  title: string;
  description: string;
  datePublished: string;
  urlPath: string;
};

export function ArticleJsonLd({ title, description, datePublished, urlPath }: Props) {
  const site = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    url: `${site.origin}${urlPath}`,
    author: { "@type": "Organization", name: "T.E.N.E.G.T.A" },
    publisher: { "@type": "Organization", name: "T.E.N.E.G.T.A" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
