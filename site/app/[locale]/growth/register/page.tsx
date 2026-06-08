import { redirect } from "next/navigation";
import { isPublicRegistrationEnabled } from "@/lib/growth/registration-policy";
import { prisma } from "@/lib/prisma";
import { GrowthRegisterClient } from "./GrowthRegisterClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invite?: string }>;
};

export default async function GrowthRegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { invite: inviteSlug } = await searchParams;
  if (!isPublicRegistrationEnabled()) {
    redirect(`/${locale}/growth/sign-in?closed=1`);
  }

  const inviteCard = inviteSlug
    ? await prisma.inviteCard.findUnique({
        where: { slug: inviteSlug },
        select: { name: true, slug: true, accepted: true },
      })
    : null;

  return (
    <GrowthRegisterClient
      inviteSlug={inviteCard?.accepted ? inviteCard.slug : inviteSlug ?? null}
      defaultName={inviteCard?.name ?? ""}
    />
  );
}
