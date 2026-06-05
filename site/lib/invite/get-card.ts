import { prisma } from "@/lib/prisma";

export type InviteCardPublic = {
  id: string;
  name: string;
  handle: string;
  tier: string;
  scope: string;
  message: string;
  token: string;
  slug: string;
  accepted: boolean;
  acceptedAt: Date | null;
  createdAt: Date;
};

function mapRow(row: {
  id: string;
  name: string;
  handle: string;
  tier: string;
  scope: string;
  message: string;
  token: string;
  slug: string;
  accepted: boolean;
  acceptedAt: Date | null;
  createdAt: Date;
}): InviteCardPublic {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle.startsWith("@") ? row.handle : `@${row.handle}`,
    tier: row.tier,
    scope: row.scope,
    message: row.message,
    token: row.token,
    slug: row.slug,
    accepted: row.accepted,
    acceptedAt: row.acceptedAt,
    createdAt: row.createdAt,
  };
}

export async function getInviteCardBySlug(slug: string): Promise<InviteCardPublic | null> {
  const row = await prisma.inviteCard.findUnique({ where: { slug } });
  return row ? mapRow(row) : null;
}

export async function getInviteCardForMetadata(slug: string) {
  const row = await prisma.inviteCard.findUnique({
    where: { slug },
    select: { name: true, message: true, tier: true, slug: true },
  });
  return row;
}

export async function listInviteCards() {
  return prisma.inviteCard.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      handle: true,
      tier: true,
      scope: true,
      slug: true,
      token: true,
      accepted: true,
      acceptedAt: true,
      createdAt: true,
    },
  });
}

export async function getInviteStats() {
  const [total, accepted] = await Promise.all([
    prisma.inviteCard.count(),
    prisma.inviteCard.count({ where: { accepted: true } }),
  ]);
  return { total, accepted, pending: total - accepted };
}
