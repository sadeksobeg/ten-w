export const PILLAR_SLUGS = ["ai", "cyber", "software", "infra"] as const;
export type PillarSlug = (typeof PILLAR_SLUGS)[number];

export function isPillarSlug(s: string): s is PillarSlug {
  return (PILLAR_SLUGS as readonly string[]).includes(s);
}
