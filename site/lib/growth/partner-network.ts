import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/growth/audit-log";
import { resolveLevelName } from "@/lib/growth/level-i18n";

export type NetworkNode = {
  userId: string;
  name: string;
  levelName: string;
  totalXp: number;
  publicSlug: string | null;
  referralCode: string;
  children: NetworkNode[];
};

export type NetworkStats = {
  directCount: number;
  totalCount: number;
  maxDepth: number;
};

export class PartnerNetworkError extends Error {
  constructor(
    public code: "cycle" | "self" | "not_found" | "invalid_parent",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "PartnerNetworkError";
  }
}

/** Returns true if `candidateParentId` is in the downline of `partnerUserId`. */
export async function isDescendantOf(
  partnerUserId: string,
  candidateParentId: string,
): Promise<boolean> {
  let frontier = [partnerUserId];
  const seen = new Set<string>();
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      const children = await prisma.partnerProfile.findMany({
        where: { parentUserId: id },
        select: { userId: true },
      });
      for (const c of children) {
        if (c.userId === candidateParentId) return true;
        next.push(c.userId);
      }
    }
    frontier = next;
  }
  return false;
}

export async function assertNoCycle(
  partnerUserId: string,
  newParentUserId: string | null,
): Promise<void> {
  if (!newParentUserId) return;
  if (partnerUserId === newParentUserId) {
    throw new PartnerNetworkError("self");
  }
  if (await isDescendantOf(partnerUserId, newParentUserId)) {
    throw new PartnerNetworkError("cycle");
  }
}

async function loadActiveDownline(
  parentUserId: string,
  depth: number,
  maxDepth: number,
  locale: string,
): Promise<NetworkNode[]> {
  if (depth > maxDepth) return [];
  const rows = await prisma.partnerProfile.findMany({
    where: {
      parentUserId,
      user: { isActive: true, role: "PARTNER" },
    },
    include: {
      user: { select: { id: true, name: true, email: true, publicSlug: true } },
      currentLevel: { select: { name: true } },
    },
    orderBy: { totalXp: "desc" },
  });

  const nodes: NetworkNode[] = [];
  for (const row of rows) {
    const children = await loadActiveDownline(row.userId, depth + 1, maxDepth, locale);
    nodes.push({
      userId: row.userId,
      name: row.user.name ?? row.user.email,
      levelName: resolveLevelName(row.currentLevel.name, locale),
      totalXp: row.totalXp,
      publicSlug: row.user.publicSlug,
      referralCode: row.referralCode,
      children,
    });
  }
  return nodes;
}

function countTree(nodes: NetworkNode[], depth: number): { total: number; maxDepth: number } {
  let total = 0;
  let maxDepth = depth;
  for (const n of nodes) {
    total += 1;
    const sub = countTree(n.children, depth + 1);
    total += sub.total;
    maxDepth = Math.max(maxDepth, sub.maxDepth);
  }
  return { total, maxDepth };
}

export async function getPartnerNetworkTree(
  rootUserId: string,
  opts?: { maxDepth?: number; locale?: string },
): Promise<{ tree: NetworkNode[]; stats: NetworkStats }> {
  const maxDepth = opts?.maxDepth ?? 3;
  const locale = opts?.locale ?? "ar";
  const tree = await loadActiveDownline(rootUserId, 1, maxDepth, locale);
  const { total, maxDepth: depth } = countTree(tree, 1);
  return {
    tree,
    stats: {
      directCount: tree.length,
      totalCount: total,
      maxDepth: tree.length > 0 ? depth : 0,
    },
  };
}

export type UplineInfo = {
  userId: string;
  name: string;
  publicSlug: string | null;
  referralCode: string;
} | null;

export async function getPartnerUpline(partnerUserId: string): Promise<UplineInfo> {
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: partnerUserId },
    select: { parentUserId: true },
  });
  if (!profile?.parentUserId) return null;
  const parent = await prisma.user.findUnique({
    where: { id: profile.parentUserId },
    include: { partnerProfile: { select: { referralCode: true } } },
  });
  if (!parent?.partnerProfile) return null;
  return {
    userId: parent.id,
    name: parent.name ?? parent.email,
    publicSlug: parent.publicSlug,
    referralCode: parent.partnerProfile.referralCode,
  };
}

export async function setPartnerUpline(
  partnerUserId: string,
  parentUserId: string | null,
  actorId: string,
): Promise<void> {
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: partnerUserId },
    select: { parentUserId: true },
  });
  if (!profile) throw new PartnerNetworkError("not_found");

  if (parentUserId) {
    const parent = await prisma.partnerProfile.findUnique({
      where: { userId: parentUserId },
      select: { userId: true },
    });
    if (!parent) throw new PartnerNetworkError("invalid_parent");
  }

  await assertNoCycle(partnerUserId, parentUserId);

  const previousParentId = profile.parentUserId;
  await prisma.partnerProfile.update({
    where: { userId: partnerUserId },
    data: { parentUserId },
  });

  await logAdminAudit(actorId, "set_partner_upline", "PartnerProfile", partnerUserId, {
    previousParentId,
    newParentId: parentUserId,
  });
}

/** Direct referrals (children) of a partner — for scoped upline assignment. */
export async function listDirectReferralUserIds(parentUserId: string): Promise<string[]> {
  const rows = await prisma.partnerProfile.findMany({
    where: { parentUserId, user: { isActive: true, role: "PARTNER" } },
    select: { userId: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => r.userId);
}

/** Map owner userId → direct referral userIds (for admin create-partner UI). */
export async function buildReferralChildrenMap(): Promise<Record<string, string[]>> {
  const rows = await prisma.partnerProfile.findMany({
    where: { parentUserId: { not: null }, user: { isActive: true, role: "PARTNER" } },
    select: { userId: true, parentUserId: true },
  });
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    const parent = r.parentUserId;
    if (!parent) continue;
    if (!map[parent]) map[parent] = [];
    map[parent].push(r.userId);
  }
  return map;
}

/** Active partners for admin picker (excludes self when provided). */
export async function listPartnersForPicker(excludeUserId?: string) {
  const rows = await prisma.user.findMany({
    where: {
      role: "PARTNER",
      isActive: true,
      partnerProfile: { isNot: null },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      publicSlug: true,
      partnerProfile: { select: { referralCode: true } },
    },
  });
  return rows.map((u) => ({
    userId: u.id,
    name: u.name ?? u.email,
    email: u.email,
    referralCode: u.partnerProfile!.referralCode,
    publicSlug: u.publicSlug,
  }));
}
