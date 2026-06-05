import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TenegtaInviteExperience } from "@/components/invite/TenegtaInviteExperience";
import { getInviteCardBySlug, getInviteCardForMetadata } from "@/lib/invite/get-card";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await getInviteCardForMetadata(slug);
  if (!card) {
    return { title: "Invitation — TENEGTA" };
  }

  const title = `${card.name} — TENEGTA Access`;
  const description = card.message.slice(0, 160);
  const url = `${getSiteUrl().origin}/invite/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "T.E.N.E.G.T.A",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InviteSlugPage({ params }: Props) {
  const { slug } = await params;
  const card = await getInviteCardBySlug(slug);
  if (!card) notFound();

  return <TenegtaInviteExperience card={card} />;
}
