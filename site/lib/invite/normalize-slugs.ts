import { prisma } from "@/lib/prisma";
import { generateSlugBase, generateSlugSuffix } from "@/lib/invite/generate";

export type InviteSlugNormalization = {
  id: string;
  name: string;
  from: string;
  to: string;
};

export type NormalizeInviteSlugsResult = {
  scanned: number;
  updated: number;
  skipped: number;
  changes: InviteSlugNormalization[];
};

/**
 * Rewrites InviteCard.slug to the deduplicated form (name + handle).
 * Stores the previous slug in legacySlug so old links keep working.
 * Touches InviteCard rows only — no PartnerProfile / User role changes.
 */
export async function normalizeAllInviteSlugs(): Promise<NormalizeInviteSlugsResult> {
  const cards = await prisma.inviteCard.findMany({
    orderBy: { createdAt: "asc" },
  });

  const reserved = new Map<string, string>();
  for (const card of cards) {
    reserved.set(card.slug, card.id);
  }

  const planned: InviteSlugNormalization[] = [];

  for (const card of cards) {
    let target = generateSlugBase(card.name, card.handle);
    if (target === card.slug) continue;

    while (reserved.has(target) && reserved.get(target) !== card.id) {
      target = `${generateSlugBase(card.name, card.handle)}-${generateSlugSuffix()}`.slice(0, 80);
    }

    planned.push({
      id: card.id,
      name: card.name,
      from: card.slug,
      to: target,
    });

    reserved.delete(card.slug);
    reserved.set(target, card.id);
  }

  for (const change of planned) {
    await prisma.inviteCard.update({
      where: { id: change.id },
      data: {
        slug: change.to,
        legacySlug: change.from,
      },
    });
  }

  return {
    scanned: cards.length,
    updated: planned.length,
    skipped: cards.length - planned.length,
    changes: planned,
  };
}
